import 'dotenv/config';
import bcrypt from 'bcryptjs';
import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { v4 as uuidv4 } from 'uuid';
import { initSchema, query, withTransaction } from './db.js';
import {
  DIMENSIONS,
  buildInterpretationPayload,
  buildResultNarrative,
  computeDimensionScores,
  getQuestionnaire
} from './questionnaire.js';

const app = express();
const port = Number(process.env.PORT || 4000);
const bcryptRounds = Number(process.env.BCRYPT_ROUNDS || 12);
const matchThreshold = Number(process.env.MATCH_COMPATIBILITY_THRESHOLD || 75);
const avatarMaxLength = Number(process.env.AVATAR_MAX_LENGTH || 6000000);

const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((v) => v.trim())
  .filter(Boolean);

app.set('trust proxy', process.env.TRUST_PROXY || 1);
app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    }
  })
);
app.use(express.json({ limit: process.env.JSON_BODY_LIMIT || '8mb' }));

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_GLOBAL_MAX || 300),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Try again in a few minutes.' }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_AUTH_MAX || 25),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many auth attempts. Please wait before retrying.' }
});

const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_SIGNUP_MAX || 8),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Signup temporarily limited. Try again later.' }
});

const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: Number(process.env.RATE_LIMIT_CHAT_MAX || 40),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'You are sending messages too quickly. Please slow down.' }
});

const moderationPatterns = [
  { key: 'violence', re: /\b(kill you|rape|murder|stab you|i will hurt you)\b/i },
  { key: 'hate', re: /\b(nazi|kike|chink|spic|raghead|go back to your country)\b/i },
  { key: 'minor-sexual', re: /\b(underage sex|child porn|minor nudes|teen nudes)\b/i },
  { key: 'coercion', re: /\b(send nudes|nudes now|or i leak|blackmail)\b/i },
  { key: 'scam', re: /\b(send money|wire transfer|crypto wallet|investment scheme|gift card code)\b/i }
];
const badWords = ['fuck', 'sex', 'hate', 'kill'];

app.use(globalLimiter);

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

function safeInt(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function normalizeContactKey(value) {
  const raw = String(value || '').trim().toLowerCase();
  if (!raw) return null;
  if (raw.includes('@')) return raw;
  const digits = raw.replace(/[^0-9]/g, '');
  if (digits.length >= 7) return digits;
  return null;
}

function normalizeLanguage(value) {
  const v = String(value || '').trim().toLowerCase();
  if (!v) return null;
  return v;
}

function parseDefaultQuestionsStored(value) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(String(value));
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item) => String(item || '').trim())
      .filter(Boolean)
      .slice(0, 5);
  } catch {
    return [];
  }
}

function normalizeDefaultQuestions(value) {
  if (value === undefined) return { provided: false, list: null };
  if (value === null) return { provided: true, list: null };

  const source = Array.isArray(value)
    ? value
    : String(value || '')
        .split('\n')
        .map((line) => line.trim());

  const list = source
    .map((item) => String(item || '').trim())
    .filter(Boolean)
    .slice(0, 5);

  if (list.some((item) => item.length > 160)) {
    return { provided: true, error: 'Each default question must be 160 characters or less' };
  }
  return { provided: true, list };
}

function titleCase(value) {
  return String(value || '')
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function getCommunitySuggestions(language) {
  const lang = normalizeLanguage(language);
  if (!lang) return [];
  if (lang === 'english') return ['British community', 'American community', 'Chinese community'];
  if (lang === 'chinese') return ['Chinese community', 'American community'];
  const root = `${titleCase(lang)} community`;
  return [root, 'Chinese community', 'American community'];
}

function communityRoomId(label) {
  const slug = String(label || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `community-${slug}`;
}

function toBool(value) {
  return value === true || value === 't' || value === 1 || value === '1';
}

function isPremiumUser(user) {
  if (!toBool(user.is_premium)) return false;
  if (!user.premium_until) return false;
  return new Date(user.premium_until).getTime() > Date.now();
}

function parseMatchRoomId(roomId) {
  const match = /^match-(\d+)-(\d+)$/.exec(roomId);
  if (!match) return null;
  const a = Number(match[1]);
  const b = Number(match[2]);
  if (!Number.isInteger(a) || !Number.isInteger(b) || a === b) return null;
  return { a: Math.min(a, b), b: Math.max(a, b) };
}

function containsBadWord(text) {
  const value = String(text || '').toLowerCase();
  return badWords.some((word) => value.includes(word));
}

async function auth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.replace('Bearer ', '').trim();
    if (!token) return res.status(401).json({ error: 'Missing token' });

    const { rows } = await query(
      `SELECT u.id::int AS id, u.email, u.name, u.age, u.gender, u.preference, u.bio, u.avatar_url, u.default_questions,
              u.private_profile_completed, u.private_email, u.private_phone, u.private_location, u.private_notes,
              u.is_premium, u.premium_until, u.connect_contacts_enabled, u.preferred_language, u.community_label, u.terms_accepted_at,
              u.is_permanently_blocked, u.permanent_block_reason, u.permanently_blocked_at, u.created_at
       FROM sessions s
       JOIN users u ON u.id = s.user_id
       WHERE s.token = $1`,
      [token]
    );

    if (!rows[0]) return res.status(401).json({ error: 'Invalid token' });
    if (toBool(rows[0].is_permanently_blocked)) {
      return res.status(403).json({ error: 'Your account has been permanently blocked for community safety.' });
    }
    req.user = {
      ...rows[0],
      default_questions: parseDefaultQuestionsStored(rows[0].default_questions)
    };
    req.token = token;
    return next();
  } catch (error) {
    return next(error);
  }
}

function requireModerationAuth(req, res, next) {
  const moderationToken = String(process.env.MODERATION_TOKEN || '').trim();
  if (!moderationToken) return res.status(503).json({ error: 'Moderation API is not configured' });
  const token = String(req.headers['x-moderation-token'] || '').trim();
  if (!token || token !== moderationToken) return res.status(401).json({ error: 'Invalid moderation token' });
  return next();
}

app.get('/health', (_req, res) => {
  res.json({ ok: true, env: process.env.NODE_ENV || 'development' });
});

