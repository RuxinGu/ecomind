import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is required. Example: postgres://user:pass@host:5432/ecomind');
}

const useSSL = process.env.PGSSL === 'true' || connectionString.includes('sslmode=require');

const pool = new Pool({
  connectionString,
  ssl: useSSL ? { rejectUnauthorized: process.env.PGSSL_REJECT_UNAUTHORIZED !== 'false' } : false,
  max: Number(process.env.PGPOOL_MAX || 10),
  idleTimeoutMillis: Number(process.env.PG_IDLE_TIMEOUT_MS || 30000),
  connectionTimeoutMillis: Number(process.env.PG_CONNECT_TIMEOUT_MS || 10000)
});

export async function query(text, params = []) {
  return pool.query(text, params);
}

export async function withTransaction(fn) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function initSchema() {
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id BIGSERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      age INTEGER,
      gender TEXT,
      preference TEXT,
      bio TEXT,
      avatar_url TEXT,
      default_questions TEXT,
      private_profile_completed BOOLEAN NOT NULL DEFAULT FALSE,
      private_email TEXT,
      private_phone TEXT,
      private_location TEXT,
      private_notes TEXT,
      is_premium BOOLEAN NOT NULL DEFAULT FALSE,
      premium_until TIMESTAMPTZ,
      connect_contacts_enabled BOOLEAN NOT NULL DEFAULT FALSE,
      preferred_language TEXT,
      community_label TEXT,
      terms_accepted_at TIMESTAMPTZ,
      is_permanently_blocked BOOLEAN NOT NULL DEFAULT FALSE,
      permanent_block_reason TEXT,
      permanently_blocked_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS responses (
      id BIGSERIAL PRIMARY KEY,
      user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      form_type TEXT NOT NULL,
      item_id TEXT NOT NULL,
      value INTEGER NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS dimension_scores (
      user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      dimension TEXT NOT NULL,
      score REAL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (user_id, dimension)
    );

    CREATE TABLE IF NOT EXISTS messages (
      id BIGSERIAL PRIMARY KEY,
      room_id TEXT NOT NULL,
      sender_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      text TEXT NOT NULL,
      image_url TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS reports (
      id BIGSERIAL PRIMARY KEY,
      reporter_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      target_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
      message_id BIGINT REFERENCES messages(id) ON DELETE SET NULL,
      reason TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      reviewed_at TIMESTAMPTZ,
      reviewed_by TEXT,
      resolution TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS blocks (
      id BIGSERIAL PRIMARY KEY,
      blocker_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      blocked_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (blocker_id, blocked_user_id)
    );

    CREATE TABLE IF NOT EXISTS login_attempts (
      id BIGSERIAL PRIMARY KEY,
      email TEXT NOT NULL,
      ip TEXT NOT NULL,
      success BOOLEAN NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS flower_sends (
      id BIGSERIAL PRIMARY KEY,
      sender_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      receiver_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      send_day DATE NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (sender_id, receiver_id, send_day)
    );

    CREATE TABLE IF NOT EXISTS premium_events (
      id BIGSERIAL PRIMARY KEY,
      user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      event_type TEXT NOT NULL,
      amount_usd NUMERIC(10,2),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS user_contacts (
      id BIGSERIAL PRIMARY KEY,
      owner_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      contact_key TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (owner_id, contact_key)
    );

    CREATE INDEX IF NOT EXISTS idx_messages_room_id_id ON messages(room_id, id DESC);
    CREATE INDEX IF NOT EXISTS idx_responses_user_form ON responses(user_id, form_type);
    CREATE INDEX IF NOT EXISTS idx_scores_user ON dimension_scores(user_id);
    CREATE INDEX IF NOT EXISTS idx_login_attempts_lookup ON login_attempts(email, ip, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_flower_lookup ON flower_sends(sender_id, receiver_id, send_day DESC);
    CREATE INDEX IF NOT EXISTS idx_premium_events_user ON premium_events(user_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_user_contacts_owner ON user_contacts(owner_id);
  `);

  await query('ALTER TABLE messages ADD COLUMN IF NOT EXISTS image_url TEXT');
  await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS private_profile_completed BOOLEAN NOT NULL DEFAULT FALSE');
  await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS private_email TEXT');
  await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS private_phone TEXT');
  await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS private_location TEXT');
  await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS private_notes TEXT');
  await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS is_premium BOOLEAN NOT NULL DEFAULT FALSE');
  await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS premium_until TIMESTAMPTZ');
  await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS connect_contacts_enabled BOOLEAN NOT NULL DEFAULT FALSE');
  await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS preferred_language TEXT');
  await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS community_label TEXT');
  await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMPTZ');
  await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT');
  await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS default_questions TEXT');
  await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS is_permanently_blocked BOOLEAN NOT NULL DEFAULT FALSE');
  await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS permanent_block_reason TEXT');
  await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS permanently_blocked_at TIMESTAMPTZ');
  await query("ALTER TABLE reports ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending'");
  await query('ALTER TABLE reports ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ');
  await query('ALTER TABLE reports ADD COLUMN IF NOT EXISTS reviewed_by TEXT');
  await query('ALTER TABLE reports ADD COLUMN IF NOT EXISTS resolution TEXT');
}

export default pool;
