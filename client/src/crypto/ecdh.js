/**
 * ecdh.js
 * Implementasi ECDH (Elliptic Curve Diffie-Hellman) menggunakan Web Crypto API
 *
 * Kurva yang digunakan: P-256 (secp256r1)
 * Format export public key : SPKI  → base64
 * Format export private key: PKCS8 → base64
 *
 * Alur kerja:
 *  1. Saat register  → generateECDHKeyPair() lalu exportPublicKey() & exportPrivateKey()
 *  2. Saat login     → importPrivateKey() untuk memuat kembali private key dari server
 *  3. Saat chat      → importPublicKey() lawan bicara + computeSharedSecret()
 */

import { bufferToBase64, base64ToBuffer } from "./encoding.js";

/** Nama kurva eliptik yang digunakan */
const CURVE = "P-256";

/**
 * Membangkitkan pasangan kunci ECDH baru (private + public)
 * @returns {Promise<CryptoKeyPair>}
 */
export async function generateECDHKeyPair() {
  return crypto.subtle.generateKey(
    {
      name: "ECDH",
      namedCurve: CURVE,
    },
    true,        // extractable: true agar bisa di-export
    ["deriveKey", "deriveBits"]
  );
}

/**
 * Mengekspor public key menjadi string base64 (format SPKI)
 * SPKI (SubjectPublicKeyInfo) adalah format standar yang aman dikirim ke server
 * @param {CryptoKey} publicKey
 * @returns {Promise<string>} base64 string
 */
export async function exportPublicKey(publicKey) {
  const spkiBuffer = await crypto.subtle.exportKey("spki", publicKey);
  return bufferToBase64(spkiBuffer);
}

/**
 * Mengekspor private key menjadi string base64 (format PKCS8)
 * CATATAN: Jangan simpan ke server dalam bentuk plaintext!
 * Private key wajib dienkripsi dulu dengan passwordKey sebelum dikirim
 * @param {CryptoKey} privateKey
 * @returns {Promise<string>} base64 string
 */
export async function exportPrivateKey(privateKey) {
  const pkcs8Buffer = await crypto.subtle.exportKey("pkcs8", privateKey);
  return bufferToBase64(pkcs8Buffer);
}

/**
 * Mengimpor public key dari string base64 (format SPKI)
 * Digunakan untuk memuat public key milik lawan bicara yang diterima dari server
 * @param {string} base64
 * @returns {Promise<CryptoKey>}
 */
export async function importPublicKey(base64) {
  const buffer = base64ToBuffer(base64);
  return crypto.subtle.importKey(
    "spki",
    buffer,
    {
      name: "ECDH",
      namedCurve: CURVE,
    },
    true,
    []            // public key tidak perlu usage flags untuk ECDH
  );
}

/**
 * Mengimpor private key dari string base64 (format PKCS8)
 * Digunakan setelah private key berhasil didekripsi dari penyimpanan server
 * @param {string} base64
 * @returns {Promise<CryptoKey>}
 */
export async function importPrivateKey(base64) {
  const buffer = base64ToBuffer(base64);
  return crypto.subtle.importKey(
    "pkcs8",
    buffer,
    {
      name: "ECDH",
      namedCurve: CURVE,
    },
    true,
    ["deriveKey", "deriveBits"]
  );
}

/**
 * Menghitung shared secret menggunakan ECDH
 * Kedua pihak yang berkomunikasi akan menghasilkan nilai yang sama:
 *   Alice: computeSharedSecret(alice.privateKey, bob.publicKey)
 *   Bob  : computeSharedSecret(bob.privateKey,   alice.publicKey)
 *   → hasilnya identik
 *
 * @param {CryptoKey} myPrivateKey    - Private key milik sendiri
 * @param {CryptoKey} theirPublicKey  - Public key milik lawan bicara
 * @returns {Promise<ArrayBuffer>}    - Raw shared secret bytes (32 byte untuk P-256)
 */
export async function computeSharedSecret(myPrivateKey, theirPublicKey) {
  return crypto.subtle.deriveBits(
    {
      name: "ECDH",
      public: theirPublicKey,
    },
    myPrivateKey,
    256   // 256 bit = 32 byte, sesuai dengan ukuran P-256
  );
}