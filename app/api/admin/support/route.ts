import { NextRequest, NextResponse } from 'next/server';
import { sql, initDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = req.cookies.get('admin_auth')?.value;
  if (auth !== 'true') return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    await initDb();
    if (!sql) return NextResponse.json({ message: 'DB Error' }, { status: 500 });

    const data = await sql`
      SELECT * FROM support_email_logs 
      ORDER BY created_at DESC 
      LIMIT 100
    `;
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ message: 'Error fetching support logs' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const auth = req.cookies.get('admin_auth')?.value;
  if (auth !== 'true') return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    await initDb();
    const { id, status } = await req.json();
    await sql`
      UPDATE support_email_logs 
      SET status = ${status} 
      WHERE id = ${id}
    `;
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ message: 'Update failed' }, { status: 500 });
  }
}