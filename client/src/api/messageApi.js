// messageApi.js
// Melakukan request API untuk mengirim dan menerima pesan

import { getToken } from "../storage/authStorage.js";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  };
}

/**
 * Mengirim pesan terenkripsi ke server
 * @param {Object} payload
 * @param {string} payload.receiverEmail
 * @param {string} payload.ciphertext
 * @param {string} payload.iv
 * @param {string} payload.mac
 */
export async function sendMessage(payload) {
  const res = await fetch(`${BASE_URL}/api/messages`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to send message");
  return data;
}

/**
 * Mengambil seluruh pesan dengan kontak tertentu
 * @param {string} contactEmail
 * @returns {Array<{ senderEmail, ciphertext, iv, mac, timestamp }>}
 */
export async function getMessages(contactEmail) {
  const res = await fetch(
    `${BASE_URL}/api/messages/${encodeURIComponent(contactEmail)}`,
    { headers: authHeaders() }
  );

  const data = await res.json();
  // Mengirim pesan error jika gagal
  if (!res.ok) throw new Error(data.error || "Failed to fetch messages");
  return data;
}