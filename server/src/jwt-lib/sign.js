/**
 * sign.js
 * Implementasi fungsi sign JWT sesuai spesifikasi tugas (RFC 7515 / RFC 7519)
 *
 * Format output: base64url(header).base64url(payload).base64url(signature)
 *
 * Algoritma yang didukung:
 *   ES256 → ECDSA dengan kurva P-256 dan SHA-256
 *   ES384 → ECDSA dengan kurva P-384 dan SHA-384
 *   ES512 → ECDSA dengan kurva P-521 dan SHA-512
 */

import crypto from "crypto";
import { encode } from "./base64url.js";
import { JWTError, ERROR_MESSAGES } from "./errors.js";
import { loadPrivateKey, algToHashOptions } from "./keyLoader.js";

const SUPPORTED_ALGS = ["ES256", "ES384", "ES512"];

/**
 * Membuat dan menandatangani JWT
 *
 * @param {Object} header
 * @param {Object} header.alg  - "ES256" | "ES384" | "ES512" (wajib)
 * @param {Object} header.typ  - "JWT" (wajib)
 *
 * @param {Object} [claims]
 * @param {string}        [claims.iss]
 * @param {string}        [claims.sub]
 * @param {string}        [claims.aud]
 * @param {number}        [claims.exp]  - NumericDate (Unix timestamp)
 * @param {number}        [claims.nbf]  - NumericDate
 * @param {number}        [claims.iat]  - NumericDate
 * @param {string}        [claims.jti]
 *
 * @param {Object} [payload] - Klaim tambahan (public/private claim)
 *                             Jika key sama dengan claims, nilai dari claims digunakan
 *
 * @param {string} privateKey - PEM string private key
 *
 * @returns {string} JWT dalam format header.payload.signature (semua Base64URL)
 */
function sign(header, claims = {}, payload = {}, privateKey) {
  // --- Validasi header ---
  if (!header || typeof header !== "object") {
    throw new JWTError(ERROR_MESSAGES.MISSING_HEADER);
  }
  if (!header.alg) {
    throw new JWTError(ERROR_MESSAGES.MISSING_ALG);
  }
  if (!SUPPORTED_ALGS.includes(header.alg)) {
    throw new JWTError(ERROR_MESSAGES.UNSUPPORTED_ALG);
  }
  if (header.typ !== "JWT") {
    throw new JWTError(ERROR_MESSAGES.INVALID_TYP);
  }

  // --- Validasi private key ---
  if (!privateKey) {
    throw new JWTError(ERROR_MESSAGES.MISSING_PRIVATE_KEY);
  }

  // --- Bangun payload akhir ---
  // Mulai dari payload bebas, lalu timpa dengan nilai dari claims (claims lebih prioritas)
  let finalPayload;
  try {
    // Cek dulu apakah payload bisa di-serialize
    JSON.stringify(payload);
    finalPayload = { ...payload, ...claims };
    // Hapus kunci claims yang nilainya undefined agar tidak muncul di token
    Object.keys(finalPayload).forEach((k) => {
      if (finalPayload[k] === undefined) delete finalPayload[k];
    });
  } catch {
    throw new JWTError(ERROR_MESSAGES.INVALID_PAYLOAD);
  }

  // Tambahkan iat otomatis jika belum ada
  if (!finalPayload.iat) {
    finalPayload.iat = Math.floor(Date.now() / 1000);
  }

  // --- Encode header dan payload ke Base64URL ---
  let headerB64, payloadB64;
  try {
    headerB64 = encode(JSON.stringify(header));
    payloadB64 = encode(JSON.stringify(finalPayload));
  } catch {
    throw new JWTError(ERROR_MESSAGES.INVALID_PAYLOAD);
  }

  // --- Signing ---
  const signingInput = `${headerB64}.${payloadB64}`;
  const hashOpts = algToHashOptions(header.alg);

  let keyObject;
  try {
    keyObject = loadPrivateKey(privateKey);
  } catch (err) {
    throw new JWTError(`${ERROR_MESSAGES.SIGN_FAILED}: ${err.message}`);
  }

  // Validasi bahwa kurva key sesuai dengan algoritma
  // ES256→P-256, ES384→P-384, ES512→P-521
  try {
    const keyDetails = keyObject.asymmetricKeyDetails;
    const expectedCurve = hashOpts.namedCurve; // "P-256", "P-384", "P-521"
    if (keyDetails && keyDetails.namedCurve && keyDetails.namedCurve !== expectedCurve) {
      throw new JWTError(
        `${ERROR_MESSAGES.UNSUPPORTED_ALG}: kunci menggunakan kurva ${keyDetails.namedCurve}, bukan ${expectedCurve}`
      );
    }
  } catch (err) {
    if (err instanceof JWTError) throw err;
    // Jika tidak bisa mendapatkan detail kurva, lanjutkan saja
  }

  let signatureBuffer;
  try {
    // Node.js crypto.sign menghasilkan DER-encoded signature untuk ECDSA
    // JWT menggunakan format IEEE P1363 (R || S), jadi kita pakai dsaEncoding: 'ieee-p1363'
    signatureBuffer = crypto.sign(hashOpts.hash, Buffer.from(signingInput), {
      key: keyObject,
      dsaEncoding: "ieee-p1363",
    });
  } catch (err) {
    throw new JWTError(`${ERROR_MESSAGES.SIGN_FAILED}: ${err.message}`);
  }

  const signatureB64 = encode(signatureBuffer);

  return `${signingInput}.${signatureB64}`;
}

export { sign };