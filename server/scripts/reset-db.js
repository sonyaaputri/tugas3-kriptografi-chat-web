import pool from '../src/config/db.js';

async function resetDb() {
  try {
    console.log('Resetting database...');
    
    // Drop tables if they exist (in reverse order due to foreign keys)
    await pool.query('DROP TABLE IF EXISTS messages CASCADE');
    await pool.query('DROP TABLE IF EXISTS users CASCADE');
    await pool.query('DROP EXTENSION IF EXISTS "uuid-ossp"');
    
    console.log('Database reset complete!');
    await pool.end();
  } catch (err) {
    console.error('Reset failed:', err);
    process.exit(1);
  }
}

resetDb();
