import { NextRequest, NextResponse } from 'next/server';
import { sql, initDb } from '@/lib/db';
import { checkRateLimit } from '@/lib/ratelimit';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    await initDb();
    const { linkTikTok, jumlahView, serviceType, phoneNumber, deviceId } = await req.json();

    if (!linkTikTok || !deviceId) {
      return NextResponse.json({ message: 'Data tidak lengkap' }, { status: 400 });
    }

    // Get client IP for spam protection
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';

    if (serviceType.toUpperCase() === 'FREE') {
      // FREE service is locked to exactly 1,000 views
      const fixedFreeViews = 1000;
      
      // Enforce 24-hour rate limit lock and spam protection
      const rateLimit = await checkRateLimit(deviceId, ip);
      if (!rateLimit.allowed) {
        return NextResponse.json({ 
          message: rateLimit.message 
        }, { status: 429 });
      }

      const result = await sql`
        INSERT INTO orders (device_id, service_type, tiktok_link, views, status)
        VALUES (${deviceId}, 'FREE', ${linkTikTok}, ${fixedFreeViews}, 'processing')
        RETURNING *
      `;
      return NextResponse.json(result[0]);
    } else {
      // Premium Service Validation
      if (!phoneNumber) {
        return NextResponse.json({ message: 'Nomor WhatsApp wajib untuk Premium' }, { status: 400 });
      }
      
      // Premium limit: 1.000 - 200.000 views
      if (jumlahView > 200000 || jumlahView < 1000) {
        return NextResponse.json({ message: 'Premium: 1.000 - 200.000 views' }, { status: 400 });
      }
      
      const expiredAt = new Date(Date.now() + 120 * 1000); // 2 mins for premium payment upload

      const result = await sql`
        INSERT INTO orders (device_id, service_type, tiktok_link, phone_number, views, status, qris_expired_at)
        VALUES (${deviceId}, 'PREMIUM', ${linkTikTok}, ${phoneNumber}, ${jumlahView}, 'pending_payment', ${expiredAt})
        RETURNING *
      `;
      return NextResponse.json(result[0]);
    }
  } catch (error: any) {
    console.error("Order Submit Error:", error);
    return NextResponse.json({ message: 'Gagal memproses pesanan' }, { status: 500 });
  }
}