app.get('/', (_req, res) => {
  res.json({
    ok: true,
    service: 'EcoMind API',
    health: '/health'
  });
});

app.post('/auth/signup', authLimiter, signupLimiter, async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || '');
    const name = String(req.body.name || '').trim();
    const termsAccepted = req.body.termsAccepted === true;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }
    if (!termsAccepted) {
      return res.status(400).json({ error: 'You must agree to Terms & Community Guidelines to create an account.' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const passwordHash = await bcrypt.hash(password, bcryptRounds);

    const inserted = await query(
      `INSERT INTO users (email, password_hash, name, terms_accepted_at, created_at)
       VALUES ($1, $2, $3, NOW(), NOW())
       ON CONFLICT(email) DO NOTHING
       RETURNING id::int AS id`,
      [email, passwordHash, name]
    );

    if (!inserted.rows[0]) {
      return res.status(409).json({ error: 'Email already exists' });
    }

    const token = uuidv4();
    await query('INSERT INTO sessions (token, user_id, created_at) VALUES ($1, $2, NOW())', [
      token,
      inserted.rows[0].id
    ]);

    return res.json({ token });
  } catch (error) {
    return next(error);
  }
});

app.post('/auth/login', authLimiter, async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || '');
    const ip = req.ip || 'unknown';

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const failedAttempts = await query(
      `SELECT COUNT(*)::int AS count
       FROM login_attempts
       WHERE email = $1 AND ip = $2 AND success = FALSE
         AND created_at > NOW() - INTERVAL '15 minutes'`,
      [email, ip]
    );

    if (failedAttempts.rows[0].count >= Number(process.env.AUTH_FAIL_MAX_15M || 5)) {
      return res.status(429).json({ error: 'Too many failed login attempts. Try again later.' });
    }

    const userLookup = await query(
      'SELECT id::int AS id, password_hash, is_permanently_blocked FROM users WHERE email = $1',
      [email]
    );
    const user = userLookup.rows[0];
    const valid = user ? await bcrypt.compare(password, user.password_hash) : false;

    await query(
      'INSERT INTO login_attempts (email, ip, success, created_at) VALUES ($1, $2, $3, NOW())',
      [email, ip, valid]
    );

    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    if (toBool(user.is_permanently_blocked)) {
      return res.status(403).json({ error: 'This account is permanently blocked for community safety.' });
    }

    const token = uuidv4();
    await query('INSERT INTO sessions (token, user_id, created_at) VALUES ($1, $2, NOW())', [token, user.id]);

    return res.json({ token });
  } catch (error) {
    return next(error);
  }
});

app.post('/auth/logout', auth, async (req, res, next) => {
  try {
    await query('DELETE FROM sessions WHERE token = $1', [req.token]);
    return res.json({ ok: true });
  } catch (error) {
    return next(error);
  }
});

app.get('/me', auth, async (req, res, next) => {
  try {
    const scoreRows = await query(
      'SELECT dimension, score FROM dimension_scores WHERE user_id = $1 ORDER BY dimension',
      [req.user.id]
    );
    const scores = Object.fromEntries(scoreRows.rows.map((row) => [row.dimension, row.score]));

    res.json({
      user: req.user,
      profileComplete: req.user.age !== null && req.user.preference !== null,
      privateProfileComplete: toBool(req.user.private_profile_completed),
      premium: {
        isPremium: isPremiumUser(req.user),
        premiumUntil: req.user.premium_until
      },
      connectContactsEnabled: toBool(req.user.connect_contacts_enabled),
      termsAccepted: Boolean(req.user.terms_accepted_at),
      preferredLanguage: req.user.preferred_language || null,
      communityLabel: req.user.community_label || null,
      communityPrompt:
        req.user.preferred_language
          ? `Would you like to join ${getCommunitySuggestions(req.user.preferred_language).join(' or ')}?`
          : null,
      scores,
      interpretations: buildInterpretationPayload(scores)
    });
  } catch (error) {
    next(error);
  }
});

app.post('/compliance/accept-terms', auth, async (req, res, next) => {
  try {
    await query('UPDATE users SET terms_accepted_at = COALESCE(terms_accepted_at, NOW()) WHERE id = $1', [req.user.id]);
    return res.json({ ok: true, termsAccepted: true });
  } catch (error) {
    return next(error);
  }
});

app.put('/profile', auth, async (req, res, next) => {
  try {
    const { name, age, gender, preference, bio, preferredLanguage, avatarUrl, defaultQuestions } = req.body;
    if (age !== undefined && (!Number.isInteger(age) || age < 18 || age > 100)) {
      return res.status(400).json({ error: 'Age must be an integer between 18 and 100' });
    }
    if (name !== undefined && (!String(name).trim() || String(name).trim().length > 120)) {
      return res.status(400).json({ error: 'Name must be between 1 and 120 characters' });
    }

    const hasAvatarUpdate = Object.prototype.hasOwnProperty.call(req.body || {}, 'avatarUrl');
    const normalizedAvatar = hasAvatarUpdate ? String(avatarUrl || '').trim() || null : null;
    if (typeof normalizedAvatar === 'string' && normalizedAvatar.length > avatarMaxLength) {
      return res.status(400).json({ error: 'Avatar URL is too long' });
    }
    const normalizedQuestions = normalizeDefaultQuestions(defaultQuestions);
    if (normalizedQuestions.error) {
      return res.status(400).json({ error: normalizedQuestions.error });
    }
    const serializedQuestions =
      normalizedQuestions.list === null ? null : JSON.stringify(normalizedQuestions.list);

    await query(
      `UPDATE users
       SET age = COALESCE($1, age),
           gender = COALESCE($2, gender),
           preference = COALESCE($3, preference),
           bio = COALESCE($4, bio),
           preferred_language = COALESCE($5, preferred_language),
           avatar_url = CASE WHEN $6 THEN $7 ELSE avatar_url END,
           name = COALESCE($8, name),
           default_questions = CASE WHEN $9 THEN $10 ELSE default_questions END
       WHERE id = $11`,
      [
        age ?? null,
        typeof gender === 'string' && gender.trim() ? gender.trim() : null,
        typeof preference === 'string' && preference.trim() ? preference.trim() : null,
        typeof bio === 'string' && bio.trim() ? bio.trim() : null,
        normalizeLanguage(preferredLanguage),
        hasAvatarUpdate,
        normalizedAvatar,
        typeof name === 'string' && name.trim() ? name.trim() : null,
        normalizedQuestions.provided,
        serializedQuestions,
        req.user.id
      ]
    );

    const updated = await query(
      `SELECT id::int AS id, email, name, age, gender, preference, bio, avatar_url, default_questions,
              private_profile_completed, private_email, private_phone, private_location, private_notes,
              is_premium, premium_until, connect_contacts_enabled, preferred_language, community_label, created_at
       FROM users WHERE id = $1`,
      [req.user.id]
    );

    return res.json({
      user: {
        ...updated.rows[0],
        default_questions: parseDefaultQuestionsStored(updated.rows[0].default_questions)
      }
    });
  } catch (error) {
    return next(error);
  }
});

