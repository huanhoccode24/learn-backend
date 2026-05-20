import NextAuth from 'next-auth';
import { authConfig } from '@/auth.config';

// Khởi tạo middleware của NextAuth với authConfig Edge-compatible
export default NextAuth(authConfig).auth;

// Chỉ áp dụng middleware cho các đường dẫn phù hợp (loại trừ file tĩnh, api...)
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
