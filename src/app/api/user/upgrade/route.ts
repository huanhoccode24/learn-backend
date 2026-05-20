import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import pool from '@/lib/db';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { role } = await req.json();

    if (role !== 'PRO' && role !== 'VIP') {
      return new NextResponse('Invalid Role', { status: 400 });
    }

    const userId = session.user.id;

    const query = `
      UPDATE users
      SET role = $1
      WHERE id = $2
      RETURNING id, role
    `;

    const result = await pool.query(query, [role, userId]);

    if (result.rowCount === 0) {
      return new NextResponse('User not found', { status: 404 });
    }

    return NextResponse.json({ success: true, user: result.rows[0] });
  } catch (error) {
    console.error('UPGRADE_USER_ERROR', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
