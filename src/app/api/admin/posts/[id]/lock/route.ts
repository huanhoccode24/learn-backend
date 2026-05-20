import { NextResponse } from 'next/server';
import { isAdmin, currentUser, isCollaborator } from '@/lib/auth-helpers';
import pool from '@/lib/db';

const LOCK_TIMEOUT_MINUTES = 5;

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const isUserAdmin = await isAdmin();
  const isUserCollaborator = await isCollaborator();

  if (!isUserAdmin && !isUserCollaborator) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const id = (await params).id;

  try {
    // Đối với Cộng tác viên, kiểm tra xem có quyền với bài viết này không
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

    const currentLock = await pool.query(
      `SELECT p.editing_by, p.editing_at, u.name as "editingByName" 
       FROM posts p 
       LEFT JOIN users u ON p.editing_by = u.id 
       WHERE p.id = $1
       FOR UPDATE OF p`,
      [id]
    );

    if (currentLock.rows.length === 0) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const lock = currentLock.rows[0];
    const now = new Date();
    const isExpired = lock.editing_at && (now.getTime() - new Date(lock.editing_at).getTime()) > LOCK_TIMEOUT_MINUTES * 60 * 1000;

    // Log để debug trường hợp bị tự khóa
    console.log(`Lock check for user ${user.id}. Current lock holder: ${lock.editing_by}. Expired: ${isExpired}`);

    // Debug cực kỳ chi tiết để tìm nguyên nhân tự khóa
    const sessionUserId = String(user.id).trim().toLowerCase();
    const dbLockHolder = lock.editing_by ? String(lock.editing_by).trim().toLowerCase() : null;
    
    console.log(`[LOCK DEBUG] Session User: "${sessionUserId}", DB Holder: "${dbLockHolder}", Expired: ${isExpired}`);

    if (!lock.editing_by || dbLockHolder === sessionUserId || isExpired) {
      await pool.query(
        `UPDATE posts SET editing_by = $1, editing_at = CURRENT_TIMESTAMP WHERE id = $2`,
        [user.id, id]
      );
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({
      success: false,
      message: `Bài viết đang được chỉnh sửa bởi ${lock.editingByName || 'người khác'}.`,
      editingBy: lock.editing_by,
      editingByName: lock.editingByName
    }, { status: 423 });

  } catch (error: unknown) {
    console.error('Post Lock Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const isUserAdmin = await isAdmin();
  const isUserCollaborator = await isCollaborator();

  if (!isUserAdmin && !isUserCollaborator) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const id = (await params).id;

  try {
    // Đối với Cộng tác viên, kiểm tra xem có quyền với bài viết này không
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

    await pool.query(
      `UPDATE posts SET editing_by = NULL, editing_at = NULL WHERE id = $1 AND editing_by = $2`,
      [id, user.id]
    );
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Post Unlock Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
