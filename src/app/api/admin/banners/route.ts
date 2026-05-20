import { NextResponse } from 'next/server';
import { isAdmin, currentUser } from '@/lib/auth-helpers';
import pool from '@/lib/db';

export async function GET(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const fields = searchParams.get('fields');

  try {
    let query = 'SELECT * FROM banners ORDER BY "order" ASC, "createdAt" DESC';
    
    // Nếu chỉ yêu cầu metadata, loại bỏ cột image để tăng tốc độ (giảm kích thước payload)
    if (fields === 'metadata') {
      // Đảm bảo bọc tất cả tên cột trong dấu ngoặc kép để tránh lỗi SQL với các từ khóa dự phòng
      query = 'SELECT "id", "title", "code", "order", "is_active", "createdAt", "link" FROM banners ORDER BY "order" ASC, "createdAt" DESC';
    }

    const result = await pool.query(query);
    return NextResponse.json(result.rows);
  } catch (error: unknown) {
    console.error('Admin Banners GET Error:', error instanceof Error ? error.message : 'Unknown error');
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
    const { title, image, link, order, is_active, code } = body;

    const result = await pool.query(
      `INSERT INTO banners (title, image, link, "order", is_active, code) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [title, image, link, order || 0, is_active !== undefined ? is_active : true, code || null]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error: unknown) {
    console.error('Admin Banners POST Error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
