import { NextRequest, NextResponse } from 'next/server';
import { sql, initDb } from '@/lib/db';
import { checkRateLimit } from '@/lib/ratelimit';
import { generatePaymentRef } from '@/lib/payment';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    await initDb();
    const { linkTikTok, jumlahView, serviceType, phoneNumber, deviceId } = await req.json();

    if (!linkTikTok || !jumlahView || !deviceId) {
      return NextResponse.json({ message: 'Data tidak lengkap' }, { status: 400 });
    }

    const identifier = req.headers.get('x-forwarded-for')?.split(',')[0] || 'local-user';
    const userId = `USER-${Math.floor(1000 + Math.random() * 9000)}`;

    if (serviceType === 'free') {
      const rateLimit = await checkRateLimit(identifier);
      if (!rateLimit.allowed) {
        return NextResponse.json({ message: `Limit: Tunggu ${rateLimit.waitTimeHours} jam.` }, { status: 429 });
      }

      const result = await sql`
        INSERT INTO requests (device_id, user_id, link_tiktok, jumlah_view, service_type, harga, identifier, status)
        VALUES (${deviceId}, ${userId}, ${linkTikTok}, ${jumlahView}, 'free', 0, ${identifier}, 'PAID')
        RETURNING *
      `;
      return NextResponse.json(result[0]);
    } else {
      if (!phoneNumber) return NextResponse.json({ message: 'Nomor HP wajib untuk Premium' }, { status: 400 });
      
      const harga = Math.max(100, Math.floor((jumlahView / 1000) * 100));
      const paymentRef = generatePaymentRef();

      const result = await sql`
        INSERT INTO requests (device_id, user_id, link_tiktok, phone_number, jumlah_view, service_type, harga, identifier, status, payment_ref)
        VALUES (${deviceId}, ${userId}, ${linkTikTok}, ${phoneNumber}, ${jumlahView}, 'premium', ${harga}, ${identifier}, 'WAITING_PAYMENT', ${paymentRef})
        RETURNING *
      `;
      return NextResponse.json(result[0]);
    }
  } catch (error: any) {
    return NextResponse.json({ message: 'Gagal sistem' }, { status: 500 });
  }
}