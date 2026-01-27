import { NextRequest, NextResponse } from 'next/server';
import { sql, initDb } from '@/lib/db';
import { checkRateLimit } from '@/lib/ratelimit';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    await initDb();
    const { linkTikTok, jumlahView, serviceType, phoneNumber, deviceId } = await req.json();

    if (!linkTikTok || !jumlahView || !deviceId) {
      return NextResponse.json({ message: 'Data tidak lengkap' }, { status: 400 });
    }

    const identifier = req.headers.get('x-forwarded-for')?.split(',')[0] || 'local-user';

    if (serviceType.toUpperCase() === 'FREE') {
      // Validasi Limit Free
      if (jumlahView > 3000) return NextResponse.json({ message: 'Layanan Free maksimal 3000 views' }, { status: 400 });
      
      const rateLimit = await checkRateLimit(identifier);
      if (!rateLimit.allowed) {
        return NextResponse.json({ message: `Limit Free: Tunggu ${rateLimit.waitTimeHours} jam lagi.` }, { status: 429 });
      }

      // Free tidak butuh phone_number
      const result = await sql`
        INSERT INTO orders (device_id, service_type, tiktok_link, views, status)
        VALUES (${deviceId}, 'FREE', ${linkTikTok}, ${jumlahView}, 'processing')
        RETURNING *
      `;
      return NextResponse.json(result[0]);
    } else {
      // Premium Service
      if (!phoneNumber) {
        return NextResponse.json({ message: 'Nomor WhatsApp wajib untuk Premium (untuk koordinasi/refund)' }, { status: 400 });
      }
      
      // Limit Premium ditingkatkan ke 200.000 views
      if (jumlahView > 200000) {
        return NextResponse.json({ message: 'Maksimal order Premium adalah 200.000 views' }, { status: 400 });
      }
      
      const expiredAt = new Date(Date.now() + 60 * 1000); // 60 detik batas upload bukti

      const result = await sql`
        INSERT INTO orders (device_id, service_type, tiktok_link, phone_number, views, status, qris_expired_at)
        VALUES (${deviceId}, 'PREMIUM', ${linkTikTok}, ${phoneNumber}, ${jumlahView}, 'pending_payment', ${expiredAt})
        RETURNING *
      `;
      return NextResponse.json(result[0]);
    }
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ message: 'Gagal memproses pesanan' }, { status: 500 });
  }
}