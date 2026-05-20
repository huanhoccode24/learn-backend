import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { isAdmin, currentUser } from '@/lib/auth-helpers';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const id = (await params).id;

  try {
    const result = await pool.query(
      `SELECT * FROM banners WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Banner not found' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error: unknown) {
    console.error('Admin Banner GET Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await currentUser();
  if (!(await isAdmin()) || !user) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const id = (await params).id;

  try {
    const body = await req.json();
    const { title, image, link, order, is_active, code } = body;

    const result = await pool.query(
      `UPDATE banners 
       SET title = COALESCE($1, title),
           image = COALESCE($2, image),
           link = COALESCE($3, link),
           "order" = COALESCE($4, "order"),
           is_active = COALESCE($5, is_active),
           code = COALESCE($6, code),
           "updatedAt" = CURRENT_TIMESTAMP
       WHERE id = $7
       RETURNING *`,
      [title, image, link, order, is_active, code, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Banner not found' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error: unknown) {
    console.error('Admin Banners PUT Error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const id = (await params).id;

  try {
    const result = await pool.query('DELETE FROM banners WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Banner not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Deleted successfully' });
  } catch (error: unknown) {
    console.error('Admin Banners DELETE Error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
