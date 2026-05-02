/**
 * verify.js
 * Implementasi fungsi verify JWT sesuai RFC 7519 Section 7.2
 *
 * Langkah validasi (sesuai spesifikasi):
 *  1. Pastikan JWT memiliki 3 segmen dipisahkan titik
 *  2. Decode header, pastikan valid JSON
 *  3. Decode payload, pastikan valid JSON
 *  4. Verifikasi signature dengan public key
 *  5. Validasi klaim waktu (exp, nbf) jika tidak di-ignore
 *  6. Validasi klaim lain (iss, sub, aud, jti) jika dispesifikasikan di options
 */

const crypto = require("crypto");
const { decode, decodeToString } = require("./base64url");
const { JWTError, ERROR_MESSAGES } = require("./errors");
const { loadPublicKey, algToHashOptions } = require("./keyLoader");

const SUPPORTED_ALGS = ["ES256", "ES384", "ES512"];

/**
 * Memverifikasi dan mendekode JWT
 *
 * @param {string} jwt - Token JWT dalam format header.payload.signature
 * @param {string} publicKey - PEM string public key
 * @param {Object} [options]
 * @param {string[]} [options.algs]       - Daftar algoritma yang diizinkan
 * @param {string}   [options.iss]        - Nilai iss yang diharapkan
 * @param {string}   [options.sub]        - Nilai sub yang diharapkan
 * @param {string}   [options.aud]        - Nilai aud yang diharapkan
 * @param {boolean}  [options.ignoreExp]  - Lewati validasi exp jika true
 * @param {boolean}  [options.ignoreNbf]  - Lewati validasi nbf jika true
 * @param {string}   [options.jti]        - Nilai jti yang diharapkan
 *
 * @returns {{ header: Object, payload: Object, signature: string }}
 * @throws {JWTError} jika token tidak valid
 */
function verify(jwt, publicKey, options = {}) {
  // --- 1. Validasi input dasar ---
  if (!jwt || typeof jwt !== "string") {
    throw new JWTError(ERROR_MESSAGES.MISSING_JWT);
  }
  if (!publicKey) {
    throw new JWTError(ERROR_MESSAGES.MISSING_PUBLIC_KEY);
  }

  // --- 2. Pisahkan token menjadi 3 segmen ---
  const parts = jwt.split(".");
  if (parts.length !== 3) {
    throw new JWTError(ERROR_MESSAGES.INVALID_FORMAT);
  }
  const [headerB64, payloadB64, signatureB64] = parts;

  // --- 3. Decode & parse header ---
  let header;
  try {
    const headerStr = decodeToString(headerB64);
    header = JSON.parse(headerStr);
  } catch {
    try {
      decodeToString(headerB64);
      throw new JWTError(ERROR_MESSAGES.INVALID_HEADER_JSON);
    } catch (inner) {
      if (inner instanceof JWTError) throw inner;
      throw new JWTError(ERROR_MESSAGES.INVALID_HEADER_ENCODING);
    }
  }

  // --- 4. Validasi algoritma di header ---
  if (!header.alg || !SUPPORTED_ALGS.includes(header.alg)) {
    throw new JWTError(ERROR_MESSAGES.UNSUPPORTED_ALG);
  }
  if (options.algs && !options.algs.includes(header.alg)) {
    throw new JWTError(ERROR_MESSAGES.HEADER_ALG_MISMATCH);
  }

  // --- 5. Decode & parse payload ---
  let payload;
  try {
    const payloadStr = decodeToString(payloadB64);
    payload = JSON.parse(payloadStr);
  } catch {
    try {
      decodeToString(payloadB64);
      throw new JWTError(ERROR_MESSAGES.INVALID_PAYLOAD_JSON);
    } catch (inner) {
      if (inner instanceof JWTError) throw inner;
      throw new JWTError(ERROR_MESSAGES.INVALID_PAYLOAD_ENCODING);
    }
  }

  // --- 6. Verifikasi signature ---
  const signingInput = `${headerB64}.${payloadB64}`;
  const hashOpts = algToHashOptions(header.alg);

  let keyObject;
  try {
    keyObject = loadPublicKey(publicKey);
  } catch (err) {
    throw new JWTError(`${ERROR_MESSAGES.MISSING_PUBLIC_KEY}: ${err.message}`);
  }

  let signatureBuffer;
  try {
    signatureBuffer = decode(signatureB64);
  } catch {
    throw new JWTError(ERROR_MESSAGES.INVALID_SIGNATURE);
  }

  let isValid;
  try {
    isValid = crypto.verify(
      hashOpts.hash,
      Buffer.from(signingInput),
      { key: keyObject, dsaEncoding: "ieee-p1363" },
      signatureBuffer
    );
  } catch {
    throw new JWTError(ERROR_MESSAGES.INVALID_SIGNATURE);
  }

  if (!isValid) {
    throw new JWTError(ERROR_MESSAGES.INVALID_SIGNATURE);
  }

  // --- 7. Validasi klaim waktu ---
  const now = Math.floor(Date.now() / 1000);

  if (!options.ignoreExp && payload.exp !== undefined) {
    if (now >= payload.exp) {
      throw new JWTError(ERROR_MESSAGES.TOKEN_EXPIRED);
    }
  }

  if (!options.ignoreNbf && payload.nbf !== undefined) {
    if (now < payload.nbf) {
      throw new JWTError(ERROR_MESSAGES.TOKEN_NOT_YET_VALID);
    }
  }

  // --- 8. Validasi klaim lain dari options ---
  if (options.iss !== undefined && payload.iss !== options.iss) {
    throw new JWTError(ERROR_MESSAGES.CLAIM_ISS_MISMATCH);
  }
  if (options.sub !== undefined && payload.sub !== options.sub) {
    throw new JWTError(ERROR_MESSAGES.CLAIM_SUB_MISMATCH);
  }
  if (options.aud !== undefined && payload.aud !== options.aud) {
    throw new JWTError(ERROR_MESSAGES.CLAIM_AUD_MISMATCH);
  }
  if (options.jti !== undefined && payload.jti !== options.jti) {
    throw new JWTError(ERROR_MESSAGES.CLAIM_JTI_MISMATCH);
  }

  return { header, payload, signature: signatureB64 };
}

module.exports = { verify };