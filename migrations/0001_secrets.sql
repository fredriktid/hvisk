-- Nothing here can be decrypted without the key in the link.
CREATE TABLE IF NOT EXISTS secrets (
  id             TEXT PRIMARY KEY,
  ciphertext     TEXT NOT NULL,
  iv             TEXT NOT NULL,
  salt           TEXT NOT NULL,
  has_passphrase INTEGER NOT NULL DEFAULT 0,
  burn_hash      TEXT NOT NULL,
  created_at     INTEGER NOT NULL,
  expires_at     INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS secrets_expires_at ON secrets (expires_at);
