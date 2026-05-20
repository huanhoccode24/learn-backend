import { NextResponse } from 'next/server';
import { isAdmin, currentUser } from '@/lib/auth-helpers';
import pool from '@/lib/db';
import slugify from 'slugify';

export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const result = await pool.query(`
      SELECT p.*, p."rejectionReason", c.name as "categoryName", u.name as "authorName" 
      FROM posts p
      LEFT JOIN categories c ON p."categoryId" = c.id
      LEFT JOIN users u ON p."authorId" = u.id
      WHERE p.status != 'DRAFT' OR p."authorId" = $1
      ORDER BY p."createdAt" DESC
    `, [user.id]);
    return NextResponse.json(result.rows);
  } catch (error: unknown) {
    console.error('Admin Posts GET Error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const user = await currentUser();
  if (!(await isAdmin()) || !user) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { title, content, thumbnail, categoryId, status, customAuthor, description } = body;
    const slug = slugify(title, { lower: true, strict: true }) + '-' + Date.now();

    const result = await pool.query(
      `INSERT INTO posts (title, slug, content, thumbnail, "categoryId", "authorId", status, "customAuthor", description) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
       RETURNING *`,
      [title, slug, content, thumbnail, categoryId || null, user.id, status || 'PENDING', customAuthor || null, description || null]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error: unknown) {
    console.error('Admin Posts POST Error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

