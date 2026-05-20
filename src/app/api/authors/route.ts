import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const result = await pool.query(
      `SELECT id, name, image, bio, "facebookLink", "tiktokLink", "youtubeLink", role
       FROM users 
       WHERE role = 'COLLABORATOR'
       ORDER BY name ASC`
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('[AUTHORS_GET]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}
