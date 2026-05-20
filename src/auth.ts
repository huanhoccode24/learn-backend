import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import GitHub from 'next-auth/providers/github';
import Google from 'next-auth/providers/google';
import PostgresAdapter from '@auth/pg-adapter';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { authConfig } from '@/auth.config';
import pool from '@/lib/db';

import { generateTwoFactorToken } from '@/lib/tokens';
import { sendTwoFactorTokenEmail } from '@/lib/mail';

export const { handlers, signIn, signOut, auth, unstable_update } = NextAuth({
  ...authConfig,
  trustHost: true,
  adapter: PostgresAdapter(pool),
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user }) {
      // Bỏ qua bước OTP nếu tài khoản là Admin hoặc Collaborator
      if (user.role?.toLowerCase() === 'admin' || user.role?.toLowerCase() === 'collaborator') {
        return true;
      }

      if (user.email) {
        const tokenObj = await generateTwoFactorToken(user.email);
        await sendTwoFactorTokenEmail(tokenObj.email, tokenObj.token);
      }
      return true;
    },
  },
  providers: [
    GitHub({ allowDangerousEmailAccountLinking: true }),
    Google({ allowDangerousEmailAccountLinking: true }),
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;

          // Trích xuất user sử dụng Raw SQL từ PostgreSQL
          const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
          if (userResult.rows.length === 0) return null;

          const user = userResult.rows[0];

          if (!user.password) return null; // Trường hợp user đăng nhập bằng OAuth trước đó

          const passwordsMatch = await bcrypt.compare(password, user.password);

          if (passwordsMatch) {
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
              image: user.image,
            };
          }
        }

        return null;
      },
    }),
  ],
});
