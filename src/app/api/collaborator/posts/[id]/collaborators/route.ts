import { NextResponse } from 'next/server';
import { isAdmin, isCollaborator, currentUser } from '@/lib/auth-helpers';
import pool from '@/lib/db';

// GET: Lấy danh sách cộng tác viên của bài viết
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const isUserAdmin = await isAdmin();
  const isUserCollaborator = await isCollaborator();

  if (!isUserAdmin && !isUserCollaborator) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const id = (await params).id;

  try {
    // Kiểm tra quyền truy cập bài viết
    if (isUserCollaborator && !isUserAdmin) {
      const accessCheck = await pool.query(
        `SELECT 1 FROM posts p 
         LEFT JOIN post_collaborators pc ON p.id = pc.post_id
         WHERE p.id = $1 AND (p."authorId" = $2 OR pc.user_id = $2)`,
        [id, user.id]
      );
      if (accessCheck.rows.length === 0) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    // Lấy danh sách cộng tác viên (bao gồm cả tác giả chính)
    const result = await pool.query(`
      SELECT u.id, u.name, u.email, 
             CASE WHEN p."authorId" = u.id THEN true ELSE false END as "isAuthor"
      FROM users u
      JOIN posts p ON p."authorId" = u.id OR u.id IN (SELECT user_id FROM post_collaborators WHERE post_id = p.id)
      WHERE p.id = $1
    `, [id]);

    return NextResponse.json(result.rows);
  } catch (error: unknown) {
    console.error('Get Collaborators Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST: Mời cộng tác viên tham gia bài viết
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const isUserAdmin = await isAdmin();
  const isUserCollaborator = await isCollaborator();

  if (!isUserAdmin && !isUserCollaborator) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const id = (await params).id;

  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email là bắt buộc' }, { status: 400 });
    }

    // Kiểm tra quyền truy cập bài viết (Chỉ tác giả hoặc cộng tác viên hiện tại mới được mời)
    const accessCheck = await pool.query(
      `SELECT 1 FROM posts p 
       LEFT JOIN post_collaborators pc ON p.id = pc.post_id
       WHERE p.id = $1 AND (p."authorId" = $2 OR pc.user_id = $2)`,
      [id, user.id]
    );
    if (accessCheck.rows.length === 0 && !isUserAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Tìm user được mời
    const targetUserResult = await pool.query(
      'SELECT id, role, name FROM users WHERE email = $1',
      [email]
    );

    if (targetUserResult.rows.length === 0) {
      return NextResponse.json({ error: 'Không tìm thấy người dùng với email này' }, { status: 404 });
    }

    const targetUser = targetUserResult.rows[0];

    // Kiểm tra xem user được mời có phải là Collaborator không (hoặc Admin)
    if (targetUser.role !== 'COLLABORATOR' && targetUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Người dùng này không có vai trò Cộng tác viên' }, { status: 400 });
    }

    // Kiểm tra xem đã là cộng tác viên của bài viết này chưa
    const existingCollab = await pool.query(
      'SELECT 1 FROM post_collaborators WHERE post_id = $1 AND user_id = $2',
      [id, targetUser.id]
    );

    // Kiểm tra xem có phải là tác giả không
    const postAuthor = await pool.query(
      'SELECT "authorId" FROM posts WHERE id = $1',
      [id]
    );

    if (postAuthor.rows[0].authorId === targetUser.id) {
      return NextResponse.json({ error: 'Người này là tác giả của bài viết' }, { status: 400 });
    }

    if (existingCollab.rows.length > 0) {
      return NextResponse.json({ error: 'Người này đã là cộng tác viên của bài viết' }, { status: 400 });
    }

    // Thêm cộng tác viên
    await pool.query(
      'INSERT INTO post_collaborators (post_id, user_id) VALUES ($1, $2)',
      [id, targetUser.id]
    );

    // Lấy thông tin bài viết để gửi thông báo
    const postResult = await pool.query('SELECT title FROM posts WHERE id = $1', [id]);
    const postTitle = postResult.rows[0]?.title || 'bài viết';

    // Tạo thông báo cho người được mời
    await pool.query(
      `INSERT INTO notifications ("userId", type, title, message, "postId") VALUES ($1, $2, $3, $4, $5)`,
      [
        targetUser.id, 
        'COLLABORATOR_INVITED', 
        'Lời mời soạn thảo bài viết', 
        `Bạn đã được ${user.name} mời tham gia soạn thảo bài viết "${postTitle}".`,
        id
      ]
    );

    return NextResponse.json({ success: true, message: `Đã mời ${targetUser.name} tham gia bài viết` });

  } catch (error: unknown) {
    console.error('Invite Collaborator Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE: Xóa cộng tác viên khỏi bài viết
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const isUserAdmin = await isAdmin();
  const isUserCollaborator = await isCollaborator();

  if (!isUserAdmin && !isUserCollaborator) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const id = (await params).id;

  try {
    const body = await req.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'UserId là bắt buộc' }, { status: 400 });
    }

    // Kiểm tra quyền: Chỉ tác giả bài viết hoặc Admin mới được xóa cộng tác viên
    // Hoặc chính cộng tác viên đó tự rời khỏi bài viết
    const postCheck = await pool.query(
      'SELECT "authorId" FROM posts WHERE id = $1',
      [id]
    );

    if (postCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Không tìm thấy bài viết' }, { status: 404 });
    }

    const isAuthor = postCheck.rows[0].authorId === user.id;
    const isSelfLeaving = user.id === userId;

    if (!isAuthor && !isUserAdmin && !isSelfLeaving) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const result = await pool.query(
      'DELETE FROM post_collaborators WHERE post_id = $1 AND user_id = $2 RETURNING *',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Không tìm thấy cộng tác viên này trong bài viết' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Đã xóa cộng tác viên khỏi bài viết' });

  } catch (error: unknown) {
    console.error('Delete Collaborator Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
