import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: "postgresql://postgres:Huanthe113!@localhost:5432/mydb"
});

async function checkLengths() {
  try {
    const res = await pool.query(`
      SELECT column_name, character_maximum_length
      FROM information_schema.columns
      WHERE table_name = 'posts'
    `);
    console.log(JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

checkLengths();
