import app from './app.js';
import { env } from './config/env.js';
import pool from './config/db.js';

async function startServer() {
  // Test DB connection 
  try {
    await pool.query('SELECT 1');
    console.log('Database connected');
  } catch (err) {
    console.error('Database connection failed:', err);
    process.exit(1);
  }

  app.listen(env.PORT, () => {
    console.log(`Server running on port ${env.PORT}`);
    console.log(`Environment: ${env.NODE_ENV}`);
  });
}

startServer();