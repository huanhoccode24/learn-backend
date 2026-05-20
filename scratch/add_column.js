const { Pool } = require('pg');

const pool = new Pool({
  connectionString: "postgresql://postgres:Huanthe113!@localhost:5432/mydb"
});

async function addCodeColumn() {
  try {
    await pool.query(`
      ALTER TABLE banners 
      ADD COLUMN IF NOT EXISTS code character varying
    `);
    console.log('Successfully added code column to banners table.');
    
    // Optionally pre-fill existing rows with a default code based on ID
    await pool.query(`
      UPDATE banners 
      SET code = 'BNR' || UPPER(LEFT(id::text, 4)) 
      WHERE code IS NULL
    `);
    console.log('Pre-filled existing banners with default codes.');
    
    process.exit(0);
  } catch (err) {
    console.error('Error adding code column:', err);
    process.exit(1);
  }
}

addCodeColumn();
