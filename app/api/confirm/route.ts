import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { orderId, proofImage } = await req.json();

    if (!orderId || !proofImage) {
      return NextResponse.json({ message: 'Bukti pembayaran dan ID Order wajib ada' }, { status: 400 });
    }

    // Verify if order exists and is in correct state
    const currentOrder = await sql`SELECT status FROM orders WHERE id = ${orderId}`;
    if (currentOrder.length === 0) {
      return NextResponse.json({ message: 'Order tidak ditemukan' }, { status: 404 });
    }

    if (currentOrder[0].status !== 'pending_payment') {
      return NextResponse.json({ message: 'Order ini tidak dalam status menunggu pembayaran' }, { status: 400 });
    }

    const result = await sql`
      UPDATE orders 
      SET status = 'waiting_admin', 
          payment_proof_url = ${proofImage},
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${orderId}
      RETURNING *
    `;

    return NextResponse.json({ success: true, order: result[0] });
  } catch (error) {
    console.error("Confirm Proof Error:", error);
    return NextResponse.json({ message: 'Gagal memproses unggahan bukti' }, { status: 500 });
  }
}
