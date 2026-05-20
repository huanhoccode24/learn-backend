import pkg from 'pg';
const { Pool } = pkg;

async function setupRefreshTokensTable() {
  const connectionString = "postgresql://postgres:Huanthe113!@localhost:5432/mydb";
  const pool = new Pool({ connectionString });

  try {
    console.log('Đang tạo bảng refresh_tokens...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token TEXT NOT NULL UNIQUE,
        expires TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      -- Index để tăng tốc query theo user_id
      CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
      -- Index để tăng tốc query theo token
      CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token);
    `);

    console.log('Đã tạo xong bảng refresh_tokens!');
  } catch (error) {
    console.error('Lỗi khi tạo bảng:', error.message);
  } finally {
    await pool.end();
  }
}

setupRefreshTokensTable();