app.put('/profile/private', auth, async (req, res, next) => {
  try {
    const privateEmail = String(req.body.privateEmail || '').trim() || null;
    const privatePhone = String(req.body.privatePhone || '').trim() || null;
    const privateLocation = String(req.body.privateLocation || '').trim() || null;
    const privateNotes = String(req.body.privateNotes || '').trim() || null;

    await query(
      `UPDATE users
       SET private_email = $1,
           private_phone = $2,
           private_location = $3,
           private_notes = $4,
           private_profile_completed = TRUE
       WHERE id = $5`,
      [privateEmail, privatePhone, privateLocation, privateNotes, req.user.id]
    );

    const updated = await query(
      `SELECT id::int AS id, email, name, age, gender, preference, bio, avatar_url, default_questions,
              private_profile_completed, private_email, private_phone, private_location, private_notes,
              is_premium, premium_until, connect_contacts_enabled, preferred_language, community_label, created_at
       FROM users WHERE id = $1`,
      [req.user.id]
    );
    return res.json({
      user: {
        ...updated.rows[0],
        default_questions: parseDefaultQuestionsStored(updated.rows[0].default_questions)
      },
      privateProfileComplete: true
    });
  } catch (error) {
    return next(error);
  }
});

app.post('/billing/upgrade-monthly', auth, async (req, res, next) => {
  try {
    await withTransaction(async (client) => {
      await client.query(
        `UPDATE users
         SET is_premium = TRUE,
             premium_until = GREATEST(COALESCE(premium_until, NOW()), NOW()) + INTERVAL '30 days'
         WHERE id = $1`,
        [req.user.id]
      );
      await client.query(
        `INSERT INTO premium_events (user_id, event_type, amount_usd, created_at)
         VALUES ($1, 'purchase_monthly', 2.89, NOW())`,
        [req.user.id]
      );
    });

    const user = await query('SELECT is_premium, premium_until FROM users WHERE id = $1', [req.user.id]);
    return res.json({
      ok: true,
      plan: 'SOUL_PREMIUM_MONTHLY',
      chargedUsd: 2.89,
      isPremium: isPremiumUser(user.rows[0]),
      premiumUntil: user.rows[0].premium_until
    });
  } catch (error) {
    return next(error);
  }
});

app.get('/billing/history', auth, async (req, res, next) => {
  try {
    const result = await query(
      `SELECT id::int AS id, event_type, amount_usd::float AS amount_usd, created_at
       FROM premium_events
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 100`,
      [req.user.id]
    );
    return res.json({ events: result.rows });
  } catch (error) {
    return next(error);
  }
});

app.post('/billing/restore', auth, async (req, res, next) => {
  try {
    const hasHistory = await query(
      `SELECT id FROM premium_events
       WHERE user_id = $1 AND event_type = 'purchase_monthly'
       ORDER BY created_at DESC
       LIMIT 1`,
      [req.user.id]
    );

    if (!hasHistory.rows[0]) {
      return res.json({ restored: false, message: 'No prior premium purchases found.' });
    }

    await withTransaction(async (client) => {
      await client.query(
        `UPDATE users
         SET is_premium = TRUE,
             premium_until = GREATEST(COALESCE(premium_until, NOW()), NOW()) + INTERVAL '30 days'
         WHERE id = $1`,
        [req.user.id]
      );
      await client.query(
        `INSERT INTO premium_events (user_id, event_type, amount_usd, created_at)
         VALUES ($1, 'restore', 0, NOW())`,
        [req.user.id]
      );
    });

    const user = await query('SELECT is_premium, premium_until FROM users WHERE id = $1', [req.user.id]);
    return res.json({
      restored: true,
      isPremium: isPremiumUser(user.rows[0]),
      premiumUntil: user.rows[0].premium_until
    });
  } catch (error) {
    return next(error);
  }
});

app.put('/contacts/preferences', auth, async (req, res, next) => {
  try {
    const enabled = Boolean(req.body.enabled);
    const contacts = Array.isArray(req.body.contacts) ? req.body.contacts : [];
    const normalized = [...new Set(contacts.map(normalizeContactKey).filter(Boolean))].slice(0, 400);

    await withTransaction(async (client) => {
      await client.query('UPDATE users SET connect_contacts_enabled = $1 WHERE id = $2', [enabled, req.user.id]);
      await client.query('DELETE FROM user_contacts WHERE owner_id = $1', [req.user.id]);
      for (const key of normalized) {
        await client.query(
          `INSERT INTO user_contacts (owner_id, contact_key, created_at)
           VALUES ($1, $2, NOW())
           ON CONFLICT(owner_id, contact_key) DO NOTHING`,
          [req.user.id, key]
        );
      }
    });

    return res.json({ ok: true, enabled, contactCount: normalized.length });
  } catch (error) {
    return next(error);
  }
});

app.get('/contacts/preferences', auth, async (req, res, next) => {
  try {
    const count = await query('SELECT COUNT(*)::int AS count FROM user_contacts WHERE owner_id = $1', [req.user.id]);
    return res.json({
      enabled: toBool(req.user.connect_contacts_enabled),
      contactCount: count.rows[0].count
    });
  } catch (error) {
    return next(error);
  }
});

app.get('/community/suggestions', auth, async (req, res, next) => {
  try {
    const language = req.user.preferred_language;
    if (!language) {
      return res.status(400).json({ error: 'Set preferred language first' });
    }
    const suggestions = getCommunitySuggestions(language);
    return res.json({
      preferredLanguage: language,
      prompt: `Would you like to join ${suggestions.join(' or ')}?`,
      suggestions
    });
  } catch (error) {
    return next(error);
  }
});

