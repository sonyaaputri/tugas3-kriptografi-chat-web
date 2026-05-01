// authApi.js
// Melakukan request API terkait autentikasi (login dan register)

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

/**
 * Melakukan register
 * @param {Object} payload
 * @param {string} payload.email               : Email pengguna
 * @param {string} payload.password            : Password plaintext -> hash
 * @param {string} payload.publicKey           : Public key (base64)
 * @param {string} payload.encryptedPrivateKey : Private key yang sudah dienkripsi (base64)
 * @param {string} payload.iv                  : Initialization Vector untuk enkripsi private key (base64)
 * @param {string} payload.salt                : Salt untuk proses Key Derivation Function (KDF)
 */
export async function register(payload) {
  const res = await fetch(`${BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || data.message || "Registration failed");
  return data;
}

/**
 * Melakukan login dan mendapatkan token JWT
 * @param {string} email
 * @param {string} password
 * @returns {{ token: string }}
 */
export async function login(email, password) {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || data.message || "Login failed");
  return data;
}