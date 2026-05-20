import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth-helpers';
import pool from '@/lib/db';
import slugify from 'slugify';

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const { name, description, isHidden } = body;

    const updates: string[] = [];
    const values: unknown[] = [];
    let paramIdx = 1;

    if (name !== undefined) {
      const slug = slugify(name, { lower: true, strict: true });
      updates.push(`name = $${paramIdx++}`, `slug = $${paramIdx++}`);
      values.push(name, slug);
    }

    if (description !== undefined) {
      updates.push(`description = $${paramIdx++}`);
      values.push(description);
    }

    if (isHidden !== undefined) {
      updates.push(`"isHidden" = $${paramIdx++}`);
      values.push(isHidden);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    // Luôn cập nhật thời gian
    updates.push(`"updatedAt" = CURRENT_TIMESTAMP`);

    const query = `UPDATE categories SET ${updates.join(', ')} WHERE id = $${paramIdx} RETURNING *`;
    values.push(id);

    const result = await pool.query(query, values);

    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;

  try {
    // 1. Kiểm tra xem có bài viết nào thuộc danh mục này không
    const checkPosts = await pool.query(
      'SELECT COUNT(*) FROM posts WHERE "categoryId" = $1',
      [id]
    );

    const postCount = parseInt(checkPosts.rows[0].count);

    if (postCount > 0) {
      return NextResponse.json(
        { error: 'Không thể xóa danh mục đang có bài viết. Vui lòng di chuyển hoặc xóa bài viết trước.' },
        { status: 400 }
      );
    }

    // 2. Nếu không có bài viết, tiến hành xóa
    const result = await pool.query('DELETE FROM categories WHERE id = $1 RETURNING *', [id]);

    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Category deleted successfully' });
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
