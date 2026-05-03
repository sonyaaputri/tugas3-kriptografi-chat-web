// messageApi.js
// Melakukan request API untuk mengirim dan menerima pesan

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function authHeaders(token) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

/**
 * Mengirim pesan terenkripsi ke server
 * @param {Object} payload
 * @param {string} payload.receiverEmail
 * @param {string} payload.ciphertext
 * @param {string} payload.iv
 * @param {string} payload.mac
 * @param {string} token - JWT token
 */
export async function sendMessage(payload, token) {
  const res = await fetch(`${BASE_URL}/api/messages`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to send message");
  return data.data;  // Extract the data object from the response
}

/**
 * Mengambil seluruh pesan dengan kontak tertentu
 * @param {string} contactEmail
 * @param {string} token - JWT token
 * @returns {Array<{ senderEmail, ciphertext, iv, mac, timestamp }>}
 */
export async function getMessages(contactEmail, token) {
  const res = await fetch(
    `${BASE_URL}/api/messages/${encodeURIComponent(contactEmail)}`,
    { headers: authHeaders(token) }
  );

  const data = await res.json();
  // Mengirim pesan error jika gagal
  if (!res.ok) throw new Error(data.error || "Failed to fetch messages");
  return data.data;  // Extract the data object from the response
}