CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,          -- hasil bcrypt/argon2
  salt          TEXT NOT NULL,          -- salt

  -- ECDH Keys
  public_key          TEXT NOT NULL,    -- raw public key (base64/PEM)
  encrypted_private_key TEXT NOT NULL,  -- private key dienkripsi AES di client
  
  -- Metadata KDF
  kdf_params    JSONB,                  

  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS messages (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_email    VARCHAR(255) NOT NULL REFERENCES users(email),
  receiver_email  VARCHAR(255) NOT NULL REFERENCES users(email),
  
  ciphertext    TEXT NOT NULL,   -- AES encrypted message
  iv            TEXT NOT NULL,   -- initialization vector
  mac           TEXT,            -- message authentication code (HMAC)
  
  timestamp     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_participants 
  ON messages(sender_email, receiver_email);