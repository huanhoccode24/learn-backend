import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    // Lấy 6 bài viết nổi bật, ưu tiên bài viết mới nhất
    const result = await pool.query(`
      SELECT p.id, p.title, p.slug, p.description, p.thumbnail, p."createdAt", 
             c.name as "categoryName", u.name as "authorName"
      FROM posts p
      LEFT JOIN categories c ON p."categoryId" = c.id
      LEFT JOIN users u ON p."authorId" = u.id
      WHERE p.status = 'PUBLISHED' AND p.is_featured = true
      ORDER BY p."createdAt" DESC
      LIMIT 6
    `);
    return NextResponse.json(result.rows, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (error: unknown) {
    console.error('Featured Posts GET Error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
