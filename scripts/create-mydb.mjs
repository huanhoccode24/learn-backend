import pkg from 'pg';
const { Pool } = pkg;

async function createDatabase() {
  // Bắt buộc phải kết nối vào database mặc định 'postgres' trước mới có quyền tạo DB mới
  const connectionString = "postgresql://postgres:Huanthe113!@localhost:5432/postgres";
  const pool = new Pool({ connectionString });

  try {
    console.log('Đang tạo Database "mydb"...');
    await pool.query('CREATE DATABASE mydb');
    console.log('Tạo database "mydb" thành công!');
  } catch (error) {
    if (error.code === '42P04') {
      console.log('Database "mydb" đã tồn tại sẵn!');
    } else {
      console.error('Lỗi khi tạo database:', error.message);
    }
  } finally {
    await pool.end();
  }
}

createDatabase();
