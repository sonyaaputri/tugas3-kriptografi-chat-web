/**
 * mac.js
 * Implementasi Message Authentication Code (MAC) menggunakan HMAC-SHA-256
 * via Web Crypto API (Bonus)
 *
 * Tujuan MAC:
 *  - Memastikan INTEGRITAS pesan: ciphertext tidak diubah di perjalanan
 *  - Memastikan AUTENTIKASI pengirim: hanya pihak yang memegang kunci HMAC
 *    (yaitu kedua pihak yang sudah melakukan ECDH) yang bisa menghasilkan MAC valid
 *
 * Material kunci:
 *  MAC key diturunkan secara TERPISAH dari AES key menggunakan HKDF dengan
 *  nilai 'info' yang berbeda (lihat hkdf.js: deriveHMACKey).
 *  Ini memastikan AES key dan HMAC key tidak saling bergantung.
 *
 * Alur pengiriman pesan (dengan MAC):
 *  1. Enkripsi pesan → ciphertext + iv
 *  2. Hitung MAC dari ciphertext → mac
 *  3. Kirim { ciphertext, iv, mac } ke server
 *
 * Alur penerimaan pesan:
 *  1. Verifikasi MAC dari ciphertext yang diterima
 *  2. Jika MAC tidak valid → tandai pesan sebagai tidak valid, JANGAN dekripsi
 *  3. Jika MAC valid → dekripsi ciphertext
 */

import { bufferToBase64, base64ToBuffer } from "./encoding.js";

/**
 * Menghitung HMAC-SHA-256 dari ciphertext
 *
 * @param {CryptoKey} hmacKey    - Kunci HMAC dari deriveHMACKey()
 * @param {string}    ciphertext - Ciphertext dalam format base64
 * @returns {Promise<string>}    - MAC dalam format base64
 */
export async function computeMAC(hmacKey, ciphertext) {
  const data = base64ToBuffer(ciphertext);
  const macBuffer = await crypto.subtle.sign("HMAC", hmacKey, data);
  return bufferToBase64(macBuffer);
}

/**
 * Memverifikasi HMAC-SHA-256 dari ciphertext
 * Menggunakan crypto.subtle.verify yang aman terhadap timing attack
 *
 * @param {CryptoKey} hmacKey    - Kunci HMAC dari deriveHMACKey()
 * @param {string}    ciphertext - Ciphertext dalam format base64
 * @param {string}    mac        - MAC yang akan diverifikasi (base64)
 * @returns {Promise<boolean>}   - true jika valid, false jika tidak
 */
export async function verifyMAC(hmacKey, ciphertext, mac) {
  try {
    const data      = base64ToBuffer(ciphertext);
    const macBuffer = base64ToBuffer(mac);
    return await crypto.subtle.verify("HMAC", hmacKey, macBuffer, data);
  } catch {
    // Jika format tidak valid (base64 rusak, dll), anggap MAC tidak valid
    return false;
  }
}