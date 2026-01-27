import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const deviceId = searchParams.get('deviceId');

    if (!deviceId) return NextResponse.json([], { status: 200 });

    const data = await sql`
      SELECT id, views as jumlah_view, service_type, status, created_at 
      FROM orders 
      WHERE device_id = ${deviceId} 
      ORDER BY created_at DESC 
      LIMIT 10
    `;
    
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json([], { status: 500 });
  }
}