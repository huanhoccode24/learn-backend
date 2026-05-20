/* eslint-disable @typescript-eslint/no-require-imports */
const pg = require('pg');
const { Pool } = pg;

const pool = new Pool({
  connectionString: "postgresql://postgres:Huanthe113!@localhost:5432/mydb"
});

async function migrate() {
  try {
    await pool.query(`ALTER TABLE posts ADD COLUMN IF NOT EXISTS "customAuthor" VARCHAR(255);`);
    await pool.query(`ALTER TABLE posts ADD COLUMN IF NOT EXISTS description TEXT;`);
    console.log('Migration Success');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await pool.end();
  }
}

migrate();
