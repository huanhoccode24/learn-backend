import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const result = await pool.query(
      `SELECT p.id, p.title, p.slug, p.content, p.thumbnail, p."createdAt", p.description, p.is_featured as "isFeatured",
              c.name as "categoryName", c.slug as "categorySlug",
              COALESCE(p."customAuthor", u.name) as "authorName", u.image as "authorImage"
       FROM posts p
       LEFT JOIN categories c ON p."categoryId" = c.id
       LEFT JOIN users u ON p."authorId" = u.id
       WHERE p.slug = $1 AND p.status = 'PUBLISHED'
         AND (c."isHidden" IS NULL OR c."isHidden" = false)`,
      [slug]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Không tìm thấy bài viết' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0], {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (error: unknown) {
    console.error('Public Post GET Error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
