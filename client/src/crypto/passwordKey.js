/**
 * passwordKey.js
 * Enkripsi dan dekripsi private key ECDH menggunakan kunci yang diturunkan dari password
 *
 * Alur enkripsi (saat register):
 *   password + salt → PBKDF2 → AES-256-GCM key
 *     └→ encrypt(privateKeyBase64) → { encryptedPrivateKey, iv, salt }
 *
 * Alur dekripsi (saat login):
 *   password + salt (dari server) → PBKDF2 → AES-256-GCM key
 *     └→ decrypt(encryptedPrivateKey, iv) → privateKeyBase64
 *
 * Semua nilai output diencode ke base64 agar aman dikirim lewat JSON
 */

import { bufferToBase64, base64ToBuffer } from "./encoding.js";

/** Jumlah iterasi PBKDF2 — cukup tinggi untuk memperlambat brute force */
const PBKDF2_ITERATIONS = 200_000;

/** Panjang salt dalam byte */
const SALT_LENGTH = 16;

/** Panjang IV untuk AES-GCM dalam byte */
const IV_LENGTH = 12;

/**
 * Menurunkan kunci AES-256-GCM dari password dan salt menggunakan PBKDF2-SHA-256
 *
 * @param {string}      password
 * @param {Uint8Array}  salt
 * @returns {Promise<CryptoKey>}
 */
async function deriveKeyFromPassword(password, salt) {
  // Import password sebagai bahan baku PBKDF2
  const passwordKey = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  // Turunkan kunci AES-256-GCM menggunakan PBKDF2
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt,
      iterations: PBKDF2_ITERATIONS,
    },
    passwordKey,
    {
      name: "AES-GCM",
      length: 256,
    },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * Mengenkripsi private key ECDH menggunakan password
 * Dipanggil saat registrasi sebelum mengirim private key ke server
 *
 * @param {string} privateKeyBase64 - Private key dalam format base64 (PKCS8)
 * @param {string} password         - Password plaintext pengguna
 * @returns {Promise<{ encryptedPrivateKey: string, iv: string, salt: string }>}
 *          Semua nilai dalam format base64
 */
export async function encryptPrivateKey(privateKeyBase64, password) {
  // Generate salt dan IV secara acak
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const iv   = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

  // Turunkan kunci AES dari password
  const aesKey = await deriveKeyFromPassword(password, salt);

  // Enkripsi private key
  const privateKeyBuffer = base64ToBuffer(privateKeyBase64);
  const encryptedBuffer  = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    aesKey,
    privateKeyBuffer
  );

  return {
    encryptedPrivateKey: bufferToBase64(encryptedBuffer),
    iv:   bufferToBase64(iv.buffer),
    salt: bufferToBase64(salt.buffer),
  };
}

/**
 * Mendekripsi private key ECDH menggunakan password
 * Dipanggil saat login setelah data kunci diambil dari server
 *
 * @param {string} encryptedPrivateKey - Terenkripsi (base64)
 * @param {string} iv                  - Initialization Vector (base64)
 * @param {string} salt                - Salt PBKDF2 (base64)
 * @param {string} password            - Password plaintext pengguna
 * @returns {Promise<string>}          - Private key dalam format base64 (PKCS8)
 * @throws {Error} Jika password salah atau data korup
 */
export async function decryptPrivateKey(encryptedPrivateKey, iv, salt, password) {
  // Konversi base64 → buffer
  const saltBuffer = new Uint8Array(base64ToBuffer(salt));
  const ivBuffer   = new Uint8Array(base64ToBuffer(iv));
  const ciphertext = base64ToBuffer(encryptedPrivateKey);

  // Turunkan kunci AES dari password + salt yang sama dengan saat enkripsi
  const aesKey = await deriveKeyFromPassword(password, saltBuffer);

  // Dekripsi — akan throw DOMException jika password salah (AES-GCM authentication gagal)
  const privateKeyBuffer = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: ivBuffer },
    aesKey,
    ciphertext
  );

  return bufferToBase64(privateKeyBuffer);
}