app.post('/community/join', auth, async (req, res, next) => {
  try {
    const language = req.user.preferred_language;
    if (!language) return res.status(400).json({ error: 'Set preferred language first' });

    const label = String(req.body.communityLabel || '').trim();
    const suggestions = getCommunitySuggestions(language);
    if (!suggestions.includes(label)) {
      return res.status(400).json({ error: 'Community not available for current preferred language' });
    }

    await query('UPDATE users SET community_label = $1 WHERE id = $2', [label, req.user.id]);
    return res.json({ ok: true, communityLabel: label });
  } catch (error) {
    return next(error);
  }
});

app.post('/community/leave', auth, async (req, res, next) => {
  try {
    await query('UPDATE users SET community_label = NULL WHERE id = $1', [req.user.id]);
    return res.json({ ok: true });
  } catch (error) {
    return next(error);
  }
});

app.get('/community/messages', auth, async (req, res, next) => {
  try {
    const userRow = await query('SELECT community_label FROM users WHERE id = $1', [req.user.id]);
    const communityLabel = userRow.rows[0]?.community_label;
    if (!communityLabel) return res.status(403).json({ error: 'Join a community first' });

    const roomId = communityRoomId(communityLabel);
    const rows = await query(
      `SELECT m.id::int AS id, m.text, m.image_url, m.created_at,
              u.id::int AS sender_id, u.name AS sender_name
       FROM messages m
       JOIN users u ON u.id = m.sender_id
       WHERE m.room_id = $1
       ORDER BY m.id DESC
       LIMIT 200`,
      [roomId]
    );

    return res.json({ communityLabel, messages: rows.rows.reverse() });
  } catch (error) {
    return next(error);
  }
});

app.post('/community/messages', auth, async (req, res, next) => {
  try {
    const userRow = await query('SELECT community_label FROM users WHERE id = $1', [req.user.id]);
    const communityLabel = userRow.rows[0]?.community_label;
    if (!communityLabel) return res.status(403).json({ error: 'Join a community first' });

    const text = String(req.body.text || '').trim();
    const imageUrl = String(req.body.imageUrl || '').trim();
    if (!text && !imageUrl) return res.status(400).json({ error: 'Message must include text or image' });
    if (text && containsBadWord(text)) {
      return res.status(400).json({
        error: 'Message violates community guidelines. Please remove abusive, explicit, or hateful words.'
      });
    }
    if (text.length > 1000) return res.status(400).json({ error: 'Message too long' });
    if (imageUrl.length > 6_000_000) return res.status(400).json({ error: 'Image payload is too large' });

    const roomId = communityRoomId(communityLabel);
    const inserted = await query(
      `INSERT INTO messages (room_id, sender_id, text, image_url, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING id::int AS id, created_at`,
      [roomId, req.user.id, text, imageUrl || null]
    );

    return res.json({
      id: inserted.rows[0].id,
      communityLabel,
      text,
      imageUrl: imageUrl || null,
      createdAt: inserted.rows[0].created_at,
      senderId: req.user.id,
      senderName: req.user.name
    });
  } catch (error) {
    return next(error);
  }
});

app.get('/questionnaire/:formType', auth, (req, res) => {
  const formType = req.params.formType === 'long' ? 'long' : 'short';
  res.json({
    formType,
    scale: [
      { value: 1, label: 'Not true for me' },
      { value: 2, label: 'Slightly true for me' },
      { value: 3, label: 'Somewhat true for me' },
      { value: 4, label: 'Mostly true for me' },
      { value: 5, label: 'Very true for me' }
    ],
    dimensions: DIMENSIONS,
    items: getQuestionnaire(formType)
  });
});

app.post('/questionnaire/submit', auth, async (req, res, next) => {
  try {
    const { formType = 'short', responses } = req.body;
    if (!responses || typeof responses !== 'object') {
      return res.status(400).json({ error: 'Responses object is required' });
    }

    const normalizedFormType = formType === 'long' ? 'long' : 'short';
    const items = getQuestionnaire(normalizedFormType);

    await withTransaction(async (client) => {
      await client.query('DELETE FROM responses WHERE user_id = $1 AND form_type = $2', [
        req.user.id,
        normalizedFormType
      ]);

      for (const item of items) {
        const value = responses[item.id];
        if (typeof value === 'number' && value >= 1 && value <= 5) {
          await client.query(
            'INSERT INTO responses (user_id, form_type, item_id, value, created_at) VALUES ($1, $2, $3, $4, NOW())',
            [req.user.id, normalizedFormType, item.id, value]
          );
        }
      }
    });

    const scores = computeDimensionScores(normalizedFormType, responses);
    for (const [dimension, score] of Object.entries(scores)) {
      await query(
        `INSERT INTO dimension_scores (user_id, dimension, score, updated_at)
         VALUES ($1, $2, $3, NOW())
         ON CONFLICT(user_id, dimension)
         DO UPDATE SET score = EXCLUDED.score, updated_at = EXCLUDED.updated_at`,
        [req.user.id, dimension, score]
      );
    }

    const narrative = buildResultNarrative(scores);
    const interpretations = buildInterpretationPayload(scores);
    return res.json({ scores, narrative, interpretations });
  } catch (error) {
    return next(error);
  }
});

app.get('/insights', auth, async (req, res, next) => {
  try {
    const scoreRows = await query('SELECT dimension, score FROM dimension_scores WHERE user_id = $1 ORDER BY dimension', [
      req.user.id
    ]);
    const scores = Object.fromEntries(scoreRows.rows.map((row) => [row.dimension, row.score]));
    return res.json({
      scores,
      interpretations: buildInterpretationPayload(scores)
    });
  } catch (error) {
    return next(error);
  }
});

function calculateCompatibility(a, b) {
  const dimensions = Object.keys(DIMENSIONS);
  let squared = 0;
  let count = 0;

  for (const d of dimensions) {
    if (typeof a[d] === 'number' && typeof b[d] === 'number') {
      squared += (a[d] - b[d]) ** 2;
      count += 1;
    }
  }

  if (count < 5) return null;
  const distance = Math.sqrt(squared / count);
  return Math.max(0, Math.min(100, Math.round(100 - (distance / 4) * 100)));
}

