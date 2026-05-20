import pool from '@/lib/db';

export interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
  image: string | null;
  createdAt: string;
  providers: string[];
}

/**
 * Lấy danh sách toàn bộ người dùng ngoại trừ người dùng hiện tại (Admin đang gọi)
 * Bao gồm danh sách các nền tảng đã liên kết (Google, GitHub, v.v.)
 */
export async function getAdminUsers(currentUserId: string): Promise<User[]> {
  try {
    const result = await pool.query(
      `SELECT u.id, u.name, u.email, u.role, u.image, u."createdAt",
              COALESCE(array_agg(DISTINCT a.provider) FILTER (WHERE a.provider IS NOT NULL), '{}') AS providers
       FROM users u
       LEFT JOIN accounts a ON u.id = a."userId"
       WHERE u.id != $1
       GROUP BY u.id, u.name, u.email, u.role, u.image, u."createdAt"
       ORDER BY u."createdAt" DESC`,
      [currentUserId]
    );
    return result.rows;
  } catch (error) {
    console.error('Database Error (getAdminUsers):', error);
    throw new Error('Không thể lấy danh sách người dùng từ cơ sở dữ liệu.');
  }
}

/**
 * Lấy thống kê tổng quan cho Dashboard
 */
export async function getAdminStats() {
  try {
    const usersCount = await pool.query('SELECT count(*) FROM users');
    const postsCount = await pool.query('SELECT count(*) FROM posts');
    const categoriesCount = await pool.query('SELECT count(*) FROM categories');

    return {
      usersCount: parseInt(usersCount.rows[0].count),
      postsCount: parseInt(postsCount.rows[0].count),
      categoriesCount: parseInt(categoriesCount.rows[0].count),
    };
  } catch (error) {
    console.error('Database Error (getAdminStats):', error);
    return { usersCount: 0, postsCount: 0, categoriesCount: 0 };
  }
}
