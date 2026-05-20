import { NextResponse } from 'next/server';
import { generateTwoFactorToken } from '@/lib/tokens';
import { sendTwoFactorTokenEmail } from '@/lib/mail';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Không tìm thấy email!' }, { status: 400 });
    }

    const tokenObj = await generateTwoFactorToken(email);
    await sendTwoFactorTokenEmail(tokenObj.email, tokenObj.token);

    return NextResponse.json({ success: 'Đã gửi lại mã mới!' }, { status: 200 });
  } catch (error) {
    console.error('Lỗi API Resend OTP:', error);
    return NextResponse.json({ error: 'Đã xảy ra lỗi khi gửi mã!' }, { status: 500 });
  }
}
