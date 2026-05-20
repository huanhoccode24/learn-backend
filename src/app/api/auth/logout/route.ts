import { NextResponse } from 'next/server';
import { signOut, auth } from '@/auth';
import { revokeRefreshTokens } from '@/lib/tokens';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    // 1. Hủy bỏ tất cả Refresh Token trong DB
    if (userId) {
      await revokeRefreshTokens(userId);
    }

    // 2. Xóa cookie tin cậy thiết bị OTP
    const cookieStore = await cookies();
    cookieStore.delete('2fa_verified');

    // 3. Xóa JWT Session của NextAuth
    await signOut({ redirect: false });

    return NextResponse.json({ success: 'Đã đăng xuất thành công!' }, { status: 200 });
  } catch (error) {
    console.error('Lỗi API Logout:', error);
    return NextResponse.json({ error: 'Đã xảy ra lỗi khi đăng xuất!' }, { status: 500 });
  }
}
