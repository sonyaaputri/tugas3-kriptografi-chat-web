/**
 * errors.js
 * Custom error class untuk JWT library
 * Semua error yang dilempar oleh fungsi sign/verify menggunakan class ini
 * sehingga pemanggil bisa membedakan JWT error dari error lain
 */

class JWTError extends Error {
  /**
   * @param {string} message - Pesan error yang deskriptif
   */
  constructor(message) {
    super(message);
    this.name = "JWTError";
  }
}

// Pesan error standar agar konsisten di seluruh library
const ERROR_MESSAGES = {
  // --- Sign errors ---
  MISSING_HEADER:           "Header JWT tidak boleh kosong",
  MISSING_ALG:              "Parameter 'alg' wajib ada di header",
  UNSUPPORTED_ALG:          "Algoritma tidak didukung. Gunakan ES256, ES384, atau ES512",
  INVALID_TYP:              "Parameter 'typ' harus bernilai 'JWT'",
  INVALID_PAYLOAD:          "Payload tidak dapat di-serialize menjadi JSON",
  MISSING_PRIVATE_KEY:      "Private key tidak boleh kosong",
  SIGN_FAILED:              "Proses signing JWT gagal",

  // --- Verify errors ---
  MISSING_JWT:              "Token JWT tidak boleh kosong",
  INVALID_FORMAT:           "Format JWT tidak valid. Harus berupa tiga segmen dipisahkan titik",
  INVALID_HEADER_ENCODING:  "Header JWT tidak dapat di-decode (bukan Base64URL yang valid)",
  INVALID_HEADER_JSON:      "Header JWT bukan JSON yang valid",
  INVALID_PAYLOAD_ENCODING: "Payload JWT tidak dapat di-decode (bukan Base64URL yang valid)",
  INVALID_PAYLOAD_JSON:     "Payload JWT bukan JSON yang valid",
  HEADER_ALG_MISMATCH:      "Algoritma di header tidak sesuai dengan daftar yang diizinkan",
  INVALID_SIGNATURE:        "Signature JWT tidak valid",
  TOKEN_EXPIRED:            "Token JWT sudah kedaluwarsa (exp)",
  TOKEN_NOT_YET_VALID:      "Token JWT belum berlaku (nbf)",
  CLAIM_ISS_MISMATCH:       "Klaim 'iss' tidak sesuai",
  CLAIM_SUB_MISMATCH:       "Klaim 'sub' tidak sesuai",
  CLAIM_AUD_MISMATCH:       "Klaim 'aud' tidak sesuai",
  CLAIM_JTI_MISMATCH:       "Klaim 'jti' tidak sesuai",
  MISSING_PUBLIC_KEY:       "Public key tidak boleh kosong",
  VERIFY_FAILED:            "Proses verifikasi JWT gagal",
};

export { JWTError, ERROR_MESSAGES };