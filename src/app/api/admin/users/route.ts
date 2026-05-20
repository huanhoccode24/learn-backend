import { NextResponse } from 'next/server';
import { getAdminUsers } from '@/lib/admin';
import { currentUser, isAdmin } from '@/lib/auth-helpers';

export async function GET() {
  try {
    const user = await currentUser();
    const isUserAdmin = await isAdmin();

    // Bảo mật: Sử dụng helper để kiểm tra quyền
    if (!user || !isUserAdmin) {
      return NextResponse.json({ error: 'Không có quyền truy cập!' }, { status: 403 });
    }

    const users = await getAdminUsers(user.id as string);

    return NextResponse.json({ success: users }, { status: 200 });
  } catch (error) {
    console.error('Lỗi API Get Users:', error);
    return NextResponse.json({ error: 'Đã xảy ra lỗi hệ thống!' }, { status: 500 });
  }
}
