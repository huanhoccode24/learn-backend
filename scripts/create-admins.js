const { Pool } = require('pg');
const bcrypt = require('bcryptjs');


const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function createAdmins() {
  const passwordHash = await bcrypt.hash('admin123', 10);
  
  await pool.query(`
    INSERT INTO users (name, email, password, role)
    VALUES 
      ('Admin Huan 1', 'admin1@learn.com', $1, 'ADMIN'),
      ('Admin Huan 2', 'admin2@learn.com', $1, 'ADMIN')
    ON CONFLICT (email) DO UPDATE SET role = 'ADMIN', password = $1;
  `, [passwordHash]);

  console.log('Đã tạo thành công 2 tài khoản Admin:');
  console.log('1. admin1@learn.com / Mật khẩu: admin123');
  console.log('2. admin2@learn.com / Mật khẩu: admin123');
  
  process.exit(0);
}

createAdmins().catch(console.error);
