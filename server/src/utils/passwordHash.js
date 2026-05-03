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
  
  // Salt ini untuk client-side KDF (derive AES key dari password)
  // Beda dengan bcrypt salt!
  const kdfSalt = crypto.randomBytes(32).toString('hex');
  
  return { passwordHash, kdfSalt };
}

/**
 * Verifikasi password saat login
 */
export async function verifyPassword(plaintext, hash) {
  return bcrypt.compare(plaintext, hash);
}