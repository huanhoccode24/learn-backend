-- Scripts/update-locking.sql
-- Thêm các trường quản lý khóa (locking) cho banners và posts

ALTER TABLE banners ADD COLUMN IF NOT EXISTS editing_by UUID REFERENCES users(id);
ALTER TABLE banners ADD COLUMN IF NOT EXISTS editing_at TIMESTAMPTZ;

ALTER TABLE posts ADD COLUMN IF NOT EXISTS editing_by UUID REFERENCES users(id);
ALTER TABLE posts ADD COLUMN IF NOT EXISTS editing_at TIMESTAMPTZ;

-- Xóa lock cũ nếu cần (Optional)
-- UPDATE banners SET editing_by = NULL, editing_at = NULL;
-- UPDATE posts SET editing_by = NULL, editing_at = NULL;
