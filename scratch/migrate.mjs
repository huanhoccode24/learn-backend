import pool from './src/lib/db.js';

async function migrate() {
  try {
    console.log('Starting migration...');
    await pool.query('ALTER TABLE categories ADD COLUMN IF NOT EXISTS "isHidden" BOOLEAN DEFAULT FALSE');
    console.log('Migration successful: Added isHidden column to categories.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
