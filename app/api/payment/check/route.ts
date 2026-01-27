
import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ message: 'ID required' }, { status: 400 });

    const order = await sql`SELECT status FROM requests WHERE id = ${id}`;

    if (order.length === 0) return NextResponse.json({ message: 'Pesanan tidak ditemukan' }, { status: 404 });

    return NextResponse.json({ status: order[0].status });
  } catch (error) {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
