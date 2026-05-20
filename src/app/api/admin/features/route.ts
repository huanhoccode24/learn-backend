import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth-helpers';
import pool from '@/lib/db';

export async function GET() {
  try {
    const result = await pool.query('SELECT * FROM package_features ORDER BY "createdAt" ASC');
    return NextResponse.json(result.rows);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  try {
    const { name, pro_enabled, vip_enabled } = await req.json();
    const result = await pool.query(
      'INSERT INTO package_features (name, pro_enabled, vip_enabled) VALUES ($1, $2, $3) RETURNING *',
      [name, pro_enabled || false, vip_enabled || false]
    );
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  try {
    const { id, name, pro_enabled, vip_enabled } = await req.json();
    const result = await pool.query(
      'UPDATE package_features SET name = $1, pro_enabled = $2, vip_enabled = $3, "updatedAt" = NOW() WHERE id = $4 RETURNING *',
      [name, pro_enabled, vip_enabled, id]
    );
    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
