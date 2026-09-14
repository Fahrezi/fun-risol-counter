ALTER TABLE settings RENAME COLUMN secret_word TO secret_hash;
UPDATE settings SET secret_hash = 'e708123b7fdd94e86c563abab3e7ba33d95b9680baceb66c86c5af994c8858ad' WHERE id = 1;

CREATE TABLE sessions (
  token      TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL
);

CREATE INDEX ix_sessions_expires_at ON sessions (expires_at);
