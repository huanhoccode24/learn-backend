import { NextResponse } from 'next/server';
import { currentUser } from '@/lib/auth-helpers';
import pool from '@/lib/db';

export async function GET() {
  const user = await currentUser();

  if (!user || !user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Lấy thông tin chi tiết user bao gồm bio, social links và các tài khoản đã liên kết
    const userResult = await pool.query(
      `SELECT id, name, email, image, role, bio, 
              "phoneNumber", "address", "facebookLink", "tiktokLink", "youtubeLink"
       FROM users WHERE id = $1`,
      [user.id]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const accountsResult = await pool.query(
      'SELECT provider FROM accounts WHERE "userId" = $1',
      [user.id]
    );

    const fullUser = {
      ...userResult.rows[0],
      accounts: accountsResult.rows.map((row: { provider: string }) => row.provider),
    };

    return NextResponse.json(fullUser);
  } catch (error: unknown) {
    console.error('Profile GET Error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const user = await currentUser();

  if (!user || !user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, image, bio, phoneNumber, address, facebookLink, tiktokLink, youtubeLink } = body;

    // Cập nhật thông tin profile bao gồm các trường mới
    const result = await pool.query(
      `UPDATE users 
       SET name = COALESCE($1, name), 
           image = COALESCE($2, image), 
           bio = COALESCE($3, bio),
           "phoneNumber" = COALESCE($4, "phoneNumber"),
           "address" = COALESCE($5, "address"),
           "facebookLink" = COALESCE($6, "facebookLink"),
           "tiktokLink" = COALESCE($7, "tiktokLink"),
           "youtubeLink" = COALESCE($8, "youtubeLink"),
           "updatedAt" = CURRENT_TIMESTAMP 
       WHERE id = $9 
       RETURNING id, name, image, bio, "phoneNumber", "address", "facebookLink", "tiktokLink", "youtubeLink"`,
      [name, image, bio, phoneNumber, address, facebookLink, tiktokLink, youtubeLink, user.id]
    );

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: result.rows[0],
    });
  } catch (error: unknown) {
    console.error('Profile PATCH Error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

