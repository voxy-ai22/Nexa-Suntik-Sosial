import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { orderId, proofImage } = await req.json();

    if (!orderId) return NextResponse.json({ message: 'ID Order diperlukan' }, { status: 400 });

    const result = await sql`
      UPDATE requests 
      SET status = 'USER_CONFIRM', 
          proof_image = ${proofImage || null},
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${orderId} AND status = 'WAITING_PAYMENT'
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json({ message: 'Order tidak ditemukan atau sudah dikonfirmasi' }, { status: 404 });
    }

    return NextResponse.json({ success: true, order: result[0] });
  } catch (error) {
    return NextResponse.json({ message: 'Gagal konfirmasi' }, { status: 500 });
  }
}