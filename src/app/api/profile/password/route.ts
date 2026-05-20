import { NextResponse } from 'next/server';
import { currentUser } from '@/lib/auth-helpers';
import pool from '@/lib/db';
import bcrypt from 'bcryptjs';
import { getTwoFactorTokenByEmail } from '@/lib/tokens';

export async function PATCH(req: Request) {
  try {
    const user = await currentUser();
    if (!user || !user.email || !user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { newPassword, otp } = await req.json();

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json({ error: 'Mật khẩu mới phải có ít nhất 6 ký tự!' }, { status: 400 });
    }

    if (!otp) {
      return NextResponse.json({ error: 'Vui lòng nhập mã xác thực OTP!' }, { status: 400 });
    }

    // 1. Kiểm tra OTP
    const existingToken = await getTwoFactorTokenByEmail(user.email);

    if (!existingToken) {
      return NextResponse.json({ error: 'Mã OTP không tồn tại hoặc đã hết hạn!' }, { status: 400 });
    }

    if (existingToken.token !== otp) {
      return NextResponse.json({ error: 'Mã OTP không chính xác!' }, { status: 400 });
    }

    const hasExpired = new Date(existingToken.expires).getTime() < Date.now();
    if (hasExpired) {
      return NextResponse.json({ error: 'Mã OTP đã hết hạn!' }, { status: 400 });
    }

    // 2. Hash mật khẩu mới
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 3. Cập nhật vào DB
    await pool.query(
      'UPDATE users SET password = $1, "updatedAt" = CURRENT_TIMESTAMP WHERE id = $2',
      [hashedPassword, user.id]
    );

    // 4. Xóa OTP sau khi đổi thành công
    await pool.query('DELETE FROM two_factor_tokens WHERE id = $1', [existingToken.id]);

    return NextResponse.json({ success: 'Đổi mật khẩu thành công!' });
  } catch (error: unknown) {
    console.error('CHANGE_PASSWORD_ERROR:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ error: 'Lỗi hệ thống khi đổi mật khẩu!' }, { status: 500 });
  }
}

