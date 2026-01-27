
import { NextRequest, NextResponse } from 'next/server';
import { sql, initDb } from '@/lib/db';
import { checkRateLimit } from '@/lib/ratelimit';
import { generatePaymentRef } from '@/lib/payment';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    if (!sql) {
      return NextResponse.json({ message: 'Database belum dikonfigurasi di ENV' }, { status: 500 });
    }

    await initDb();
    const { linkTikTok, jumlahView, serviceType } = await req.json();

    if (!linkTikTok || !jumlahView) {
      return NextResponse.json({ message: 'Data tidak lengkap' }, { status: 400 });
    }

    const identifier = req.headers.get('x-forwarded-for')?.split(',')[0] || 'local-user';
    const userId = `USER-${Math.floor(1000 + Math.random() * 9000)}`;

    if (serviceType === 'free') {
      if (jumlahView > 2992) {
        return NextResponse.json({ message: 'Maksimal view FREE adalah 2992' }, { status: 400 });
      }

      const rateLimit = await checkRateLimit(identifier);
      if (!rateLimit.allowed) {
        return NextResponse.json({ 
          message: `Limit: Silakan tunggu ${rateLimit.waitTimeHours} jam lagi.` 
        }, { status: 429 });
      }

      const result = await sql`
        INSERT INTO requests (user_id, link_tiktok, jumlah_view, service_type, harga, identifier, status)
        VALUES (${userId}, ${linkTikTok}, ${jumlahView}, 'free', 0, ${identifier}, 'pending')
        RETURNING *
      `;

      return NextResponse.json(result[0]);
    } else {
      const harga = Math.max(100, Math.floor((jumlahView / 1000) * 100));
      const paymentRef = generatePaymentRef();

      const result = await sql`
        INSERT INTO requests (user_id, link_tiktok, jumlah_view, service_type, harga, identifier, status, payment_ref)
        VALUES (${userId}, ${linkTikTok}, ${jumlahView}, 'premium', ${harga}, ${identifier}, 'waiting_payment', ${paymentRef})
        RETURNING *
      `;

      return NextResponse.json(result[0]);
    }
  } catch (error: any) {
    console.error('Submit error:', error);
    return NextResponse.json({ message: 'Terjadi kesalahan sistem' }, { status: 500 });
  }
}
