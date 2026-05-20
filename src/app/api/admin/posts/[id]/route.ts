import { NextResponse } from 'next/server';
import { isAdmin, currentUser, isCollaborator } from '@/lib/auth-helpers';
import pool from '@/lib/db';
import slugify from 'slugify';

// GET: Lấy chi tiết bài viết
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await pool.query(
      `SELECT p.*, u.name as "editingByName" 
       FROM posts p 
       LEFT JOIN users u ON p.editing_by = u.id 
       WHERE p.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Không tìm thấy bài viết' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

// PUT: Cập nhật bài viết
export async function PUT(
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

  try {
    const { id } = await params;
    
    // Đối với Cộng tác viên, kiểm tra xem có quyền với bài viết này không
    if (isUserCollaborator && !isUserAdmin) {
      const accessCheck = await pool.query(
        `SELECT p."authorId", pc.user_id as "isCollaborator"
         FROM posts p 
         LEFT JOIN post_collaborators pc ON p.id = pc.post_id AND pc.user_id = $2
         WHERE p.id = $1 AND (p."authorId" = $2 OR pc.user_id = $2)`,
        [id, user.id]
      );
      
      if (accessCheck.rows.length === 0) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      // Theo yêu cầu: Chỉ người tạo mới có quyền lưu nháp/gửi admin
      const isOwner = accessCheck.rows[0].authorId === user.id;
      if (!isOwner) {
        return NextResponse.json({ error: 'Chỉ người tạo bài viết mới có quyền lưu hoặc gửi duyệt.' }, { status: 403 });
      }
    }

    const body = await req.json();
    const { title, content, thumbnail, categoryId, status, customAuthor, description, is_featured } = body;

    // Đối với Cộng tác viên, không cho phép tự ý đặt trạng thái PUBLISHED
    let resolvedStatus = status;
    if (isUserCollaborator && !isUserAdmin) {
      if (status === 'PUBLISHED' || status === 'PENDING') {
        resolvedStatus = 'PENDING';
      }
    }

    // Kiểm tra lock
    const lockCheck = await pool.query(
      'SELECT editing_by, editing_at FROM posts WHERE id = $1',
      [id]
    );

    if (lockCheck.rows.length > 0) {
      const lock = lockCheck.rows[0];
      const now = new Date();
      const isExpired = lock.editing_at && (now.getTime() - new Date(lock.editing_at).getTime()) > 5 * 60 * 1000;

      if (lock.editing_by && lock.editing_by !== user.id && !isExpired) {
        return NextResponse.json({ error: 'Content is locked by another user' }, { status: 423 });
      }
    }
    
    // Nếu tiêu đề bị đổi, sinh lại slug, nếu form không có slug, tự cấu hình
    const slug = slugify(title, { lower: true, strict: true }) + '-' + Date.now();

    const result = await pool.query(
      `UPDATE posts 
       SET title = $1, slug = $2, content = $3, thumbnail = $4, "categoryId" = $5, status = $6, "customAuthor" = $7, description = $8, is_featured = COALESCE($9, is_featured), "updatedAt" = NOW()
       WHERE id = $10 
       RETURNING *`,
      [title, slug, content, thumbnail, categoryId || null, resolvedStatus, customAuthor || null, description || null, is_featured, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Không tìm thấy bài viết để cập nhật' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

// DELETE: Xóa bài viết
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

  try {
    const { id } = await params;

    // Đối với Cộng tác viên, kiểm tra xem có quyền xóa bài viết này không
    if (isUserCollaborator && !isUserAdmin) {
      const accessCheck = await pool.query(
        `SELECT 1 FROM posts p 
         LEFT JOIN post_collaborators pc ON p.id = pc.post_id
         WHERE p.id = $1 AND (p."authorId" = $2 OR pc.user_id = $2)`,
        [id, user.id]
      );
      if (accessCheck.rows.length === 0) {
        return NextResponse.json({ error: 'Bạn không có quyền xóa bài viết này' }, { status: 403 });
      }
    }

    const result = await pool.query(
      `DELETE FROM posts WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Không tìm thấy bài viết để xóa' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Xóa bài viết thành công', post: result.rows[0] });

  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

