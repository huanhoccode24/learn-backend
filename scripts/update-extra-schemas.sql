-- Cập nhật bổ sung toàn bộ cấu trúc bảng và di chuyển dữ liệu (extra schema migrations)
-- Hỗ trợ khởi động và di chuyển dữ liệu tự động 100% khi chạy qua Docker.

-- 1. Cập nhật bảng categories để hỗ trợ ẩn/hiện danh mục
ALTER TABLE categories ADD COLUMN IF NOT EXISTS "isHidden" BOOLEAN DEFAULT false;

-- 2. Cập nhật thêm các cột thiếu cho bảng posts (bao gồm cả description, rejectionReason từ các node migration)
ALTER TABLE posts ADD COLUMN IF NOT EXISTS "customAuthor" VARCHAR(255);
ALTER TABLE posts ADD COLUMN IF NOT EXISTS "shortDesc" TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS "thumbnail" TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS "category" VARCHAR(100);
ALTER TABLE posts ADD COLUMN IF NOT EXISTS "description" TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS "rejectionReason" TEXT;

-- 3. Cập nhật thêm các cột thông tin người dùng cho bảng users (từ profile migrations)
ALTER TABLE users ADD COLUMN IF NOT EXISTS "phoneNumber" TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS "address" TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS "facebookLink" TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS "tiktokLink" TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS "youtubeLink" TEXT;

-- 4. Thêm các trường quản lý khoá (locking) cho banners và posts
ALTER TABLE banners ADD COLUMN IF NOT EXISTS editing_by UUID REFERENCES users(id);
ALTER TABLE banners ADD COLUMN IF NOT EXISTS editing_at TIMESTAMPTZ;

ALTER TABLE posts ADD COLUMN IF NOT EXISTS editing_by UUID REFERENCES users(id);
ALTER TABLE posts ADD COLUMN IF NOT EXISTS editing_at TIMESTAMPTZ;

-- 5. Bảng two_factor_tokens: Quản lý 2FA OTP
CREATE TABLE IF NOT EXISTS two_factor_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  token VARCHAR(255) NOT NULL,
  expires TIMESTAMPTZ NOT NULL,
  UNIQUE(email, token)
);

-- 6. Bảng refresh_tokens: Quản lý Refresh Token
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token);

-- 7. Bảng notifications: Quản lý thông báo người dùng
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT,
  "postId" UUID,
  "isRead" BOOLEAN DEFAULT false,
  "createdAt" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications("userId");
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications("isRead");

-- 8. Bảng post_collaborators: Liên kết bài viết với cộng tác viên đồng tác giả
CREATE TABLE IF NOT EXISTS post_collaborators (
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (post_id, user_id)
);
