import pool from '../config/db.js';

export async function saveMessage({ senderEmail, receiverEmail, ciphertext, iv, mac }) {
  const result = await pool.query(
    `INSERT INTO messages (sender_email, receiver_email, ciphertext, iv, mac)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [senderEmail, receiverEmail, ciphertext, iv, mac || null]
  );
  return result.rows[0];
}

export async function getMessages(userEmail, contactEmail) {
  const result = await pool.query(
    `SELECT * FROM messages
     WHERE 
       (sender_email = $1 AND receiver_email = $2)
       OR
       (sender_email = $2 AND receiver_email = $1)
     ORDER BY timestamp ASC`,
    [userEmail, contactEmail]
  );
  return result.rows;
}