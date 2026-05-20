const { Pool } = require('pg');

const pool = new Pool({
  connectionString: "postgresql://postgres:Huanthe113!@localhost:5432/mydb"
});

async function checkBanner() {
  const id = 'cb8a304f-3e19-491a-879d-1daa2c7d7bec';
  try {
    const res = await pool.query('SELECT id, title FROM banners WHERE id = $1', [id]);
    if (res.rows.length > 0) {
      console.log('Banner found:', res.rows[0]);
    } else {
      console.log('Banner NOT found');
    }
    process.exit(0);
  } catch (err) {
    console.error('Error checking banner:', err);
    process.exit(1);
  }
}

checkBanner();