async function getBlockedIds(userId) {
  const rows = await query(
    `SELECT blocked_user_id AS user_id FROM blocks WHERE blocker_id = $1
     UNION
     SELECT blocker_id AS user_id FROM blocks WHERE blocked_user_id = $1`,
    [userId]
  );
  return new Set(rows.rows.map((row) => safeInt(row.user_id)).filter(Boolean));
}

async function getUserScores(userId) {
  const rows = await query('SELECT dimension, score FROM dimension_scores WHERE user_id = $1', [userId]);
  return Object.fromEntries(rows.rows.map((row) => [row.dimension, row.score]));
}

async function getUserMini(userId) {
  const rows = await query(
    `SELECT id::int AS id, name, is_premium, premium_until, preferred_language, community_label, is_permanently_blocked
     FROM users WHERE id = $1`,
    [userId]
  );
  return rows.rows[0] || null;
}

function detectViolationSignals(texts = []) {
  for (const text of texts) {
    const value = String(text || '');
    for (const pattern of moderationPatterns) {
      if (pattern.re.test(value)) {
        return { matched: true, key: pattern.key };
      }
    }
  }
  return { matched: false, key: null };
}

async function applyPermanentBlock(targetUserId, reason) {
  await withTransaction(async (client) => {
    await client.query(
      `UPDATE users
       SET is_permanently_blocked = TRUE,
           permanent_block_reason = COALESCE($2, permanent_block_reason),
           permanently_blocked_at = COALESCE(permanently_blocked_at, NOW())
       WHERE id = $1`,
      [targetUserId, reason]
    );
    await client.query('DELETE FROM sessions WHERE user_id = $1', [targetUserId]);
  });
}

async function evaluateReportModeration({ targetUserId, messageId, reason }) {
  let resolvedTargetUserId = targetUserId || null;
  const evidence = [String(reason || '').trim()];

  if (messageId) {
    const messageResult = await query(
      `SELECT sender_id::int AS sender_id, text
       FROM messages
       WHERE id = $1
       LIMIT 1`,
      [messageId]
    );
    if (messageResult.rows[0]) {
      resolvedTargetUserId = resolvedTargetUserId || safeInt(messageResult.rows[0].sender_id);
      if (messageResult.rows[0].text) evidence.push(messageResult.rows[0].text);
    }
  }

  if (!resolvedTargetUserId) {
    return { shouldBlock: false, reason: null, targetUserId: null };
  }

  const recentMessages = await query(
    `SELECT text
     FROM messages
     WHERE sender_id = $1
       AND created_at > NOW() - INTERVAL '7 days'
     ORDER BY id DESC
     LIMIT 30`,
    [resolvedTargetUserId]
  );
  for (const row of recentMessages.rows) {
    if (row.text) evidence.push(row.text);
  }

  const signal = detectViolationSignals(evidence);
  const reportStats = await query(
    `SELECT COUNT(*)::int AS total_reports, COUNT(DISTINCT reporter_id)::int AS unique_reporters
     FROM reports
     WHERE target_user_id = $1
       AND created_at > NOW() - INTERVAL '7 days'`,
    [resolvedTargetUserId]
  );
  const totalReports = safeInt(reportStats.rows[0]?.total_reports) || 0;
  const uniqueReporters = safeInt(reportStats.rows[0]?.unique_reporters) || 0;

  if (signal.matched) {
    return {
      shouldBlock: true,
      reason: `Automatic moderation matched "${signal.key}"`,
      targetUserId: resolvedTargetUserId
    };
  }

  if (totalReports >= 5 && uniqueReporters >= 3) {
    return {
      shouldBlock: true,
      reason: 'Automatic moderation: repeated safety reports',
      targetUserId: resolvedTargetUserId
    };
  }

  return { shouldBlock: false, reason: null, targetUserId: resolvedTargetUserId };
}

function candidateContactKeys(candidate) {
  const keys = [];
  const email = normalizeContactKey(candidate.email);
  const phone = normalizeContactKey(candidate.private_phone);
  if (email) keys.push(email);
  if (phone) keys.push(phone);
  return keys;
}

async function ensureRoomAccess(roomId, currentUserId) {
  const room = parseMatchRoomId(roomId);
  if (!room) return { ok: false, error: 'Invalid roomId format' };
  if (currentUserId !== room.a && currentUserId !== room.b) return { ok: false, error: 'Forbidden room access' };

  const [userA, userB] = await Promise.all([getUserMini(room.a), getUserMini(room.b)]);
  if (!userA || !userB) return { ok: false, error: 'User not found for room' };
  if (toBool(userA.is_permanently_blocked) || toBool(userB.is_permanently_blocked)) {
    return { ok: false, error: 'This chat is unavailable due to a community safety block' };
  }
  if (!userA.preferred_language || !userB.preferred_language) {
    return { ok: false, error: 'Both users must set preferred language before starting private chat' };
  }

  if (isPremiumUser(userA) || isPremiumUser(userB)) {
    return { ok: true, compatibility: 100 };
  }

  const [scoresA, scoresB] = await Promise.all([getUserScores(room.a), getUserScores(room.b)]);
  const compatibility = calculateCompatibility(scoresA, scoresB);
  if (compatibility === null || compatibility < matchThreshold) {
    return { ok: false, error: 'Chat is available only for strong soul resonance matches' };
  }
  return { ok: true, compatibility };
}

