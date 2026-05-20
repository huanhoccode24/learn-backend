import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: "postgresql://postgres:Huanthe113!@localhost:5432/mydb"
});

async function checkUser() {
  try {
    const res = await pool.query("SELECT id, name, email, role FROM users WHERE email = 'huandev113@gmail.com'");
    console.log("USER DATA IN DATABASE:", JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

checkUser();
