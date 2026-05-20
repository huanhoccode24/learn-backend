import { NextResponse } from 'next/server';
import { currentUser } from '@/lib/auth-helpers';
import { generateTwoFactorToken } from '@/lib/tokens';
import { sendTwoFactorTokenEmail } from '@/lib/mail';

export async function POST() {
  try {
    const user = await currentUser();

    if (!user || !user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Tạo mã OTP mới (Hiệu lực 5 phút)
    const twoFactorToken = await generateTwoFactorToken(user.email);

    // Gửi mã qua Email
    await sendTwoFactorTokenEmail(twoFactorToken.email, twoFactorToken.token);

    return NextResponse.json({ success: 'Mã xác thực đã được gửi tới email của bạn!' });
  } catch (error: unknown) {
    console.error('SEND_OTP_ERROR:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ error: 'Lỗi hệ thống khi gửi mã!' }, { status: 500 });
  }
}

