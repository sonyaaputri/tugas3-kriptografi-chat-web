// userApi.js
// Melakukan request API untuk manajemen user atau kontak

import { getToken } from "../storage/authStorage.js";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Membuat header HTTP yang berisi Authorization (JWT) untuk autentikasi
function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  };
}

/**
 * Mengambil daftar kontak
 * @returns {Array<{ email: string, publicKey: string }>}
 */
export async function getContacts() {
  const res = await fetch(`${BASE_URL}/api/users/contacts`, {
    headers: authHeaders(),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to fetch contacts");
  return data;
}

/**
 * Mengambil public key milik user berdasarkan email
 * @param {string} email
 * @returns {{ publicKey: string }}
 */
export async function getPublicKey(email) {
  const res = await fetch(
    `${BASE_URL}/api/users/${encodeURIComponent(email)}/public-key`,
    { headers: authHeaders() }
  );

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to fetch public key");
  return data;
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