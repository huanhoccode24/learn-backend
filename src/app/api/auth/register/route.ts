import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { RegisterSchema } from '@/validations/auth';
import pool from '@/lib/db';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedFields = RegisterSchema.safeParse(body);

    if (!validatedFields.success) {
      return NextResponse.json({ error: 'Dữ liệu truyền vào không hợp lệ!' }, { status: 400 });
    }

    const { email, password, name, isCollaborator } = validatedFields.data;

    // Kiểm tra email trùng lặp sử dụng Raw SQL
    const existingUserResult = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUserResult.rows.length > 0) {
      return NextResponse.json({ error: 'Email này đã được sử dụng từ trước!' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const role = isCollaborator ? 'COLLABORATOR' : 'USER';

    // Chèn user mới
    await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)',
      [name, email, hashedPassword, role]
    );

    return NextResponse.json({ success: 'Đăng ký tài khoản thành công!' }, { status: 201 });
  } catch (error) {
    console.error('Lỗi khi đăng ký (API):', error);
    return NextResponse.json({ error: 'Đã xảy ra lỗi hệ thống!' }, { status: 500 });
  }
}
