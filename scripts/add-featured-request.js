const { Pool } = require('pg');

async function run() {
  const pool = new Pool({
    connectionString: "postgresql://postgres:Huanthe113!@localhost:5432/mydb",
  });

  try {
    console.log('Adding featured_request column...');
    await pool.query('ALTER TABLE posts ADD COLUMN IF NOT EXISTS featured_request BOOLEAN DEFAULT false;');
    console.log('Success!');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

run();
