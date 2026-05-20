import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getTwoFactorTokenByEmail } from '@/lib/tokens';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json({ error: 'Dữ liệu không hợp lệ!' }, { status: 400 });
    }

    const existingToken = await getTwoFactorTokenByEmail(email);

    if (!existingToken) {
      return NextResponse.json({ error: 'Mã xác thực không tồn tại!' }, { status: 400 });
    }

    if (existingToken.token !== code) {
      return NextResponse.json({ error: 'Mã xác thực không đúng!' }, { status: 400 });
    }

    const hasExpired = new Date(existingToken.expires).getTime() < new Date().getTime();
    if (hasExpired) {
      return NextResponse.json({ error: 'Mã xác thực đã hết hạn!' }, { status: 400 });
    }

    // Nếu hợp lệ, xóa token để tránh xài lại
    await pool.query('DELETE FROM two_factor_tokens WHERE id = $1', [existingToken.id]);

    // Thiết lập cookie riêng biệt của Next.js ghi nhớ đã verify OTP (sống 30 ngày - Tin cậy thiết bị)
    const cookieStore = await cookies();
    cookieStore.set('2fa_verified', email, {
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
      httpOnly: true,
      sameSite: 'lax',
    });

    return NextResponse.json({ success: 'Xác thực thành công!' }, { status: 200 });
  } catch (error) {
    console.error('Lỗi API Verify OTP:', error);
    return NextResponse.json({ error: 'Đã xảy ra lỗi hệ thống!' }, { status: 500 });
  }
}
