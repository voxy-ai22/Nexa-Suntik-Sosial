import { NextRequest, NextResponse } from 'next/server';
import { sql, initDb } from '@/lib/db';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  try {
    await initDb();
    const { email, orderId, message } = await req.json();

    if (!email || !message) {
      return NextResponse.json({ message: 'Email dan pesan wajib diisi' }, { status: 400 });
    }

    // 1. Simpan pesan awal user ke DB
    await sql`
      INSERT INTO support_email_logs (order_id, email_user, direction, subject, body, status)
      VALUES (${orderId || null}, ${email}, 'incoming', 'Support Request', ${message}, 'Waiting User')
    `;

    // 2. Setup Transporter
    const smtpPass = process.env.SMTP_PASS;
    if (!smtpPass) {
      console.warn("SMTP_PASS not configured. Logging support request without sending email.");
      return NextResponse.json({ 
        success: true, 
        message: 'Laporan dicatat secara internal. Admin akan segera memproses.' 
      });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'nexastore34@gmail.com',
        pass: smtpPass,
      },
    });

    const subjectReply = "[NEXA SUPPORT] Mohon Lengkapi Data Pesanan Anda";
    const bodyReply = `Terima kasih telah menghubungi Nexa Support.

Untuk mempercepat proses pengecekan dan pengembalian dana, mohon balas email ini dengan melampirkan:
1. Nomor WhatsApp aktif
2. ID Pesanan Anda: ${orderId || '-'}
3. Link TikTok yang dipesan

Catatan: Jika dalam waktu 30 menit layanan Premium belum berjalan, admin akan segera melakukan pengembalian dana setelah data lengkap diterima.

Hormat kami,
Nexa Support Team`;

    // 3. Kirim Auto-Reply
    try {
      await transporter.sendMail({
        from: '"Nexa Support" <nexastore34@gmail.com>',
        to: email,
        subject: subjectReply,
        text: bodyReply,
      });

      // 4. Log Auto-Reply ke DB hanya jika berhasil terkirim
      await sql`
        INSERT INTO support_email_logs (order_id, email_user, direction, subject, body)
        VALUES (${orderId || null}, ${email}, 'outgoing', ${subjectReply}, ${bodyReply})
      `;
    } catch (mailError) {
      console.error("Failed to send support auto-reply email:", mailError);
    }

    return NextResponse.json({ success: true, message: 'Support request sent. Please check your email.' });
  } catch (error: any) {
    console.error("Support API Error:", error);
    return NextResponse.json({ message: 'Terjadi kesalahan sistem' }, { status: 500 });
  }
}