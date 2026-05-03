// userApi.js
// Melakukan request API untuk manajemen user atau kontak

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Membuat header HTTP yang berisi Authorization (JWT) untuk autentikasi
function authHeaders(token) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

/**
 * Mengambil daftar kontak
 * @param {string} token - JWT token
 * @returns {Array<{ email: string, publicKey: string }>}
 */
export async function getContacts(token) {
  const res = await fetch(`${BASE_URL}/api/users/contacts`, {
    headers: authHeaders(token),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to fetch contacts");
  return data.data;  // Extract the data object from the response
}

/**
 * Mengambil public key milik user berdasarkan email
 * @param {string} email
 * @param {string} token - JWT token
 * @returns {{ publicKey: string }}
 */
export async function getPublicKey(email, token) {
  const res = await fetch(
    `${BASE_URL}/api/users/${encodeURIComponent(email)}/public-key`,
    { headers: authHeaders(token) }
  );

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to fetch public key");
  return data.data;  // Extract the data object from the response
}

/**
 * Mengambil private key milik user untuk mendekripsi dan memulihkan private key
 * @returns {{ encryptedPrivateKey: string, iv: string, salt: string }}
 */
export async function getMyPrivateKeyData() {
  const res = await fetch(`${BASE_URL}/api/users/me/private-key`, {
    headers: authHeaders(),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to fetch private key data");
  return data;
}