import pool from '../config/db.js';
import { hashPassword, verifyPassword } from '../utils/passwordHash.js';
import { sign } from '../jwt-lib/index.js';
import { env } from '../config/env.js';
import fs from 'fs';

export async function registerUser({ email, password, publicKey, encryptedPrivateKey, kdfParams }) {
  // Cek email sudah terdaftar
  const existing = await pool.query(
    'SELECT id FROM users WHERE email = $1', [email]
  );
  if (existing.rows.length > 0) {
    throw new Error('Email already registered');
  }

  // Hash password & generate KDF salt
  const { passwordHash, kdfSalt } = await hashPassword(password);

  // Simpan ke DB
  const result = await pool.query(
    `INSERT INTO users 
      (email, password_hash, salt, public_key, encrypted_private_key, kdf_params)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, email, created_at`,
    [email, passwordHash, kdfSalt, publicKey, encryptedPrivateKey, JSON.stringify(kdfParams || {})]
  );

  return result.rows[0];
}

export async function loginUser({ email, password }) {
  // Cari user
  const result = await pool.query(
    `SELECT id, email, password_hash, salt, public_key, encrypted_private_key, kdf_params
     FROM users WHERE email = $1`,
    [email]
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
    },
    privateKeyPem
  );

  // Return token + data untuk recover private key
  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      publicKey: user.public_key,
      encryptedPrivateKey: user.encrypted_private_key,
      kdfSalt: user.salt,          
      kdfParams: user.kdf_params, 
    }
  };
}