import pool from '../config/db.js';

// List semua user 
export async function getAllUsers(excludeEmail) {
  const result = await pool.query(
    `SELECT 
      u.username,
      u.email,
      u.public_key as "publicKey",
      (
        u.is_online = TRUE
        AND u.last_seen IS NOT NULL
        AND u.last_seen > CURRENT_TIMESTAMP - INTERVAL '10 seconds'
      ) as "isOnline",
      u.last_seen as "lastSeen",
      (
        SELECT ciphertext
        FROM messages
        WHERE (sender_email = u.email AND receiver_email = $1) 
           OR (sender_email = $1 AND receiver_email = u.email)
        ORDER BY timestamp DESC
        LIMIT 1
      ) as "lastMessage",
      (
        SELECT timestamp
        FROM messages
        WHERE (sender_email = u.email AND receiver_email = $1) 
           OR (sender_email = $1 AND receiver_email = u.email)
        ORDER BY timestamp DESC
        LIMIT 1
      ) as "lastMessageTime"
    FROM users u
    WHERE u.email != $1
    ORDER BY "lastMessageTime" DESC NULLS LAST, u.username, u.email`,
    [excludeEmail]
  );
  return result.rows;
}

// Ambil public key user spesifik (untuk key exchange ECDH)
export async function getUserPublicKey(email) {
  const result = await pool.query(
    `SELECT
       username,
       email,
       public_key as "publicKey",
       (
         is_online = TRUE
         AND last_seen IS NOT NULL
         AND last_seen > CURRENT_TIMESTAMP - INTERVAL '10 seconds'
       ) as "isOnline",
       last_seen as "lastSeen"
     FROM users WHERE email = $1`,
    [email]
  );
  if (result.rows.length === 0) throw new Error('User not found');
  return result.rows[0];
}
