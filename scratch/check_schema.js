const { Pool } = require('pg');

const pool = new Pool({
  connectionString: "postgresql://postgres:Huanthe113!@localhost:5432/mydb"
});

async function checkSchema() {
  try {
    const res = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'banners'
    `);
    console.log('Columns in banners table:');
    res.rows.forEach(row => {
      console.log(`- ${row.column_name} (${row.data_type})`);
    });
    process.exit(0);
  } catch (err) {
    console.error('Error checking schema:', err);
    process.exit(1);
  }
}

checkSchema();
