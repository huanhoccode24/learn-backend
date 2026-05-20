import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: "postgresql://postgres:Huanthe113!@localhost:5432/mydb"
});

async function migrate() {
  try {
    await pool.query(`
      ALTER TABLE posts ADD COLUMN IF NOT EXISTS "rejectionReason" text;
    `);
    console.log("Column 'rejectionReason' added successfully (or already exists).");
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

migrate();
