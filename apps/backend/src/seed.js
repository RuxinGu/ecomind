import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { initSchema, query } from './db.js';

const bcryptRounds = Number(process.env.BCRYPT_ROUNDS || 12);

const sampleUsers = [
  {
    email: 'ava@example.com',
    name: 'Ava',
    age: 27,
    gender: 'Woman',
    preference: 'Men',
    preferredLanguage: 'english',
    communityLabel: 'American community',
    bio: 'I love deep conversations, books, and slow mornings.',
    scores: { A: 4.4, B: 4.6, C: 3.9, D: 4.2, E: 4.1, F: 3.7, G: 4.0, H: 4.7 },
    private: {
      email: 'ava.private@example.com',
      phone: '+1-415-555-0130',
      location: 'San Francisco, CA',
      notes: 'I open up best through consistency and gentle humor.'
    }
  },
  {
    email: 'liam@example.com',
    name: 'Liam',
    age: 29,
    gender: 'Man',
    preference: 'Women',
    preferredLanguage: 'english',
    communityLabel: 'British community',
    bio: 'Curious, calm, and always up for intentional growth.',
    scores: { A: 4.1, B: 4.2, C: 3.8, D: 4.0, E: 3.4, F: 3.9, G: 4.3, H: 4.4 },
    private: {
      email: 'liam.private@example.com',
      phone: '+1-415-555-0172',
      location: 'San Jose, CA',
      notes: 'I appreciate directness and kindness.'
    }
  },
  {
    email: 'mia@example.com',
    name: 'Mia',
    age: 25,
    gender: 'Woman',
    preference: 'Everyone',
    preferredLanguage: 'english',
    communityLabel: 'American community',
    bio: 'Creative soul. I value values, kindness, and good communication.',
    scores: { A: 4.5, B: 4.3, C: 3.6, D: 3.9, E: 4.2, F: 3.2, G: 4.1, H: 4.8 },
    premium: true
  },
  {
    email: 'noah@example.com',
    name: 'Noah',
    age: 30,
    gender: 'Man',
    preference: 'Women',
    preferredLanguage: 'english',
    bio: 'I like long walks, jazz, and direct communication.',
    scores: { A: 3.8, B: 3.7, C: 4.2, D: 4.1, E: 3.3, F: 4.2, G: 4.5, H: 3.9 }
  },
  {
    email: 'isabella@example.com',
    name: 'Isabella',
    age: 26,
    gender: 'Woman',
    preference: 'Men',
    preferredLanguage: 'english',
    bio: 'Family, growth, and kindness are my anchors.',
    scores: { A: 4.2, B: 4.0, C: 3.7, D: 4.4, E: 3.8, F: 3.9, G: 4.0, H: 4.3 }
  },
  {
    email: 'ethan@example.com',
    name: 'Ethan',
    age: 28,
    gender: 'Man',
    preference: 'Everyone',
    preferredLanguage: 'english',
    bio: 'Builder mindset, gym routine, and weekend hikes.',
    scores: { A: 3.4, B: 3.9, C: 3.5, D: 3.6, E: 2.9, F: 4.6, G: 3.8, H: 3.7 }
  },
  {
    email: 'sophia@example.com',
    name: 'Sophia',
    age: 24,
    gender: 'Woman',
    preference: 'Everyone',
    preferredLanguage: 'english',
    bio: 'I love museum dates, poetry, and depth.',
    scores: { A: 4.7, B: 4.8, C: 3.8, D: 4.0, E: 4.5, F: 3.3, G: 3.9, H: 4.9 }
  },
  {
    email: 'lucas@example.com',
    name: 'Lucas',
    age: 31,
    gender: 'Man',
    preference: 'Women',
    preferredLanguage: 'english',
    bio: 'I value calm homes, honest talks, and consistency.',
    scores: { A: 3.9, B: 3.5, C: 4.3, D: 4.5, E: 3.7, F: 4.4, G: 4.2, H: 4.0 }
  },
  {
    email: 'olivia@example.com',
    name: 'Olivia',
    age: 29,
    gender: 'Woman',
    preference: 'Men',
    preferredLanguage: 'english',
    bio: 'Curious traveler, coffee lover, growth focused.',
    scores: { A: 4.1, B: 4.4, C: 3.4, D: 3.7, E: 3.2, F: 3.6, G: 3.8, H: 4.2 }
  },
  {
    email: 'aaron@example.com',
    name: 'Aaron',
    age: 27,
    gender: 'Man',
    preference: 'Women',
    preferredLanguage: 'english',
    bio: 'I recharge in nature and value intentional partnership.',
    scores: { A: 4.3, B: 4.1, C: 4.0, D: 4.2, E: 4.0, F: 3.8, G: 4.1, H: 4.5 }
  },
  {
    email: 'emma@example.com',
    name: 'Emma',
    age: 23,
    gender: 'Woman',
    preference: 'Everyone',
    preferredLanguage: 'english',
    bio: 'Art, empathy, and emotional honesty matter to me.',
    scores: { A: 4.6, B: 4.2, C: 3.3, D: 3.8, E: 4.4, F: 3.1, G: 3.7, H: 4.6 }
  },
  {
    email: 'daniel@example.com',
    name: 'Daniel',
    age: 32,
    gender: 'Man',
    preference: 'Women',
    preferredLanguage: 'english',
    bio: 'Steady and practical, but open-minded.',
    scores: { A: 3.6, B: 3.6, C: 4.4, D: 4.3, E: 3.1, F: 4.5, G: 4.4, H: 3.8 }
  },
  {
    email: 'chloe@example.com',
    name: 'Chloe',
    age: 28,
    gender: 'Woman',
    preference: 'Men',
    preferredLanguage: 'english',
    bio: 'Warm, playful, and values-centered.',
    scores: { A: 4.0, B: 4.1, C: 3.9, D: 4.1, E: 3.6, F: 3.5, G: 4.2, H: 4.4 }
  },
  {
    email: 'kai@example.com',
    name: 'Kai',
    age: 26,
    gender: 'Non-binary',
    preference: 'Everyone',
    preferredLanguage: 'chinese',
    communityLabel: 'Chinese community',
    bio: 'I thrive in thoughtful conversations and shared growth.',
    scores: { A: 4.5, B: 4.7, C: 3.7, D: 3.9, E: 4.3, F: 3.4, G: 4.0, H: 4.8 }
  }
];

