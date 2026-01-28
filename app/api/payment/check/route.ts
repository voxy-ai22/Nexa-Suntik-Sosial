import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    if (!sql) return NextResponse.json({ message: 'DB Error' }, { status: 500 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ message: 'ID diperlukan' }, { status: 400 });

    const order = await sql`SELECT status FROM orders WHERE id = ${id}`;

    if (order.length === 0) return NextResponse.json({ message: 'Tidak ditemukan' }, { status: 404 });

    return NextResponse.json({ status: order[0].status });
  } catch (error) {
    return NextResponse.json({ message: 'Server Error' }, { status: 500 });
  }
}