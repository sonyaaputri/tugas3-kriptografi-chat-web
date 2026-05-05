import bcrypt from 'bcrypt';
import crypto from 'crypto';

const SALT_ROUNDS = 12; // cost factor — makin tinggi makin lambat, makin aman

/**
 * Hash password untuk disimpan di DB
 * bcrypt sudah handle salt internalnya,
 * tapi kita juga generate salt TERPISAH untuk KDF di client
 */
export async function hashPassword(plaintext) {
  const passwordHash = await bcrypt.hash(plaintext, SALT_ROUNDS);
  
  // Salt tambahan untuk metadata server. Bcrypt tetap punya salt internal sendiri.
  const passwordSalt = crypto.randomBytes(32).toString('hex');
  
  return { passwordHash, passwordSalt };
}

/**
 * Verifikasi password saat login
 */
export async function verifyPassword(plaintext, hash) {
  return bcrypt.compare(plaintext, hash);
}
