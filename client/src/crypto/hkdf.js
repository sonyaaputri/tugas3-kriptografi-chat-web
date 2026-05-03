/**
 * hkdf.js
 * Derivasi kunci AES-256 dari shared secret menggunakan HKDF (RFC 5869)
 * via Web Crypto API
 *
 * Alur:
 *  computeSharedSecret() → ArrayBuffer
 *    └→ deriveAESKey()   → CryptoKey (AES-256-GCM, siap enkripsi/dekripsi)
 *
 * HKDF digunakan karena shared secret ECDH bukan kunci yang langsung aman
 * dipakai — HKDF memperkuat entropi dan memisahkan material kunci
 */

/**
 * Menurunkan kunci AES-256 dari shared secret menggunakan HKDF-SHA-256
 *
 * @param {ArrayBuffer} sharedSecret - Output dari computeSharedSecret()
 * @returns {Promise<CryptoKey>}     - Kunci AES-256-GCM siap pakai
 */
export async function deriveAESKey(sharedSecret) {
  // Langkah 1: Import shared secret sebagai bahan baku HKDF
  const hkdfKey = await crypto.subtle.importKey(
    "raw",
    sharedSecret,
    { name: "HKDF" },
    false,                   // tidak perlu extractable
    ["deriveKey"]
  );

  // Langkah 2: Turunkan kunci AES-256-GCM menggunakan HKDF-SHA-256
  // - salt  : tidak diwajibkan oleh spesifikasi, dibiarkan default (zero salt)
  // - info  : konteks aplikasi untuk domain separation
  const info = new TextEncoder().encode("chat-aes-key-v1");

  return crypto.subtle.deriveKey(
    {
      name: "HKDF",
      hash: "SHA-256",
      salt: new Uint8Array(32),   // 32-byte zero salt (RFC 5869 §3.1)
      info,
    },
    hkdfKey,
    {
      name: "AES-GCM",
      length: 256,                // AES-256
    },
    false,                        // tidak perlu extractable untuk kunci komunikasi
    ["encrypt", "decrypt"]
  );
}

/**
 * Menurunkan kunci HMAC-SHA-256 dari shared secret untuk keperluan MAC (Bonus)
 * Material kunci terpisah dari AES key berkat perbedaan nilai 'info'
 *
 * @param {ArrayBuffer} sharedSecret - Output dari computeSharedSecret()
 * @returns {Promise<CryptoKey>}     - Kunci HMAC-SHA-256 siap pakai
 */
export async function deriveHMACKey(sharedSecret) {
  const hkdfKey = await crypto.subtle.importKey(
    "raw",
    sharedSecret,
    { name: "HKDF" },
    false,
    ["deriveKey"]
  );

  // Info berbeda dari AES key agar tidak ada tumpang tindih material kunci
  const info = new TextEncoder().encode("chat-hmac-key-v1");

  return crypto.subtle.deriveKey(
    {
      name: "HKDF",
      hash: "SHA-256",
      salt: new Uint8Array(32),
      info,
    },
    hkdfKey,
    {
      name: "HMAC",
      hash: "SHA-256",
    },
    false,
    ["sign", "verify"]
  );
}