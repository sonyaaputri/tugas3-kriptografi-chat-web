import pool from '../config/db.js';

// List semua user 
export async function getAllUsers(excludeEmail) {
  const result = await pool.query(
    `SELECT email, public_key as "publicKey" FROM users WHERE email != $1 ORDER BY email`,
    [excludeEmail]
  );
  return result.rows;
}

// Ambil public key user spesifik (untuk key exchange ECDH)
export async function getUserPublicKey(email) {
  const result = await pool.query(
    `SELECT email, public_key as "publicKey" FROM users WHERE email = $1`,
    [email]
  );
  if (result.rows.length === 0) throw new Error('User not found');
  return result.rows[0];
}