app.get('/matches', auth, async (req, res, next) => {
  try {
    const mePremium = isPremiumUser(req.user);
    const contactDiscoveryOn = toBool(req.user.connect_contacts_enabled);
    const myRows = await query('SELECT dimension, score FROM dimension_scores WHERE user_id = $1', [req.user.id]);
    const myScores = Object.fromEntries(myRows.rows.map((row) => [row.dimension, row.score]));
    const blockedIds = await getBlockedIds(req.user.id);
    const contactSet = new Set();

    if (contactDiscoveryOn) {
      const contactRows = await query('SELECT contact_key FROM user_contacts WHERE owner_id = $1', [req.user.id]);
      for (const row of contactRows.rows) {
        if (row.contact_key) contactSet.add(row.contact_key);
      }
    }

    const otherUsers = await query(
      `SELECT u.id::int AS id, u.name, u.age, u.gender, u.preference, u.bio, u.avatar_url, u.default_questions, u.email, u.private_phone,
              u.preferred_language, u.community_label, d.dimension, d.score
       FROM users u
       JOIN dimension_scores d ON d.user_id = u.id
       WHERE u.id != $1
         AND u.is_permanently_blocked = FALSE`,
      [req.user.id]
    );

    const grouped = {};
    for (const row of otherUsers.rows) {
      if (!grouped[row.id]) {
        grouped[row.id] = {
          id: row.id,
          name: row.name,
          age: row.age,
          gender: row.gender,
          preference: row.preference,
          bio: row.bio,
          avatar_url: row.avatar_url,
          default_questions: parseDefaultQuestionsStored(row.default_questions),
          email: row.email,
          private_phone: row.private_phone,
          preferred_language: row.preferred_language,
          community_label: row.community_label,
          scores: {}
        };
      }
      grouped[row.id].scores[row.dimension] = row.score;
    }

    const matches = Object.values(grouped)
      .filter((candidate) => !blockedIds.has(candidate.id))
      .map((candidate) => ({
        ...candidate,
        compatibility: calculateCompatibility(myScores, candidate.scores),
        contactPriority:
          contactDiscoveryOn &&
          candidateContactKeys(candidate).some((key) => contactSet.has(key))
            ? 1
            : 0
      }))
      .filter((m) => m.compatibility !== null && (mePremium || m.compatibility >= matchThreshold))
      .sort((a, b) => b.contactPriority - a.contactPriority || b.compatibility - a.compatibility)
      .slice(0, 20);

    return res.json({
      matches: matches.map(({ email, private_phone, contactPriority, ...safe }) => safe)
    });
  } catch (error) {
    return next(error);
  }
});

app.get('/chat/messages', auth, async (req, res, next) => {
  try {
    const roomId = String(req.query.roomId || '');
    if (!roomId) return res.status(400).json({ error: 'roomId is required' });

    const roomAccess = await ensureRoomAccess(roomId, req.user.id);
    if (!roomAccess.ok) return res.status(403).json({ error: roomAccess.error });

    const blockedIds = await getBlockedIds(req.user.id);

    const messageRows = await query(
      `SELECT m.id::int AS id, m.text, m.image_url, m.created_at, u.id::int AS sender_id, u.name AS sender_name
       FROM messages m
       JOIN users u ON u.id = m.sender_id
       WHERE m.room_id = $1
       ORDER BY m.id DESC
       LIMIT 100`,
      [roomId]
    );

    const messages = messageRows.rows.filter((message) => !blockedIds.has(message.sender_id)).reverse();
    return res.json({ roomId, messages });
  } catch (error) {
    return next(error);
  }
});

app.get('/chat/rooms', auth, async (req, res, next) => {
  try {
    const myScores = await getUserScores(req.user.id);
    const blockedIds = await getBlockedIds(req.user.id);

    const roomRows = await query(
      `SELECT DISTINCT ON (m.room_id)
              m.room_id,
              m.id::int AS id,
              m.text,
              m.image_url,
              m.created_at,
              u.id::int AS sender_id,
              u.name AS sender_name
       FROM messages m
       JOIN users u ON u.id = m.sender_id
       WHERE m.room_id LIKE 'match-%'
         AND (split_part(m.room_id, '-', 2)::bigint = $1 OR split_part(m.room_id, '-', 3)::bigint = $1)
       ORDER BY m.room_id, m.id DESC`,
      [req.user.id]
    );

    const parsedRooms = roomRows.rows
      .map((row) => {
        const room = parseMatchRoomId(row.room_id);
        if (!room) return null;
        const otherUserId = room.a === req.user.id ? room.b : room.a;
        if (!otherUserId || blockedIds.has(otherUserId)) return null;
        return {
          roomId: row.room_id,
          otherUserId,
          lastMessage: {
            id: row.id,
            text: row.text,
            image_url: row.image_url,
            created_at: row.created_at,
            sender_id: row.sender_id,
            sender_name: row.sender_name
          }
        };
      })
      .filter(Boolean);

    if (parsedRooms.length === 0) {
      return res.json({ rooms: [] });
    }

    const otherIds = [...new Set(parsedRooms.map((room) => room.otherUserId))];
    const userRows = await query(
      `SELECT id::int AS id, name, age, gender, preference, bio, avatar_url, preferred_language, community_label, is_permanently_blocked
       FROM users
       WHERE id = ANY($1::bigint[])`,
      [otherIds]
    );

    const otherScoresRows = await query(
      `SELECT user_id::int AS user_id, dimension, score
       FROM dimension_scores
       WHERE user_id = ANY($1::bigint[])`,
      [otherIds]
    );
    const otherScoreMap = {};
    for (const row of otherScoresRows.rows) {
      if (!otherScoreMap[row.user_id]) otherScoreMap[row.user_id] = {};
      otherScoreMap[row.user_id][row.dimension] = row.score;
    }

    const userMap = new Map(
      userRows.rows
        .filter((row) => !toBool(row.is_permanently_blocked))
        .map((row) => [row.id, row])
    );

    const rooms = parsedRooms
      .map((room) => {
        const other = userMap.get(room.otherUserId);
        if (!other) return null;
        const candidateScores = otherScoreMap[room.otherUserId] || {};
        const compatibility = calculateCompatibility(myScores, candidateScores) || 0;
        return {
          roomId: room.roomId,
          match: {
            id: other.id,
            name: other.name,
            age: other.age,
            gender: other.gender,
            preference: other.preference,
            bio: other.bio,
            avatar_url: other.avatar_url,
            preferred_language: other.preferred_language,
            community_label: other.community_label,
            compatibility,
            scores: candidateScores
          },
          lastMessage: room.lastMessage
        };
      })
      .filter(Boolean)
      .sort((a, b) => new Date(b.lastMessage.created_at).getTime() - new Date(a.lastMessage.created_at).getTime());

    return res.json({ rooms });
  } catch (error) {
    return next(error);
  }
});

