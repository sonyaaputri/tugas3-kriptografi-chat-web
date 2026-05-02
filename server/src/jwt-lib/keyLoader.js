/**
 * keyLoader.js
 * Utilitas untuk memuat private key dan public key dari format PEM
 * ke dalam objek KeyObject Node.js yang siap digunakan oleh modul crypto
 */

const crypto = require("crypto");
const { JWTError, ERROR_MESSAGES } = require("./errors");

/**
 * Memuat private key dari string PEM
 * @param {string} pem - String PEM private key (PKCS8 atau SEC1)
 * @returns {crypto.KeyObject}
 */
function loadPrivateKey(pem) {
  if (!pem || typeof pem !== "string") {
    throw new JWTError(ERROR_MESSAGES.MISSING_PRIVATE_KEY);
  }
  try {
    return crypto.createPrivateKey(pem);
  } catch (err) {
    throw new JWTError(`${ERROR_MESSAGES.MISSING_PRIVATE_KEY}: ${err.message}`);
  }
}

/**
 * Memuat public key dari string PEM
 * @param {string} pem - String PEM public key (SPKI)
 * @returns {crypto.KeyObject}
 */
function loadPublicKey(pem) {
  if (!pem || typeof pem !== "string") {
    throw new JWTError(ERROR_MESSAGES.MISSING_PUBLIC_KEY);
  }
  try {
    return crypto.createPublicKey(pem);
  } catch (err) {
    throw new JWTError(`${ERROR_MESSAGES.MISSING_PUBLIC_KEY}: ${err.message}`);
  }
}

/**
 * Memetakan nama algoritma JWT (ES256/ES384/ES512) ke nama hash SHA
 * yang digunakan oleh Node.js crypto untuk ECDSA
 * @param {string} alg
 * @returns {{ dsaEncoding: string, hash: string }}
 */
function algToHashOptions(alg) {
  // namedCurve menggunakan nama OpenSSL (yang dilaporkan oleh Node.js asymmetricKeyDetails)
  // bukan nama NIST (P-256, P-384, P-521)
  const map = {
    ES256: { hash: "SHA-256", namedCurve: "prime256v1" },
    ES384: { hash: "SHA-384", namedCurve: "secp384r1"  },
    ES512: { hash: "SHA-512", namedCurve: "secp521r1"  },
  };
  return map[alg] || null;
}

module.exports = { loadPrivateKey, loadPublicKey, algToHashOptions };