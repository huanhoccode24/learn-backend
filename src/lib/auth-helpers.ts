import { auth } from '@/auth';

/**
 * Láy thông tin User hiện tại từ Session (Dùng cho Server Components/API/Actions)
 */
export const currentUser = async () => {
  const session = await auth();
  return session?.user;
};

/**
 * Lấy Vai trò hiện tại của User (Dùng cho Server Components/API/Actions)
 */
export const currentRole = async () => {
  const session = await auth();
  return session?.user?.role;
};

/**
 * Kiểm tra xem người dùng có phải là ADMIN hay không
 * Sử dụng để bảo vệ các logic nghiệp vụ quan trọng
 */
export const isAdmin = async () => {
  const role = await currentRole();
  return role === 'ADMIN';
};

export const isCollaborator = async () => {
  const role = await currentRole();
  return role === 'COLLABORATOR';
};

export const isUser = async () => {
  const role = await currentRole();
  return role === 'USER' || role === 'PRO' || role === 'VIP';
};

