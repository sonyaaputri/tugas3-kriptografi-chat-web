/**
 * base64url.js
 * Utilitas konversi Base64URL sesuai standar JWT (RFC 4648 §5)
 * Base64URL berbeda dari Base64 biasa: karakter '+' → '-', '/' → '_', dan tanpa padding '='
 */

/**
 * Mengubah Buffer atau string menjadi string Base64URL
 * @param {Buffer | string} input
 * @returns {string}
 */
function encode(input) {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(input, "utf8");
  return buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

/**
 * Mengubah string Base64URL menjadi Buffer
 * @param {string} input
 * @returns {Buffer}
 */
function decode(input) {
  // Tambahkan padding '=' bila perlu (panjang harus kelipatan 4)
  const padded = input + "=".repeat((4 - (input.length % 4)) % 4);
  // Kembalikan karakter Base64URL ke Base64 standar
  const base64 = padded.replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(base64, "base64");
}

/**
 * Mengubah string Base64URL menjadi string UTF-8
 * @param {string} input
 * @returns {string}
 */
function decodeToString(input) {
  return decode(input).toString("utf8");
}

module.exports = { encode, decode, decodeToString };