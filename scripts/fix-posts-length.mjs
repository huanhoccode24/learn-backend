import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: "postgresql://postgres:Huanthe113!@localhost:5432/mydb"
});

async function fixLengths() {
  try {
    console.log('Fixing column lengths for posts table...');
    await pool.query(`
      ALTER TABLE posts ALTER COLUMN title TYPE TEXT;
      ALTER TABLE posts ALTER COLUMN slug TYPE TEXT;
      ALTER TABLE posts ALTER COLUMN "customAuthor" TYPE TEXT;
    `);
    console.log('Successfully updated columns to TEXT.');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await pool.end();
  }
}

fixLengths();
