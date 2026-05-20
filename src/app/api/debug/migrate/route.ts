import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    await pool.query('ALTER TABLE posts ADD COLUMN IF NOT EXISTS featured_request BOOLEAN DEFAULT false;');
    return NextResponse.json({ message: 'Migration successful: added featured_request column' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
