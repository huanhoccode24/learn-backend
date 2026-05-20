import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import pool from '@/lib/db';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { rows } = await pool.query('SELECT role FROM users WHERE id = $1', [session.user.id]);
    
    if (rows.length === 0) {
      return NextResponse.json({ role: 'USER' });
    }

    return NextResponse.json({ role: rows[0].role });
  } catch (error) {
    console.error('Lỗi lấy role:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
