import { NextResponse } from 'next/server';
import { currentUser } from '@/lib/auth-helpers';
import pool from '@/lib/db';

export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const result = await pool.query(`
      SELECT * FROM notifications 
      WHERE "userId" = $1 
      ORDER BY "createdAt" DESC 
      LIMIT 20
    `, [user.id]);
    
    return NextResponse.json(result.rows);
  } catch (error: unknown) {
    console.error('Notifications GET Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { id, isRead } = body;

    if (id) {
      // Mark specific notification as read
      await pool.query(
        'UPDATE notifications SET "isRead" = $1 WHERE id = $2 AND "userId" = $3',
        [isRead, id, user.id]
      );
    } else {
      // Mark all as read
      await pool.query(
        'UPDATE notifications SET "isRead" = true WHERE "userId" = $1',
        [user.id]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Notifications PATCH Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
