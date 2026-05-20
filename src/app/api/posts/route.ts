import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const categorySlug = searchParams.get('category');
  const searchQuery = searchParams.get('search');
  const limitParam = searchParams.get('limit');

  try {
    let query = `
      SELECT p.id, p.title, p.slug, p.content, p.description, p.thumbnail, p."createdAt", 
             c.name as "categoryName", c.slug as "categorySlug",
             COALESCE(p."customAuthor", u.name) as "authorName", u.image as "authorImage"
      FROM posts p
      LEFT JOIN categories c ON p."categoryId" = c.id
      LEFT JOIN users u ON p."authorId" = u.id
      WHERE p.status = 'PUBLISHED'
        AND (c."isHidden" IS NULL OR c."isHidden" = false)
    `;
    
    const values: unknown[] = [];
    let paramIndex = 1;

    if (categorySlug) {
      query += ` AND c.slug = $${paramIndex++}`;
      values.push(categorySlug);
    }

    if (searchQuery) {
      query += ` AND (p.title ILIKE $${paramIndex++} OR p.content ILIKE $${paramIndex++})`;
      values.push(`%${searchQuery}%`, `%${searchQuery}%`);
    }

    query += ` ORDER BY p."createdAt" DESC`;

    if (limitParam) {
      const limit = parseInt(limitParam, 10);
      if (!isNaN(limit) && limit > 0) {
        query += ` LIMIT $${paramIndex++}`;
        values.push(limit);
      }
    }

    const result = await pool.query(query, values);
    return NextResponse.json(result.rows, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (error: unknown) {
    console.error('Public Posts GET Error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
