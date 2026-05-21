import { NextResponse } from 'next/server';
import { isAdmin, isCollaborator, currentUser } from '@/lib/auth-helpers';
import pool from '@/lib/db';

export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const isUserAdmin = await isAdmin();
  const isUserCollaborator = await isCollaborator();

  if (!isUserAdmin && !isUserCollaborator) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const result = await pool.query(
      `SELECT 
        c.id, 
        c."postId", 
        c."userId", 
        c."parentId", 
        c.content, 
        c."createdAt",
        u.name as "userName", 
        u.image as "userImage",
        p.title as "postTitle",
        p.slug as "postSlug"
       FROM comments c
       LEFT JOIN users u ON c."userId" = u.id
       INNER JOIN posts p ON c."postId" = p.id
       WHERE p."authorId" = $1 
          OR EXISTS (
            SELECT 1 FROM post_collaborators pc 
            WHERE pc.post_id = p.id AND pc.user_id = $1
          )
       ORDER BY c."createdAt" DESC`,
      [user.id]
    );

    return NextResponse.json(result.rows);
  } catch (error: unknown) {
    console.error('Collaborator Comments GET Error:', error instanceof Error ? error.message : error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