// PATCH: Toggle is_featured
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await currentUser();
  const isUserAdmin = await isAdmin();
  const isUserCollaborator = await isCollaborator();

  if (!user || (!isUserAdmin && !isUserCollaborator)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const { is_featured, status, rejectionReason } = body;

    // Đối với Cộng tác viên, kiểm tra quyền sở hữu/truy cập bài viết
    if (!isUserAdmin && isUserCollaborator) {
      const accessCheck = await pool.query(
        `SELECT p."authorId", pc.user_id as "isCollaborator"
         FROM posts p 
         LEFT JOIN post_collaborators pc ON p.id = pc.post_id AND pc.user_id = $2
         WHERE p.id = $1 AND (p."authorId" = $2 OR pc.user_id = $2)`,
        [id, user.id]
      );
      
      if (accessCheck.rows.length === 0) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      // Cộng tác viên KHÔNG được phép thay đổi status (chỉ admin mới có quyền duyệt/từ chối qua PATCH)
      if (status !== undefined) {
        return NextResponse.json({ error: 'Chỉ Admin mới có quyền thay đổi trạng thái phê duyệt qua phương thức này.' }, { status: 403 });
      }
    }

    // Kiểm tra lock
    const lockCheck = await pool.query(
      'SELECT editing_by, editing_at FROM posts WHERE id = $1',
      [id]
    );

    if (lockCheck.rows.length > 0) {
      const lock = lockCheck.rows[0];
      const now = new Date();
      const isExpired = lock.editing_at && (now.getTime() - new Date(lock.editing_at).getTime()) > 5 * 60 * 1000;

      if (lock.editing_by && lock.editing_by !== user.id && !isExpired) {
        return NextResponse.json({ error: 'Content is locked by another user' }, { status: 423 });
      }
    }

    let query = 'UPDATE posts SET "updatedAt" = NOW()';
    const queryParams = [];
    let paramCount = 1;

    if (is_featured !== undefined) {
      query += `, is_featured = $${paramCount}`;
      queryParams.push(is_featured);
      paramCount++;
    }

    if (status !== undefined) {
      query += `, status = $${paramCount}`;
      queryParams.push(status);
      paramCount++;
      
      // Nếu có status và là REJECTED, cập nhật luôn lý do
      if (status === 'REJECTED') {
        query += `, "rejectionReason" = $${paramCount}`;
        queryParams.push(rejectionReason || null);
        paramCount++;
      } else {
        // Nếu chuyển sang trạng thái khác, xóa lý do cũ
        query += `, "rejectionReason" = NULL`;
      }
    }

    query += ` WHERE id = $${paramCount} RETURNING *`;
    queryParams.push(id);

    const originalPost = await pool.query('SELECT status, title, "authorId" FROM posts WHERE id = $1', [id]);
    const originalStatus = originalPost.rows[0]?.status;

    const result = await pool.query(query, queryParams);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Không tìm thấy bài viết' }, { status: 404 });
    }

    const updatedPost = result.rows[0];

    // Gửi thông báo cho tác giả nếu có thay đổi trạng thái quan trọng
    if (status !== undefined && status !== originalStatus) {
      let notificationType = '';
      let notificationTitle = '';
      let notificationMessage = '';

      if (status === 'PUBLISHED') {
        notificationType = 'POST_APPROVED';
        notificationTitle = 'Bài viết đã được duyệt';
        notificationMessage = `Bài viết "${updatedPost.title}" của bạn đã được duyệt thành công.`;
      } else if (status === 'REJECTED') {
        if (originalStatus === 'PUBLISHED') {
          notificationType = 'POST_REMOVED';
          notificationTitle = 'Bài viết đã bị gỡ bỏ';
          notificationMessage = `Bài viết "${updatedPost.title}" đã bị gỡ bỏ khỏi hiển thị. Lý do: ${rejectionReason || 'Không có lý do cụ thể'}`;
        } else {
          notificationType = 'POST_REJECTED';
          notificationTitle = 'Bài viết đã bị từ chối';
          notificationMessage = `Bài viết "${updatedPost.title}" không được duyệt. Lý do: ${rejectionReason || 'Không có lý do cụ thể'}`;
        }
      }

      if (notificationType) {
        await pool.query(
          `INSERT INTO notifications ("userId", type, title, message, "postId") VALUES ($1, $2, $3, $4, $5)`,
          [updatedPost.authorId, notificationType, notificationTitle, notificationMessage, id]
        );
      }
    }

    return NextResponse.json(updatedPost);
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