async function run() {
  await initSchema();

  for (const user of sampleUsers) {
    const passwordHash = await bcrypt.hash('password123', bcryptRounds);

    const userResult = await query(
      `INSERT INTO users (
         email, password_hash, name, age, gender, preference, bio,
         private_profile_completed, private_email, private_phone, private_location, private_notes,
         is_premium, premium_until, preferred_language, community_label, created_at
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW())
       ON CONFLICT(email) DO UPDATE SET
         name = EXCLUDED.name,
         age = EXCLUDED.age,
         gender = EXCLUDED.gender,
         preference = EXCLUDED.preference,
         bio = EXCLUDED.bio,
         private_profile_completed = EXCLUDED.private_profile_completed,
         private_email = EXCLUDED.private_email,
         private_phone = EXCLUDED.private_phone,
         private_location = EXCLUDED.private_location,
         private_notes = EXCLUDED.private_notes,
         is_premium = EXCLUDED.is_premium,
         premium_until = EXCLUDED.premium_until,
         preferred_language = EXCLUDED.preferred_language,
         community_label = EXCLUDED.community_label
       RETURNING id::int AS id`,
      [
        user.email,
        passwordHash,
        user.name,
        user.age,
        user.gender,
        user.preference,
        user.bio,
        Boolean(user.private),
        user.private?.email || null,
        user.private?.phone || null,
        user.private?.location || null,
        user.private?.notes || null,
        Boolean(user.premium),
        user.premium ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : null,
        user.preferredLanguage || null,
        user.communityLabel || null
      ]
    );

    const userId = userResult.rows[0].id;
    for (const [dimension, score] of Object.entries(user.scores)) {
      await query(
        `INSERT INTO dimension_scores (user_id, dimension, score, updated_at)
         VALUES ($1, $2, $3, NOW())
         ON CONFLICT(user_id, dimension)
         DO UPDATE SET score = EXCLUDED.score, updated_at = EXCLUDED.updated_at`,
        [userId, dimension, score]
      );
    }

    if (user.premium) {
      const existingPremiumEvent = await query(
        `SELECT id
         FROM premium_events
         WHERE user_id = $1 AND event_type = 'purchase_monthly'
         LIMIT 1`,
        [userId]
      );
      if (!existingPremiumEvent.rows[0]) {
        await query(
          `INSERT INTO premium_events (user_id, event_type, amount_usd, created_at)
           VALUES ($1, 'purchase_monthly', 2.89, NOW())`,
          [userId]
        );
      }
    }
  }

  const ava = await query('SELECT id::int AS id FROM users WHERE email = $1', ['ava@example.com']);
  const liam = await query('SELECT id::int AS id FROM users WHERE email = $1', ['liam@example.com']);
  if (ava.rows[0]) {
    const existingWelcome = await query(
      `SELECT id
       FROM messages
       WHERE room_id = $1 AND sender_id = $2 AND text = $3
       LIMIT 1`,
      [
        'soul-lounge',
        ava.rows[0].id,
        'Welcome to Soul Lounge. Share what makes you feel emotionally safe in connection.'
      ]
    );

    if (existingWelcome.rows[0]) {
      console.log('Welcome message already exists, skipping insert.');
      console.log(`Seed complete. ${sampleUsers.length} candidate accounts ready. Password: password123`);
      return;
    }

    await query(
      `INSERT INTO messages (room_id, sender_id, text, created_at)
       VALUES ($1, $2, $3, NOW())`,
      [
        'soul-lounge',
        ava.rows[0].id,
        'Welcome to Soul Lounge. Share what makes you feel emotionally safe in connection.'
      ]
    );
  }

  if (ava.rows[0] && liam.rows[0]) {
    for (let d = 0; d < 5; d += 1) {
      await query(
        `INSERT INTO flower_sends (sender_id, receiver_id, send_day, created_at)
         VALUES ($1, $2, CURRENT_DATE - ($3::int), NOW())
         ON CONFLICT(sender_id, receiver_id, send_day) DO NOTHING`,
        [ava.rows[0].id, liam.rows[0].id, d]
      );
      await query(
        `INSERT INTO flower_sends (sender_id, receiver_id, send_day, created_at)
         VALUES ($1, $2, CURRENT_DATE - ($3::int), NOW())
         ON CONFLICT(sender_id, receiver_id, send_day) DO NOTHING`,
        [liam.rows[0].id, ava.rows[0].id, d]
      );
    }
  }

  console.log(`Seed complete. ${sampleUsers.length} candidate accounts ready. Password: password123`);
}

run().catch((error) => {
  console.error('Seed failed', error);
  process.exit(1);
});
