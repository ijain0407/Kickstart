-- Kickstart database schema.
--
-- Idempotent: every statement is CREATE ... IF NOT EXISTS, so running the
-- migration again on a live database is safe. `npm run db:migrate` applies it.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------------------------------------------------------------- accounts --
CREATE TABLE IF NOT EXISTS users (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Stored lowercase and trimmed; the app normalises before writing, and the
  -- unique index below makes a duplicate a database error rather than a race.
  email           text        NOT NULL,
  password_hash   text        NOT NULL,
  display_name    text        NOT NULL,
  -- The club and league a person picked as theirs. Plain ids from the culture
  -- API (culture-liverpool, league-premier-league) — no foreign key, because
  -- that content lives in JSON files, not in this database.
  favourite_club_id    text,
  favourite_league_id  text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS users_email_key ON users (lower(email));

-- ---------------------------------------------------------------- sessions --
-- The cookie carries a random token; only its SHA-256 hash is stored, so a
-- leaked table dump can't be replayed as a login.
CREATE TABLE IF NOT EXISTS sessions (
  token_hash  text        PRIMARY KEY,
  user_id     uuid        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  created_at  timestamptz NOT NULL DEFAULT now(),
  expires_at  timestamptz NOT NULL
);

CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON sessions (user_id);
CREATE INDEX IF NOT EXISTS sessions_expires_at_idx ON sessions (expires_at);

-- ---------------------------------------------------------- app key/value --
-- Progress, quiz attempts and anything else the feature teams keep as a
-- document. This mirrors the shape their JSON store already had (namespace +
-- key -> value), so their repositories work unchanged against Postgres.
CREATE TABLE IF NOT EXISTS app_store (
  namespace   text        NOT NULL,
  key         text        NOT NULL,
  value       jsonb       NOT NULL,
  updated_at  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (namespace, key)
);

CREATE INDEX IF NOT EXISTS app_store_namespace_idx ON app_store (namespace);
