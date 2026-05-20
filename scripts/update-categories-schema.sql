-- Cập nhật bảng categories để hỗ trợ ẩn/hiện danh mục
ALTER TABLE categories ADD COLUMN IF NOT EXISTS "isHidden" BOOLEAN DEFAULT false;
