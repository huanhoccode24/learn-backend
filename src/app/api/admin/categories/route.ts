import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth-helpers';
import pool from '@/lib/db';
import slugify from 'slugify';

export async function GET() {
  try {
    const result = await pool.query('SELECT * FROM categories ORDER BY "createdAt" DESC');
    return NextResponse.json(result.rows);
  } catch (error: unknown) {
    console.error('Admin Categories GET Error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { name, description } = body;
    const slug = slugify(name, { lower: true, strict: true });

    const result = await pool.query(
      'INSERT INTO categories (name, slug, description) VALUES ($1, $2, $3) RETURNING *',
      [name, slug, description]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error: unknown) {
    console.error('Admin Categories POST Error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

