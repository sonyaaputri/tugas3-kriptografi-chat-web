import { verify } from '../jwt-lib/index.js';
import { sendError } from '../utils/response.js';
import { env } from '../config/env.js';
import pool from '../config/db.js';
import fs from 'fs';

export async function authenticate(req, res, next) {
  // Ambil token dari Authorization header: "Bearer <token>"
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendError(res, 'No token provided', 401);
  }

  const token = authHeader.split(' ')[1];

  try {
    const publicKeyPem = fs.readFileSync(env.JWT_PUBLIC_KEY_PATH, 'utf8');
    
    const decoded = verify(token, publicKeyPem, {
      algs: [env.JWT_ALGORITHM],
      iss: 'secure-chat-server',
      aud: 'secure-chat-client',
    });

    // Simpan info user di request object
    req.user = decoded.payload;
    await pool.query(
      'UPDATE users SET is_online = TRUE, last_seen = CURRENT_TIMESTAMP WHERE email = $1',
      [req.user.email]
    );
    next();
  } catch (err) {
    return sendError(res, err.message, 401);
  }
}
