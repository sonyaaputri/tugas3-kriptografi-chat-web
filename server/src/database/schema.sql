CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  username      TEXT NOT NULL,
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  password_salt TEXT NOT NULL,

  -- ECDH Keys
  public_key            TEXT NOT NULL,
  encrypted_private_key TEXT NOT NULL,
  private_key_iv        TEXT NOT NULL,
  private_key_salt      TEXT NOT NULL,

  is_online     BOOLEAN DEFAULT FALSE,
  last_seen     TIMESTAMP,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS messages (
  id              SERIAL PRIMARY KEY,
  sender_email    TEXT NOT NULL REFERENCES users(email),
  receiver_email  TEXT NOT NULL REFERENCES users(email),
  
  ciphertext      TEXT NOT NULL,
  iv              TEXT NOT NULL,
  mac             TEXT,
  
  timestamp       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_messages_participants 
  ON messages(sender_email, receiver_email);

-- Backward-compatible migration for databases created from the earlier draft.
ALTER TABLE users ADD COLUMN IF NOT EXISTS username TEXT;
UPDATE users
SET username = split_part(email, '@', 1)
WHERE username IS NULL OR username = '';
ALTER TABLE users ALTER COLUMN username SET NOT NULL;

ALTER TABLE users ADD COLUMN IF NOT EXISTS password_salt TEXT;
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'salt'
  ) THEN
    EXECUTE 'UPDATE users SET password_salt = salt WHERE (password_salt IS NULL OR password_salt = '''') AND salt IS NOT NULL';
  END IF;
END $$;
UPDATE users
SET password_salt = 'legacy-password-salt'
WHERE password_salt IS NULL OR password_salt = '';
ALTER TABLE users ALTER COLUMN password_salt SET NOT NULL;

ALTER TABLE users ADD COLUMN IF NOT EXISTS private_key_iv TEXT;
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'kdf_params'
  ) THEN
    EXECUTE 'UPDATE users SET private_key_iv = kdf_params->>''iv'' WHERE (private_key_iv IS NULL OR private_key_iv = '''') AND kdf_params ? ''iv''';
  END IF;
END $$;
UPDATE users
SET private_key_iv = ''
WHERE private_key_iv IS NULL;
ALTER TABLE users ALTER COLUMN private_key_iv SET NOT NULL;

ALTER TABLE users ADD COLUMN IF NOT EXISTS private_key_salt TEXT;
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'kdf_params'
  ) THEN
    EXECUTE 'UPDATE users SET private_key_salt = kdf_params->>''salt'' WHERE (private_key_salt IS NULL OR private_key_salt = '''') AND kdf_params ? ''salt''';
  END IF;
END $$;
UPDATE users
SET private_key_salt = ''
WHERE private_key_salt IS NULL;
ALTER TABLE users ALTER COLUMN private_key_salt SET NOT NULL;

ALTER TABLE users ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT FALSE;
UPDATE users
SET is_online = FALSE
WHERE is_online IS NULL;
ALTER TABLE users ALTER COLUMN is_online SET DEFAULT FALSE;

ALTER TABLE users ADD COLUMN IF NOT EXISTS last_seen TIMESTAMP;
