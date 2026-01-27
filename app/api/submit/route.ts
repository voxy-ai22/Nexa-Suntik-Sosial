
import { NextRequest, NextResponse } from 'next/server';
import { sql, initDb } from '@/lib/db';
import { checkRateLimit } from '@/lib/ratelimit';
import { generatePaymentRef } from '@/lib/payment';

export async function POST(req: NextRequest) {
  try {
    await initDb();
    const { linkTikTok, jumlahView, serviceType } = await req.json();

    // Basic Validation
    if (!linkTikTok || !jumlahView) {
      return NextResponse.json({ message: 'Data tidak lengkap' }, { status: 400 });
    }

    // IP / Identifier as rate limit key
    const identifier = req.headers.get('x-forwarded-for') || 'local-user';
    const userId = `USER-${Math.floor(1000 + Math.random() * 9000)}`;

    if (serviceType === 'free') {
      // Free service rules
      if (jumlahView > 2992) {
        return NextResponse.json({ message: 'Max view for free service is 2992' }, { status: 400 });
      }

      const rateLimit = await checkRateLimit(identifier);
      if (!rateLimit.allowed) {
        return NextResponse.json({ 
          message: `Silakan tunggu ${rateLimit.waitTimeHours} jam lagi untuk mencoba layanan FREE.` 
        }, { status: 429 });
      }

      const result = await sql`
        INSERT INTO requests (user_id, link_tiktok, jumlah_view, service_type, harga, identifier, status)
        VALUES (${userId}, ${linkTikTok}, ${jumlahView}, 'free', 0, ${identifier}, 'pending')
        RETURNING *
      `;

      return NextResponse.json(result[0]);
    } else {
      // Premium service rules
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
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
