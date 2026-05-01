// aes.js
// Implementasi enkripsi dan dekripsi AES-256-GCM menggunakan Web Crypto API

import { bufferToBase64, base64ToBuffer } from "./encoding.js";

/**
 * Melakukan enkripsi plaintext menggunakan AES-256-GCM
 * @param {CryptoKey} key     : Kunci AES-256 dalam bentuk CryptoKey
 * @param {string} plaintext  : Pesan asli yang akan dienkripsi (base64)
 * @returns {{ ciphertext: string, iv: string }}
 */
export async function aesEncrypt(key, plaintext) {
  // Membuat IV acak 96-bit (12 byte)
  const iv = crypto.getRandomValues(new Uint8Array(12));

  // Mengubah plaintext menjadi format byte
  const encoded = new TextEncoder().encode(plaintext);

  // Proses enkripsi menggunakan Web Crypto API
  const ciphertextBuffer = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoded
  );

  return {
    ciphertext: bufferToBase64(ciphertextBuffer),
    iv: bufferToBase64(iv.buffer),
  };
}

/**
 * Melakukan dekripsi ciphertext menggunakan AES-256-GCM
 * @param {CryptoKey} key     : Kunci AES-256 dalam bentuk CryptoKey
 * @param {string} ciphertext : Data terenkripsi (base64)
 * @param {string} iv         : Initialization Vector (base64)
 * @returns {string}          : Hasil dekripsi
 * @throws {Error}            : Jika proses dekripsi gagal
 */
export async function aesDecrypt(key, ciphertext, iv) {
  // Mengubah base64 menjadi ArrayBuffer
  const ciphertextBuffer = base64ToBuffer(ciphertext);
  const ivBuffer = base64ToBuffer(iv);

  const plaintextBuffer = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: new Uint8Array(ivBuffer) },
    key,
    ciphertextBuffer
  );

  return new TextDecoder().decode(plaintextBuffer);
}

/**
 * Mengimpor raw key menjadi CryptoKey untuk AES-256
 * @param {ArrayBuffer} rawKey (32-byte)
 * @returns {CryptoKey}
 */
export async function importAesKey(rawKey) {
  return crypto.subtle.importKey("raw", rawKey, { name: "AES-GCM" }, false, [
    "encrypt",
    "decrypt",
  ]);
}