// authStorage.js
// Mengelola penyimpanan sementara untuk autentikasi dan kunci kriptografi di sisi client
// Token JWT disimpan di sessionStorage, sedangkan private key dan kunci turunan disimpan hanya di memori

const SESSION_TOKEN_KEY = "chat_jwt";
const SESSION_EMAIL_KEY = "chat_email";

// Penyimpanan sementara untuk private key, user harus login ulang saat refresh
let _privateKey = null;

// Cache kunci AES
let _aesKeyCache = {};

// Cache kunci HMAC
let _hmacKeyCache = {};

/**
 * Menyimpan token JWT ke sessionStorage
 * @param {string} token
 */
export function saveToken(token) {
  sessionStorage.setItem(SESSION_TOKEN_KEY, token);
}

/**
 * Mengambil token JWT dari sessionStorage
 * @returns {string | null}
 */
export function getToken() {
  return sessionStorage.getItem(SESSION_TOKEN_KEY);
}

/**
 * Menghapus token JWT dari sessionStorage
 */
export function clearToken() {
  sessionStorage.removeItem(SESSION_TOKEN_KEY);
}

/**
 * Menyimpan email user ke sessionStorage
 * @param {string} email
 */
export function saveEmail(email) {
  sessionStorage.setItem(SESSION_EMAIL_KEY, email);
}

/**
 * Mengambil email user dari sessionStorage
 * @returns {string | null}
 */
export function getEmail() {
  return sessionStorage.getItem(SESSION_EMAIL_KEY);
}

/**
 * Menghapus email dari sessionStorage
 */
export function clearEmail() {
  sessionStorage.removeItem(SESSION_EMAIL_KEY);
}

/**
 * Menyimpan private key ke memori
 * @param {CryptoKey} privateKey
 */
export function savePrivateKey(privateKey) {
  _privateKey = privateKey;
}

/**
 * Mengambil private key dari memori
 * @returns {CryptoKey | null}
 */
export function getPrivateKey() {
  return _privateKey;
}


/**
 * Menghapus private key dari memori
 */
export function clearPrivateKey() {
  _privateKey = null;
}

/**
 * Menyimpan hasil derivasi AES key untuk kontak tertentu
 * @param {string} contactEmail
 * @param {CryptoKey} key
 */
export function cacheAesKey(contactEmail, key) {
  _aesKeyCache[contactEmail] = key;
}

/**
 * Mengambil AES key yang sudah di-cache
 * @param {string} contactEmail
 * @returns {CryptoKey | null}
 */
export function getCachedAesKey(contactEmail) {
  return _aesKeyCache[contactEmail] || null;
}

/**
 * Menyimpan hasil derivasi HMAC key untuk kontak tertentu
 * @param {string} contactEmail
 * @param {CryptoKey} key
 */
export function cacheHmacKey(contactEmail, key) {
  _hmacKeyCache[contactEmail] = key;
}


/**
 * Mengambil HMAC key yang sudah di-cache
 * @param {string} contactEmail
 * @returns {CryptoKey | null}
 */
export function getCachedHmacKey(contactEmail) {
  return _hmacKeyCache[contactEmail] || null;
}

/**
 * Menghapus seluruh data autentikasi dan cache (digunakan saat logout)
 */
export function clearAll() {
  clearToken();
  clearEmail();
  clearPrivateKey();
  _aesKeyCache = {};
  _hmacKeyCache = {};
}

/**
 * Mengecek apakah user sudah terautentikasi
 * @returns {boolean}
 */
export function isAuthenticated() {
  return !!getToken();
}