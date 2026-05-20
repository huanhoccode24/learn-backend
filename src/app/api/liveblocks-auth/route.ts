import { Liveblocks } from "@liveblocks/node";
import { auth } from "@/auth";

const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET_KEY as string,
});

const CURSOR_COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#3b82f6', '#ec4899'];

export async function POST() {
  // 1. Kiểm tra session từ NextAuth
  const session = await auth();

  if (!session || !session.user) {
    return new Response("Unauthorized. Vui lòng đăng nhập.", { status: 401 });
  }

  // 2. Kiểm tra quyền
  const role = session.user.role?.toUpperCase();
  const isAuthorized = role === 'ADMIN' || role === 'COLLABORATOR';

  if (!isAuthorized) {
    return new Response("Forbidden. Bạn không có quyền truy cập tính năng này.", { status: 403 });
  }

  // 3. Khởi tạo session cho user hợp lệ
  const uniqueId = `${session.user.id}-${Math.floor(Math.random() * 10000)}`;

  const userSession = liveblocks.prepareSession(uniqueId, {
    userInfo: {
      name: session.user.name || 'Anonymous',
      color: CURSOR_COLORS[Math.floor(Math.random() * CURSOR_COLORS.length)],
    },
  });

  // 4. Phân quyền: Cho phép Admin có toàn quyền ĐỌC VÀ GHI vào TẤT CẢ các phòng (bài viết)
  userSession.allow(`*`, ["room:write"]);

  // 5. Uỷ quyền cho Liveblocks và trả về token cho Client
  const { status, body } = await userSession.authorize();
  return new Response(body, { status });
}
