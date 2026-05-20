import crypto from 'crypto';
import pool from '@/lib/db';

// ==================== TWO FACTOR OTP ====================

export const generateTwoFactorToken = async (email: string) => {
  // Tạo OTP ngẫu nhiên từ 100000 đến 999999
  const token = crypto.randomInt(100_000, 1_000_000).toString(); 
  // Hết hạn trong vòng 5 phút kể từ lúc tạo
  const expires = new Date(new Date().getTime() + 5 * 60 * 1000);

  // Xóa các mã token cũ của email này để tránh rác database
  await pool.query('DELETE FROM two_factor_tokens WHERE email = $1', [email]);

  // Lưu mã token mới vào Database
  const result = await pool.query(
    'INSERT INTO two_factor_tokens (email, token, expires) VALUES ($1, $2, $3) RETURNING *',
    [email, token, expires]
  );

  return result.rows[0];
};

export const getTwoFactorTokenByEmail = async (email: string) => {
  try {
    const result = await pool.query('SELECT * FROM two_factor_tokens WHERE email = $1', [email]);
    return result.rows[0] || null;
  } catch {
    return null;
  }
};

// ==================== REFRESH TOKEN ====================

const REFRESH_TOKEN_EXPIRY_DAYS = 30;

/**
 * Tạo Refresh Token mới cho user, lưu vào DB.
 * Xóa tất cả refresh token cũ của user trước khi tạo mới (1 user = 1 refresh token active).
 */
export const createRefreshToken = async (userId: string): Promise<string> => {
  const token = crypto.randomUUID(); // UUID v4 an toàn
  const expires = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

  // Xóa tất cả refresh token cũ của user này
  await pool.query('DELETE FROM refresh_tokens WHERE user_id = $1', [userId]);

  // Tạo refresh token mới
  await pool.query(
    'INSERT INTO refresh_tokens (user_id, token, expires) VALUES ($1, $2, $3)',
    [userId, token, expires]
  );

  return token;
};

/**
 * Kiểm tra Refresh Token còn hợp lệ không.
 * Trả về user_id nếu hợp lệ, null nếu không.
 */
export const validateRefreshToken = async (token: string): Promise<string | null> => {
  try {
    const result = await pool.query(
      'SELECT user_id, expires FROM refresh_tokens WHERE token = $1',
      [token]
    );

    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    const hasExpired = new Date(row.expires).getTime() < Date.now();

    if (hasExpired) {
      // Token hết hạn → xóa luôn khỏi DB
      await pool.query('DELETE FROM refresh_tokens WHERE token = $1', [token]);
      return null;
    }

    return row.user_id;
  } catch {
    return null;
  }
};

/**
 * Hủy bỏ (Revoke) tất cả Refresh Token của một user.
 * Gọi khi: Đăng xuất, Đổi mật khẩu, Bị phát hiện bất thường.
 */
export const revokeRefreshTokens = async (userId: string): Promise<void> => {
  await pool.query('DELETE FROM refresh_tokens WHERE user_id = $1', [userId]);
};
