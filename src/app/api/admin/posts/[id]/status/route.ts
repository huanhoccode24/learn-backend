import { NextResponse } from 'next/server';
import { isAdmin, currentUser } from '@/lib/auth-helpers';
import pool from '@/lib/db';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await currentUser();
  if (!(await isAdmin()) || !user) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const { status, rejectionReason } = body;

    if (!['PUBLISHED', 'REJECTED', 'DRAFT'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    if (status === 'REJECTED' && !rejectionReason) {
      return NextResponse.json({ error: 'Rejection reason is required' }, { status: 400 });
    }

    const result = await pool.query(
      `UPDATE posts 
       SET status = $1, "rejectionReason" = $2, "updatedAt" = NOW() 
       WHERE id = $3 
       RETURNING *`,
      [status, status === 'REJECTED' ? rejectionReason : null, id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error: unknown) {
    console.error('Admin Post Status PATCH Error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
