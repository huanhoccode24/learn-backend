import pkg from 'pg';
const { Pool } = pkg;

async function setupOtpTables() {
  const connectionString = "postgresql://postgres:Huanthe113!@localhost:5432/mydb";
  const pool = new Pool({ connectionString });

  try {
    console.log('Đang tạo bảng two_factor_tokens...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS two_factor_tokens (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        token VARCHAR(255) NOT NULL,
        expires TIMESTAMPTZ NOT NULL,
        UNIQUE(email, token)
      );
    `);
    
    console.log('Đã tạo xong các bảng hỗ trợ 2FA OTP!');
  } catch (error) {
    console.error('Lỗi khi tạo bảng OTP:', error.message);
  } finally {
    await pool.end();
  }
}

setupOtpTables();
