import { DefaultSession } from 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface User {
    role?: string;
  }
  interface Session {
    user: {
      id: string;
      role?: string;
      isTwoFactorVerified?: boolean;
    } & DefaultSession['user'];
    error?: string; // Báo cho client biết refresh token đã hết hạn
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: string;
    isTwoFactorVerified?: boolean;
    accessTokenExpiresAt?: number;   // Timestamp hết hạn Access Token (15 phút)
    refreshTokenExpiresAt?: number;  // Timestamp hết hạn Refresh Token (30 ngày)
    refreshToken?: string;           // Mã Refresh Token lưu trong DB
    error?: string;                  // Cờ báo lỗi refresh
  }
}
