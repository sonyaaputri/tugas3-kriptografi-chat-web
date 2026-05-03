import pool from '../config/db.js';

async function seed() {
  // Kalau mau pre-populate test users
  console.log('Seeding...');
  // await pool.query(`INSERT INTO users ...`);
  console.log('Done!');
  await pool.end();
}

seed().catch(console.error);