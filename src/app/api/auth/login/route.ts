import { NextResponse } from 'next/server';
import { signIn } from '@/auth';
import { LoginSchema } from '@/validations/auth';
import { AuthError } from 'next-auth';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedFields = LoginSchema.safeParse(body);

    if (!validatedFields.success) {
      return NextResponse.json({ error: 'Dữ liệu truyền vào không hợp lệ!' }, { status: 400 });
    }

    const { email, password } = validatedFields.data;

    try {
      // Tự động gọi authorize trong auth.ts
      await signIn('credentials', {
        email,
        password,
        redirect: false, // Quan trọng: Tránh tự động redirect trong API route
      });

      // Kiểm tra role của user sau khi đăng nhập thành công
      const { auth } = await import('@/auth');
      const session = await auth();
      const role = session?.user?.role;

      // Nếu là admin hoặc collaborator thì vào thẳng dashboard, ngược lại thì qua verify-otp
      const roleLower = role?.toLowerCase();
      const redirectTo = (roleLower === 'admin' || roleLower === 'collaborator') ? '/dashboard' : '/verify-otp';

      return NextResponse.json({ success: 'Đăng nhập thành công!', redirectTo }, { status: 200 });
    } catch (error) {
      if (error instanceof AuthError) {
        switch (error.type) {
          case 'CredentialsSignin':
            return NextResponse.json({ error: 'Thông tin kết nối (Email/Password) không chính xác!' }, { status: 401 });
          default:
            return NextResponse.json({ error: 'Đã xảy ra lỗi đăng nhập từ NextAuth!' }, { status: 500 });
        }
      }
      
      // Nếu là lỗi không xác định
      return NextResponse.json({ error: 'Đã xảy ra lỗi hệ thống!' }, { status: 500 });
    }
  } catch (error) {
    console.error('Lỗi API Login:', error);
    return NextResponse.json({ error: 'Lỗi xử lý yêu cầu!' }, { status: 500 });
  }
}