app.post('/chat/messages', auth, async (req, res, next) => {
  try {
    const roomId = String(req.body.roomId || '');
    const text = String(req.body.text || '').trim();
    const imageUrl = String(req.body.imageUrl || '').trim();

    if (!roomId) return res.status(400).json({ error: 'roomId is required' });
    const roomAccess = await ensureRoomAccess(roomId, req.user.id);
    if (!roomAccess.ok) return res.status(403).json({ error: roomAccess.error });

    if (!text && !imageUrl) {
      return res.status(400).json({ error: 'Message must include text or image' });
    }
    if (text && containsBadWord(text)) {
      return res.status(400).json({
        error: 'Message violates community guidelines. Please remove abusive, explicit, or hateful words.'
      });
    }
    if (text.length > 1000) return res.status(400).json({ error: 'Message is too long' });
    if (imageUrl.length > 6_000_000) return res.status(400).json({ error: 'Image payload is too large' });

    if (!isPremiumUser(req.user)) {
      await chatLimiter(req, res, async () => {});
      if (res.headersSent) return;

      const lastMessage = await query(
        `SELECT text, created_at
         FROM messages
         WHERE sender_id = $1
         ORDER BY id DESC
         LIMIT 1`,
        [req.user.id]
      );

      if (lastMessage.rows[0]) {
        const prev = lastMessage.rows[0];
        const elapsedMs = Date.now() - new Date(prev.created_at).getTime();
        if (elapsedMs < Number(process.env.CHAT_MIN_INTERVAL_MS || 2000)) {
          return res.status(429).json({ error: 'Sending too fast. Please wait a moment.' });
        }
        if (text && prev.text === text && elapsedMs < Number(process.env.CHAT_DUPLICATE_WINDOW_MS || 60000)) {
          return res.status(429).json({ error: 'Duplicate message blocked to reduce spam.' });
        }
      }
    }

    const inserted = await query(
      `INSERT INTO messages (room_id, sender_id, text, image_url, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING id::int AS id, created_at`,
      [roomId, req.user.id, text, imageUrl || null]
    );

    return res.json({
      id: inserted.rows[0].id,
      roomId,
      text,
      imageUrl: imageUrl || null,
      createdAt: inserted.rows[0].created_at,
      senderId: req.user.id,
      senderName: req.user.name
    });
  } catch (error) {
    return next(error);
  }
});

app.post('/flowers/send', auth, async (req, res, next) => {
  try {
    const targetUserId = safeInt(req.body.targetUserId);
    if (!targetUserId || targetUserId === req.user.id) {
      return res.status(400).json({ error: 'Valid targetUserId is required' });
    }

    const roomId = `match-${Math.min(req.user.id, targetUserId)}-${Math.max(req.user.id, targetUserId)}`;
    const access = await ensureRoomAccess(roomId, req.user.id);
    if (!access.ok) return res.status(403).json({ error: 'Can only send flowers to users you can connect with' });

    await query(
      `INSERT INTO flower_sends (sender_id, receiver_id, send_day, created_at)
       VALUES ($1, $2, CURRENT_DATE, NOW())
       ON CONFLICT(sender_id, receiver_id, send_day) DO NOTHING`,
      [req.user.id, targetUserId]
    );

    return res.json({ ok: true, sentToday: true });
  } catch (error) {
    return next(error);
  }
});

async function flowerProgressBetween(userA, userB) {
  const result = await query(
    `SELECT sender_id::int AS sender_id, receiver_id::int AS receiver_id, COUNT(DISTINCT send_day)::int AS days
     FROM flower_sends
     WHERE (sender_id = $1 AND receiver_id = $2) OR (sender_id = $2 AND receiver_id = $1)
     GROUP BY sender_id, receiver_id`,
    [userA, userB]
  );

  let aToB = 0;
  let bToA = 0;
  for (const row of result.rows) {
    if (row.sender_id === userA && row.receiver_id === userB) aToB = row.days;
    if (row.sender_id === userB && row.receiver_id === userA) bToA = row.days;
  }

  return {
    aToB,
    bToA,
    mutualDays: Math.min(aToB, bToA),
    unlocked: Math.min(aToB, bToA) >= 5
  };
}

app.get('/flowers/status/:targetUserId', auth, async (req, res, next) => {
  try {
    const targetUserId = safeInt(req.params.targetUserId);
    if (!targetUserId) return res.status(400).json({ error: 'Invalid targetUserId' });

    const progress = await flowerProgressBetween(req.user.id, targetUserId);
    return res.json({
      targetUserId,
      youToThemDays: progress.aToB,
      themToYouDays: progress.bToA,
      mutualDays: progress.mutualDays,
      unlockedPrivateInfo: progress.unlocked
    });
  } catch (error) {
    return next(error);
  }
});

app.get('/private-profile/:targetUserId', auth, async (req, res, next) => {
  try {
    const targetUserId = safeInt(req.params.targetUserId);
    if (!targetUserId) return res.status(400).json({ error: 'Invalid targetUserId' });

    const target = await query(
      `SELECT id::int AS id, name, private_email, private_phone, private_location, private_notes
       FROM users WHERE id = $1`,
      [targetUserId]
    );
    if (!target.rows[0]) return res.status(404).json({ error: 'User not found' });

    const progress = await flowerProgressBetween(req.user.id, targetUserId);
    if (!progress.unlocked) {
      return res.json({
        unlocked: false,
        requiredMutualDays: 5,
        mutualDays: progress.mutualDays
      });
    }

    return res.json({
      unlocked: true,
      profile: {
        name: target.rows[0].name,
        privateEmail: target.rows[0].private_email,
        privatePhone: target.rows[0].private_phone,
        privateLocation: target.rows[0].private_location,
        privateNotes: target.rows[0].private_notes
      }
    });
  } catch (error) {
    return next(error);
  }
});

