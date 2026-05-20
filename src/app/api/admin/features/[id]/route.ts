import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth-helpers';
import pool from '@/lib/db';

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  try {
    const { id } = await params;
    await pool.query('DELETE FROM package_features WHERE id = $1', [id]);
    return NextResponse.json({ message: 'Deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
