-- Cập nhật thêm các cột thiếu cho bảng posts
ALTER TABLE posts ADD COLUMN IF NOT EXISTS "customAuthor" VARCHAR(255);
ALTER TABLE posts ADD COLUMN IF NOT EXISTS "shortDesc" TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS "thumbnail" TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS "category" VARCHAR(100);
