-- Khởi tạo cấu trúc Database chuẩn cho NextAuth (Auth.js v5) sử dụng PostgreSQL Adapter
-- Thay đổi UUID thành kiểu mặc định cho khoá chính, thêm liên kết (Foreign Keys) cho tính toàn vẹn dữ liệu.

-- Bảng users: Gồm cả các field mặc định và field custom (password, role)
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  "emailVerified" TIMESTAMPTZ,
  image TEXT,
  password TEXT,
  role VARCHAR(50) DEFAULT 'USER',
  "createdAt" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Bảng accounts: Quản lý các Providers OAuth (Google, Github...)
CREATE TABLE IF NOT EXISTS accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(255) NOT NULL,
  provider VARCHAR(255) NOT NULL,
  "providerAccountId" VARCHAR(255) NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at BIGINT,
  id_token TEXT,
  scope TEXT,
  session_state TEXT,
  token_type TEXT
);

-- Bảng sessions: Quản lý đăng nhập session (Nếu ko xài JWT thì sẽ lưu vào đây)
CREATE TABLE IF NOT EXISTS sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires TIMESTAMPTZ NOT NULL,
  "sessionToken" VARCHAR(255) NOT NULL UNIQUE
);

-- Bảng verification_token: Quản lý token xác thực email (Magic link) / Quên mật khẩu
CREATE TABLE IF NOT EXISTS verification_token (
  identifier TEXT NOT NULL,
  expires TIMESTAMPTZ NOT NULL,
  token TEXT NOT NULL,
  PRIMARY KEY (identifier, token)
);
