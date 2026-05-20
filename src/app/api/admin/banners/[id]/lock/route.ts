import { NextResponse } from 'next/server';
import { isAdmin, currentUser } from '@/lib/auth-helpers';
import pool from '@/lib/db';

const LOCK_TIMEOUT_MINUTES = 5;

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await currentUser();
  if (!(await isAdmin()) || !user) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const id = (await params).id;

  try {
    // Lấy thông tin lock hiện tại
    const currentLock = await pool.query(
      `SELECT b.editing_by, b.editing_at, u.name as "editingByName" 
       FROM banners b 
       LEFT JOIN users u ON b.editing_by = u.id 
       WHERE b.id = $1
       FOR UPDATE OF b`,
      [id]
    );

    if (currentLock.rows.length === 0) {
      return NextResponse.json({ error: 'Banner not found' }, { status: 404 });
    }

    const lock = currentLock.rows[0];
    const now = new Date();
    const isExpired = lock.editing_at && (now.getTime() - new Date(lock.editing_at).getTime()) > LOCK_TIMEOUT_MINUTES * 60 * 1000;

    // Nếu không ai giữ lock, hoặc chính là mình, hoặc lock đã hết hạn
    if (!lock.editing_by || String(lock.editing_by) === String(user.id) || isExpired) {
      await pool.query(
        `UPDATE banners SET editing_by = $1, editing_at = CURRENT_TIMESTAMP WHERE id = $2`,
        [user.id, id]
      );
      return NextResponse.json({ success: true });
    }

    // Nếu bị người khác giữ lock và chưa hết hạn
    return NextResponse.json({
      success: false,
      message: `Nội dung đang được chỉnh sửa bởi ${lock.editingByName || 'người khác'}.`,
      editingBy: lock.editing_by,
      editingByName: lock.editingByName
    }, { status: 423 }); // 423 Locked

  } catch (error: unknown) {
    console.error('Banner Lock Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await currentUser();
  if (!(await isAdmin()) || !user) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const id = (await params).id;

  try {
    // Chỉ cho phép giải phóng nếu chính mình đang giữ lock
    await pool.query(
      `UPDATE banners SET editing_by = NULL, editing_at = NULL WHERE id = $1 AND editing_by = $2`,
      [id, user.id]
    );
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Banner Unlock Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