app.post('/safety/report', auth, async (req, res, next) => {
  try {
    const targetUserId = safeInt(req.body.targetUserId);
    const messageId = safeInt(req.body.messageId);
    const reason = String(req.body.reason || '').trim();

    if (!reason) return res.status(400).json({ error: 'Report reason is required' });
    if (!targetUserId && !messageId) {
      return res.status(400).json({ error: 'Provide targetUserId or messageId' });
    }
    if (targetUserId && targetUserId === req.user.id) {
      return res.status(400).json({ error: 'You cannot report yourself' });
    }

    const inserted = await query(
      `INSERT INTO reports (reporter_id, target_user_id, message_id, reason, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING id::int AS id`,
      [req.user.id, targetUserId, messageId, reason]
    );

    const moderation = await evaluateReportModeration({
      targetUserId,
      messageId,
      reason
    });

    if (moderation.shouldBlock && moderation.targetUserId) {
      await applyPermanentBlock(moderation.targetUserId, moderation.reason);
      await query(
        `UPDATE reports
         SET status = 'resolved',
             reviewed_at = NOW(),
             reviewed_by = 'auto-moderation',
             resolution = 'remove_and_ban'
         WHERE id = $1`,
        [inserted.rows[0].id]
      );
      await query(
        `INSERT INTO blocks (blocker_id, blocked_user_id, created_at)
         VALUES ($1, $2, NOW())
         ON CONFLICT(blocker_id, blocked_user_id) DO NOTHING`,
        [req.user.id, moderation.targetUserId]
      );

      return res.json({
        ok: true,
        reportId: inserted.rows[0].id,
        action: 'blocked_permanently'
      });
    }

    return res.json({
      ok: true,
      reportId: inserted.rows[0].id,
      action: 'queued_for_review'
    });
  } catch (error) {
    return next(error);
  }
});

app.get('/moderation/reports/pending', requireModerationAuth, async (req, res, next) => {
  try {
    const limit = Math.min(200, Math.max(1, safeInt(req.query.limit) || 100));
    const result = await query(
      `SELECT r.id::int AS id, r.reason, r.created_at, r.status,
              r.reporter_id::int AS reporter_id, ru.name AS reporter_name,
              r.target_user_id::int AS target_user_id, tu.name AS target_name,
              r.message_id::int AS message_id, m.text AS message_text
       FROM reports r
       LEFT JOIN users ru ON ru.id = r.reporter_id
       LEFT JOIN users tu ON tu.id = r.target_user_id
       LEFT JOIN messages m ON m.id = r.message_id
       WHERE r.status = 'pending'
       ORDER BY r.created_at ASC
       LIMIT $1`,
      [limit]
    );
    return res.json({ reports: result.rows });
  } catch (error) {
    return next(error);
  }
});

app.post('/moderation/reports/:reportId/action', requireModerationAuth, async (req, res, next) => {
  try {
    const reportId = safeInt(req.params.reportId);
    const action = String(req.body.action || '').trim();
    const reviewer = String(req.body.reviewer || 'moderator').trim().slice(0, 120);
    const resolution = action === 'remove_and_ban' ? 'remove_and_ban' : 'dismissed';
    if (!reportId) return res.status(400).json({ error: 'Invalid reportId' });

    const report = await query(
      `SELECT id::int AS id, target_user_id::int AS target_user_id
       FROM reports
       WHERE id = $1`,
      [reportId]
    );
    if (!report.rows[0]) return res.status(404).json({ error: 'Report not found' });

    if (resolution === 'remove_and_ban' && report.rows[0].target_user_id) {
      await applyPermanentBlock(report.rows[0].target_user_id, 'Manual moderation action: remove_and_ban');
    }

    await query(
      `UPDATE reports
       SET status = 'resolved',
           reviewed_at = NOW(),
           reviewed_by = $2,
           resolution = $3
       WHERE id = $1`,
      [reportId, reviewer, resolution]
    );

    return res.json({ ok: true, resolution });
  } catch (error) {
    return next(error);
  }
});

app.post('/safety/block', auth, async (req, res, next) => {
  try {
    const blockedUserId = safeInt(req.body.blockedUserId);
    if (!blockedUserId || blockedUserId === req.user.id) {
      return res.status(400).json({ error: 'Valid blockedUserId is required' });
    }

    await query(
      `INSERT INTO blocks (blocker_id, blocked_user_id, created_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT(blocker_id, blocked_user_id) DO NOTHING`,
      [req.user.id, blockedUserId]
    );

    return res.json({ ok: true });
  } catch (error) {
    return next(error);
  }
});

app.get('/safety/blocks', auth, async (req, res, next) => {
  try {
    const result = await query(
      `SELECT u.id::int AS id, u.name
       FROM blocks b
       JOIN users u ON u.id = b.blocked_user_id
       WHERE b.blocker_id = $1
       ORDER BY b.id DESC`,
      [req.user.id]
    );
    return res.json({ blocks: result.rows });
  } catch (error) {
    return next(error);
  }
});

app.post('/safety/unblock', auth, async (req, res, next) => {
  try {
    const blockedUserId = safeInt(req.body.blockedUserId);
    if (!blockedUserId) return res.status(400).json({ error: 'blockedUserId is required' });
    await query('DELETE FROM blocks WHERE blocker_id = $1 AND blocked_user_id = $2', [req.user.id, blockedUserId]);
    return res.json({ ok: true });
  } catch (error) {
    return next(error);
  }
});

app.delete('/account', auth, async (req, res, next) => {
  try {
    await withTransaction(async (client) => {
      await client.query('DELETE FROM sessions WHERE user_id = $1', [req.user.id]);
      await client.query('DELETE FROM responses WHERE user_id = $1', [req.user.id]);
      await client.query('DELETE FROM dimension_scores WHERE user_id = $1', [req.user.id]);
      await client.query('DELETE FROM messages WHERE sender_id = $1', [req.user.id]);
      await client.query('DELETE FROM flower_sends WHERE sender_id = $1 OR receiver_id = $1', [req.user.id]);
      await client.query('DELETE FROM premium_events WHERE user_id = $1', [req.user.id]);
      await client.query('DELETE FROM reports WHERE reporter_id = $1 OR target_user_id = $1', [req.user.id]);
      await client.query('DELETE FROM blocks WHERE blocker_id = $1 OR blocked_user_id = $1', [req.user.id]);
      await client.query('DELETE FROM users WHERE id = $1', [req.user.id]);
    });
    return res.json({ ok: true });
  } catch (error) {
    return next(error);
  }
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ error: 'Internal server error' });
});

async function start() {
  await initSchema();
  app.listen(port, () => {
    console.log(`EcoMind backend listening on http://localhost:${port}`);
  });
}

start().catch((error) => {
  console.error('Failed to start backend', error);
  process.exit(1);
});
