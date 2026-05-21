import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import pool from '@/lib/db';

// GET /api/comments?postId=...
// Lấy danh sách bình luận của bài viết
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const postId = searchParams.get('postId');

    if (!postId) {
      return NextResponse.json({ error: 'Thiếu postId' }, { status: 400 });
    }

    const result = await pool.query(
      `SELECT 
        c.id, 
        c."postId", 
        c."userId", 
        c."parentId", 
        c.content, 
        c."createdAt",
        u.name as "userName", 
        u.image as "userImage"
       FROM comments c
       LEFT JOIN users u ON c."userId" = u.id
       WHERE c."postId" = $1
       ORDER BY c."createdAt" ASC`,
      [postId]
    );

    return NextResponse.json(result.rows);
  } catch (error: unknown) {
    console.error('Comments GET Error:', error instanceof Error ? error.message : error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/comments
// Thêm bình luận mới (bắt buộc đăng nhập)
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { postId, content, parentId } = body;

    if (!postId || !content || content.trim() === '') {
      return NextResponse.json({ error: 'Post ID và nội dung bình luận là bắt buộc' }, { status: 400 });
    }

    // Insert vào DB
    const result = await pool.query(
      `INSERT INTO comments ("postId", "userId", "parentId", content)
       VALUES ($1, $2, $3, $4)
       RETURNING id, "postId", "userId", "parentId", content, "createdAt"`,
      [postId, session.user.id, parentId || null, content.trim()]
    );

    const newComment = result.rows[0];

    // Trả về bình luận cùng thông tin user đầy đủ để frontend cập nhật lập tức
    return NextResponse.json({
      ...newComment,
      userName: session.user.name,
      userImage: session.user.image,
    });
  } catch (error: unknown) {
    console.error('Comments POST Error:', error instanceof Error ? error.message : error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
