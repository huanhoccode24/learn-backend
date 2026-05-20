import fs from 'fs';
import path from 'path';
import pkg from 'pg';
const { Pool } = pkg;
// Phục vụ tạo bảng tự động không cần pgAdmin
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  const connectionString = "postgresql://postgres:Huanthe113!@localhost:5432/mydb";
  const pool = new Pool({ connectionString });

  try {
    const sql = fs.readFileSync(path.join(__dirname, 'setup-db.sql'), 'utf-8');
    console.log('Đang thực thi các câu truy vấn để tạo bảng trên cơ sở dữ liệu "postgres"...');
    await pool.query(sql);
    console.log('Khởi tạo Database thành công! Các bảng users, accounts, sessions đã sẵn sàng.');
  } catch (error) {
    console.error('Lỗi khi khởi tạo database:', error.message);
  } finally {
    await pool.end();
  }
}

run();
