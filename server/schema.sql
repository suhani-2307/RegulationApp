-- Safe to run more than once.

CREATE TABLE IF NOT EXISTS accounts (
  id            SERIAL PRIMARY KEY,
  role          TEXT NOT NULL CHECK (role IN ('user', 'caregiver')),
  username      TEXT NOT NULL,
  email         TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  first_name    TEXT,
  last_name     TEXT,
  name          TEXT,          -- caregivers use a single name field
  age           INT,
  diagnosis     TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Usernames and emails are unique across users AND caregivers, case-insensitively
CREATE UNIQUE INDEX IF NOT EXISTS accounts_username_lower ON accounts (lower(username));
CREATE UNIQUE INDEX IF NOT EXISTS accounts_email_lower    ON accounts (lower(email));

-- One caregiver per user; a caregiver can have many users
CREATE TABLE IF NOT EXISTS pairings (
  user_id      INT PRIMARY KEY REFERENCES accounts(id) ON DELETE CASCADE,
  caregiver_id INT NOT NULL    REFERENCES accounts(id) ON DELETE CASCADE,
  paired_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS pairings_caregiver ON pairings (caregiver_id);

CREATE TABLE IF NOT EXISTS zone_entries (
  id         SERIAL PRIMARY KEY,
  user_id    INT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  zone       TEXT NOT NULL CHECK (zone IN ('green', 'yellow', 'red')),
  emotion    TEXT,
  location   TEXT,
  session_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS zone_entries_user_time ON zone_entries (user_id, created_at DESC);
