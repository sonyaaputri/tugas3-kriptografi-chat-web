import pool from '../config/db.js';
import { hashPassword, verifyPassword } from '../utils/passwordHash.js';
import { sign } from '../jwt-lib/index.js';
import { env } from '../config/env.js';
import fs from 'fs';

export async function registerUser({ username, email, password, publicKey, encryptedPrivateKey, iv, salt }) {
  const normalizedEmail = email.trim().toLowerCase();

  // Cek email sudah terdaftar
  const existing = await pool.query(
    'SELECT id FROM users WHERE email = $1', [normalizedEmail]
  );
  if (existing.rows.length > 0) {
    throw new Error('Email already registered');
  }

  // Hash password & generate KDF salt
  const { passwordHash, passwordSalt } = await hashPassword(password);

  // Simpan ke DB
  const result = await pool.query(
    `INSERT INTO users 
      (username, email, password_hash, password_salt, public_key, encrypted_private_key, private_key_iv, private_key_salt)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id, username, email, created_at`,
    [username.trim(), normalizedEmail, passwordHash, passwordSalt, publicKey, encryptedPrivateKey, iv, salt]
  );

  return result.rows[0];
}

export async function loginUser({ email, password }) {
  const normalizedEmail = email.trim().toLowerCase();

  // Cari user
  const result = await pool.query(
    `SELECT id, username, email, password_hash, public_key, encrypted_private_key, private_key_iv, private_key_salt
     FROM users WHERE email = $1`,
    [normalizedEmail]
  );
  if (result.rows.length === 0) {
    throw new Error('Invalid credentials');
  }
  
  const user = result.rows[0];

  // Verify password
  const isValid = await verifyPassword(password, user.password_hash);
  if (!isValid) {
    throw new Error('Invalid credentials');
  }

  await pool.query(
    'UPDATE users SET is_online = TRUE, last_seen = CURRENT_TIMESTAMP WHERE email = $1',
    [user.email]
  );

  // Buat JWT 
  const privateKeyPem = fs.readFileSync(env.JWT_PRIVATE_KEY_PATH, 'utf8');
  const now = Math.floor(Date.now() / 1000);
  
  const token = sign(
    { alg: env.JWT_ALGORITHM, typ: 'JWT' },
    {
      sub: String(user.id),
      iss: 'secure-chat-server',
      aud: 'secure-chat-client',
      iat: now,
      exp: now + Number(env.JWT_EXPIRES_IN),
    },
    {
      userId: user.id,
      email: user.email,
      username: user.username,
    },
    privateKeyPem
  );

  // Return token + data untuk recover private key
  return {
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      publicKey: user.public_key,
      encryptedPrivateKey: user.encrypted_private_key,
      iv: user.private_key_iv,
      salt: user.private_key_salt,
    }
  };
}

export async function logoutUser(email) {
  await pool.query(
    'UPDATE users SET is_online = FALSE, last_seen = CURRENT_TIMESTAMP WHERE email = $1',
    [email]
  );
}
