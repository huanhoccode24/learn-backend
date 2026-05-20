import fs from 'fs';
import path from 'path';
import pkg from 'pg';
const { Pool } = pkg;
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  const connectionString = "postgresql://postgres:Huanthe113!@localhost:5432/mydb";
  const pool = new Pool({ connectionString });

  try {
    const sql = fs.readFileSync(path.join(__dirname, 'update-homepage.sql'), 'utf-8');
    console.log('Đang thực thi các câu truy vấn để cập nhật cấu trúc Homepage...');
    await pool.query(sql);
    console.log('Cập nhật Database thành công!');
  } catch (error) {
    console.error('Lỗi khi cập nhật database:', error.message);
  } finally {
    await pool.end();
  }
}

run();
