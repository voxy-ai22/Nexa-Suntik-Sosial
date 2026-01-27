import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = req.cookies.get('admin_auth')?.value;
  if (auth !== 'true') return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'all'; // free, premium, all

    let data;
    if (type === 'all') {
      data = await sql`SELECT * FROM requests ORDER BY created_at DESC`;
    } else {
      data = await sql`SELECT * FROM requests WHERE service_type = ${type} ORDER BY created_at DESC`;
    }
    
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ message: 'Error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const auth = req.cookies.get('admin_auth')?.value;
  if (auth !== 'true') return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const { id, status } = await req.json();
    const result = await sql`
      UPDATE requests SET status = ${status}, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ${id} RETURNING *
    `;
    return NextResponse.json(result[0]);
  } catch (error) {
    return NextResponse.json({ message: 'Update failed' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const auth = req.cookies.get('admin_auth')?.value;
  if (auth !== 'true') return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await req.json();
    await sql`DELETE FROM requests WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ message: 'Delete failed' }, { status: 500 });
  }
}