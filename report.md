# Báo cáo Hệ thống Role-Based Access Control (RBAC)

Dưới đây là tóm tắt các vai trò (roles), chức năng và các endpoint tương ứng trong hệ thống hiện tại.

## 1. Danh sách các Vai trò (Roles)
Hệ thống hiện tại định nghĩa 5 vai trò chính trong `src/types/user.ts`:
- **ADMIN**: Quản trị viên hệ thống.
- **COLLABORATOR**: Cộng tác viên (Người viết bài).
- **USER**: Người dùng tiêu chuẩn.
- **PRO**: Người dùng trả phí cấp độ 1.
- **VIP**: Người dùng trả phí cấp độ cao nhất.

---

## 2. Chi tiết Vai trò & Chức năng

### A. Vai trò: ADMIN
- **Mục tiêu**: Quản lý toàn bộ hệ thống.
- **Giao diện (Routes)**: `/admin/*` (Được bảo vệ bởi Middleware).
- **Chức năng chính**:
  - Quản lý người dùng (Xem danh sách, phân quyền).
  - Quản lý danh mục (Categories).
  - Quản lý bài viết (Duyệt bài, xóa bài).
  - Quản lý Banner quảng cáo.
- **Endpoints API tiêu biểu**:
  - `GET/POST/PUT/DELETE /api/admin/users`
  - `GET/POST/PUT/DELETE /api/admin/categories`
  - `GET/POST/PUT/DELETE /api/admin/posts`
  - `GET/POST/PUT/DELETE /api/admin/banners`

### B. Vai trò: COLLABORATOR
- **Mục tiêu**: Sáng tạo nội dung bài viết.
- **Giao diện (Routes)**: `/collaborator/*` (Mặc định vào `/collaborator/posts`).
- **Chức năng chính**:
  - Viết bài mới.
  - Quản lý và chỉnh sửa các bài viết do mình tạo ra.
  - Theo dõi trạng thái bài viết (Bản nháp/Đã đăng).
- **Endpoints API tiêu biểu**:
  - `GET/POST /api/collaborator/posts`
  - `GET/PUT/DELETE /api/collaborator/posts/[id]`

### C. Vai trò: USER / PRO / VIP
- **Mục tiêu**: Người dùng cuối tiêu thụ nội dung.
- **Giao diện (Routes)**: `/dashboard/*` (Profile, cài đặt cá nhân).
- **Chức năng chính**:
  - **USER**: Xem các bài viết miễn phí.
  - **PRO/VIP**: Xem các bài viết độc quyền (Featured/Premium), có huy hiệu riêng trên giao diện.
  - Cập nhật hồ sơ cá nhân (Bio, Ảnh đại diện).
  - Nâng cấp tài khoản thông qua Stripe.
- **Endpoints API tiêu biểu**:
  - `GET/PUT /api/profile`
  - `POST /api/stripe/checkout`
  - `POST /api/user/upgrade`

---

## 3. Cơ chế Bảo mật hiện tại
- **Middleware**: Sử dụng `auth.config.ts` để kiểm tra quyền truy cập route dựa trên session role. Nếu không đúng quyền sẽ bị redirect về `/dashboard` hoặc `/login`.
- **Server-side Helpers**: Sử dụng `src/lib/auth-helpers.ts` (các hàm `isAdmin()`, `isCollaborator()`) để bảo vệ các Server Action và API Route.
- **OTP Verification**: Tất cả người dùng (ngoại trừ ADMIN) đều phải xác thực OTP sau khi đăng nhập mới có thể truy cập vào hệ thống.
