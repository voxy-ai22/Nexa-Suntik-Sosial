
import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { verifyAdminKey } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const adminKey = req.headers.get('authorization');
  
  if (!adminKey || !verifyAdminKey(adminKey)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await sql`SELECT * FROM requests ORDER BY created_at DESC`;
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ message: 'Error fetching data' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const adminKey = req.headers.get('authorization');
  if (!adminKey || !verifyAdminKey(adminKey)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id, status } = await req.json();
    const result = await sql`
      UPDATE requests 
      SET status = ${status} 
      WHERE id = ${id} 
      RETURNING *
    `;
    return NextResponse.json(result[0]);
  } catch (error) {
    return NextResponse.json({ message: 'Update failed' }, { status: 500 });
  }
}
