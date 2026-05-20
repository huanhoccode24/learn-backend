/* eslint-disable @typescript-eslint/no-require-imports */
const pg = require('pg');
const { Pool } = pg;

const pool = new Pool({
  connectionString: "postgresql://postgres:Huanthe113!@localhost:5432/mydb"
});

async function migrate() {
  try {
    await pool.query(`
      ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS "phoneNumber" TEXT,
        ADD COLUMN IF NOT EXISTS "address" TEXT,
        ADD COLUMN IF NOT EXISTS "facebookLink" TEXT,
        ADD COLUMN IF NOT EXISTS "tiktokLink" TEXT,
        ADD COLUMN IF NOT EXISTS "youtubeLink" TEXT;
    `);
    console.log('Migration Success - Added profile fields');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await pool.end();
  }
}

migrate();
