import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import VerifyOtpForm from '@/components/auth/verify-otp-form';
import { SessionProvider } from 'next-auth/react';
import { cookies } from 'next/headers';

export default async function VerifyOtpPage() {
  const session = await auth();

  // Chỉ cho người dùng đã có token (đã qua bước login mật khẩu) vào
  if (!session?.user?.email) {
    redirect('/login');
  }

  // Nếu người dùng đã xác thực mã OTP rồi thì hất vào Dashboard
  const cookieStore = await cookies();
  if (session.user.isTwoFactorVerified || cookieStore.get('2fa_verified')?.value === session.user.email) {
    redirect('/dashboard');
  }

  return (
    <SessionProvider session={session}>
      <VerifyOtpForm email={session.user.email} />
    </SessionProvider>
  );
}
