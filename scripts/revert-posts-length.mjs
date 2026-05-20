import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: "postgresql://postgres:Huanthe113!@localhost:5432/mydb"
});

async function revertLengths() {
  try {
    console.log('Reverting column lengths for posts table to VARCHAR(255)...');
    await pool.query(`
      ALTER TABLE posts ALTER COLUMN title TYPE VARCHAR(255);
      ALTER TABLE posts ALTER COLUMN slug TYPE VARCHAR(255);
      ALTER TABLE posts ALTER COLUMN "customAuthor" TYPE VARCHAR(255);
    `);
    console.log('Successfully reverted columns to VARCHAR(255).');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await pool.end();
  }
}

revertLengths();
