import pkg from 'pg';
const { Pool } = pkg;

async function optimizeDatabase() {
  const connectionString = "postgresql://postgres:Huanthe113!@localhost:5432/mydb";
  const pool = new Pool({ connectionString });

  try {
    console.log('--- Đang tiến hành tối ưu hóa Database ---');

    // 1. Index cho bảng two_factor_tokens
    console.log('Tối ưu bảng two_factor_tokens...');
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_two_factor_tokens_email ON two_factor_tokens(email);
    `);

    // 2. Index cho bảng accounts (quan trọng cho OAuth)
    console.log('Tối ưu bảng accounts...');
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts("userId");
      CREATE INDEX IF NOT EXISTS idx_accounts_provider_account_id ON accounts("providerAccountId");
    `);

    // 3. Index cho các bảng mặc định khác nếu cần
    console.log('Tối ưu bảng sessions...');
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions("userId");
    `);

    console.log('===> Đã hoàn thành thêm các Index tối ưu hiệu suất!');
  } catch (error) {
    console.error('Lỗi khi tối ưu Database:', error.message);
  } finally {
    await pool.end();
  }
}

optimizeDatabase();
