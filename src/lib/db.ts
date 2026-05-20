import { Pool } from 'pg';

// Đảm bảo chỉ có một instance Pool được tạo trong môi trường phát triển Next.js
// để tránh lỗi Exhausted Connections (quá tải kết nối).
const globalForDb = globalThis as unknown as {
  pool: Pool | undefined;
};

export const pool =
  globalForDb.pool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    // Tối ưu hóa Pool Settings
    max: 10, // Giới hạn số kết nối đồng thời
    idleTimeoutMillis: 30000, // Đóng kết nối nhàn rỗi sau 30s
    connectionTimeoutMillis: 2000, // Timeout nếu không kết nối được sau 2s
    // ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
  });

if (process.env.NODE_ENV !== 'production') globalForDb.pool = pool;

export default pool;
