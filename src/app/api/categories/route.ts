import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT 
        c.id, 
        c.name, 
        c.slug, 
        COUNT(p.id)::int as count 
      FROM categories c
      LEFT JOIN posts p ON c.id = p."categoryId" AND p.status = 'PUBLISHED'
      WHERE c."isHidden" IS NULL OR c."isHidden" = false
      GROUP BY c.id, c.name, c.slug
      ORDER BY count DESC, c.name ASC
    `);
    return NextResponse.json(result.rows);
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

