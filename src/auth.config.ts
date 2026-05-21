import type { NextAuthConfig } from 'next-auth';

// Thời hạn Access Token: 15 phút (tính bằng milliseconds)
const ACCESS_TOKEN_MAX_AGE = 15 * 60 * 1000;
// Thời hạn Refresh Token: 30 ngày (tính bằng milliseconds)
const REFRESH_TOKEN_MAX_AGE = 30 * 24 * 60 * 60 * 1000;

// Cấu hình NextAuth cho Edge Middleware
// Lưu ý: Không import adapter hoặc database providers ở đây vì Edge không hỗ trợ thư viện Node như `pg` hoặc `bcrypt`.
export const authConfig = {
  pages: {
    signIn: '/login',
    newUser: '/register',   
  },
  session: {
    strategy: 'jwt',
    maxAge: REFRESH_TOKEN_MAX_AGE / 1000, // Đổi từ ms sang giây (30 ngày)
  },
  callbacks: {
    authorized({ auth, request }) {
      const { nextUrl, cookies } = request;
      const isLoggedIn = !!auth?.user;

      // Nếu refresh token đã hết hạn, coi như chưa đăng nhập
      if (auth?.error === 'RefreshTokenExpired') {
        return false; // Ép về trang login
      }

      let isVerifiedOTP = auth?.user?.isTwoFactorVerified === true;
      // Backup bằng Cookie thuần của Next.js (Khắc phục triệt để lỗi NextAuth Session Update)
      if (cookies.get('2fa_verified')?.value === auth?.user?.email) {
        isVerifiedOTP = true;
      }

      const isAdmin = auth?.user?.role === 'ADMIN';
      const isCollaborator = auth?.user?.role === 'COLLABORATOR';

      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      const isOnAdmin = nextUrl.pathname.startsWith('/admin');
      const isOnCollaborator = nextUrl.pathname.startsWith('/collaborator');
      const isOnAuth = nextUrl.pathname.startsWith('/login') || nextUrl.pathname.startsWith('/register');
      const isOnVerify = nextUrl.pathname.startsWith('/verify-otp');

      if (!isLoggedIn) {
        if (isOnDashboard || isOnAdmin || isOnVerify || isOnCollaborator) return false; // redirect to login
        return true;
      }

      // Logged In
      if (!isVerifiedOTP) {
        if (isOnVerify) return true; // Allowed to be on verify page
        return Response.redirect(new URL('/verify-otp', nextUrl));
      }

      // Logged In and Verified
      if (isOnAuth || isOnVerify) {
        let redirectUrl = '/dashboard';
        if (isAdmin) redirectUrl = '/admin/dashboard';
        else if (isCollaborator) redirectUrl = '/collaborator/posts';
        return Response.redirect(new URL(redirectUrl, nextUrl));
      }

      // Protection for /admin
      if (isOnAdmin && !isAdmin) {
        return Response.redirect(new URL('/dashboard', nextUrl));
      }

      // Protection for /collaborator
      if (isOnCollaborator && !isCollaborator) {
        return Response.redirect(new URL('/dashboard', nextUrl));
      }

      return true;
    },
    async jwt({ token, user, trigger, session }) {
      // ========== LẦN ĐẦU ĐĂNG NHẬP ==========
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.email = user.email;
      }

      if (trigger === 'signIn') {
        // Khởi tạo thời hạn Access & Refresh Token
        token.accessTokenExpiresAt = Date.now() + ACCESS_TOKEN_MAX_AGE;
        token.refreshTokenExpiresAt = Date.now() + REFRESH_TOKEN_MAX_AGE;
        
        // Nếu là admin thì mặc định đã xác thực OTP (vì admin bỏ qua bước này)
        const roleLower = user.role?.toLowerCase();
        token.isTwoFactorVerified = roleLower === 'admin' || roleLower === 'collaborator';
        
        return token;
      }

      // ========== CẬP NHẬT THỦ CÔNG TỪ CLIENT ==========
      if (trigger === 'update') {
        if (session?.isTwoFactorVerified !== undefined) {
          token.isTwoFactorVerified = session.isTwoFactorVerified;
        }
        if (session?.role) {
          token.role = session.role;
        }
      }

      // ========== TOKEN ROTATION LOGIC ==========
      const now = Date.now();

      // 1. Access Token còn hạn → Cho qua, không làm gì
      if (token.accessTokenExpiresAt && now < token.accessTokenExpiresAt) {
        return token;
      }

      // 2. Access Token hết hạn → Kiểm tra Refresh Token
      if (token.refreshTokenExpiresAt && now < token.refreshTokenExpiresAt) {
        // Refresh Token còn sống → Gia hạn Access Token mới
        token.accessTokenExpiresAt = now + ACCESS_TOKEN_MAX_AGE;
        return token;
      }

      // 3. Cả hai đều hết hạn → Đánh dấu lỗi, Middleware sẽ ép đăng xuất
      token.error = 'RefreshTokenExpired';
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) || (token.sub as string);
      }
      if (token.role && session.user) {
        session.user.role = token.role;
      }
      if (token.isTwoFactorVerified !== undefined && session.user) {
        session.user.isTwoFactorVerified = token.isTwoFactorVerified;
      }
      // Truyền lỗi refresh token hết hạn cho client/middleware
      if (token.error) {
        session.error = token.error;
      }
      return session;
    },
  },
  providers: [], // Sẽ được khai báo cụ thể ở auth.ts
} satisfies NextAuthConfig;
