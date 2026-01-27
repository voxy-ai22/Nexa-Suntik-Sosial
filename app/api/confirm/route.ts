import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { orderId, proofImage } = await req.json();

    if (!orderId || !proofImage) {
      return NextResponse.json({ message: 'Bukti pembayaran wajib diunggah' }, { status: 400 });
    }

    const result = await sql`
      UPDATE orders 
      SET status = 'waiting_admin', 
          payment_proof_url = ${proofImage},
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${orderId} AND status = 'pending_payment'
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json({ message: 'Order tidak ditemukan atau sudah diproses' }, { status: 404 });
    }

    return NextResponse.json({ success: true, order: result[0] });
  } catch (error) {
    return NextResponse.json({ message: 'Gagal mengunggah bukti' }, { status: 500 });
  }
}