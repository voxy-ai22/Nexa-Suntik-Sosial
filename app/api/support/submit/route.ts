import { NextRequest, NextResponse } from 'next/server';
import { sql, initDb } from '@/lib/db';
import nodemailer from 'nodemailer';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    await initDb();
    const { email, orderId, message } = await req.json();

    if (!email || !message) {
      return NextResponse.json({ message: 'Email dan pesan wajib diisi' }, { status: 400 });
    }

    // 1. Log ke Database agar admin bisa lihat di dashboard
    await sql`
      INSERT INTO support_email_logs (order_id, email_user, direction, subject, body, status)
      VALUES (${orderId || null}, ${email}, 'incoming', 'Support Request via Web', ${message}, 'Waiting Admin')
    `;

    const smtpUser = process.env.EMAIL_SMTP_USER;
    const smtpPass = process.env.EMAIL_SMTP_PASS;

    if (!smtpPass || !smtpUser) {
      console.warn("SMTP credentials missing in environment variables.");
      return NextResponse.json({ 
        success: true, 
        message: 'Laporan tersimpan di sistem. Email pengirim belum terkonfigurasi di server.' 
      });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    // 2. Email ke Admin (Notifikasi)
    const adminMail = {
      from: `"Nexa Web System" <${smtpUser}>`,
      to: process.env.EMAIL_ADMIN || smtpUser,
      subject: `[URGENT] Laporan Support: ${email}`,
      text: `User: ${email}\nOrder ID: ${orderId || 'Tidak Ada'}\n\nPesan:\n${message}`
    };

    // 3. Email ke User (Auto-Reply Instan)
    const userMail = {
      from: `"Nexa Support Team" <${smtpUser}>`,
      to: email,
      subject: "[NEXA SUPPORT] Pesan Anda Telah Kami Terima",
      text: `Halo,\n\nTerima kasih telah menghubungi Nexa Support. Laporan Anda mengenai pesanan #${orderId || 'N/A'} telah kami terima.\n\nJika ini terkait layanan Premium yang belum masuk (lebih dari 30 menit), mohon BALAS email ini dengan melampirkan:\n1. Bukti Transfer (Screenshot)\n2. ID Pesanan Anda\n3. Link TikTok\n\nAdmin akan segera memproses refund atau bantuan teknis setelah data divalidasi.\n\nHormat kami,\nNexa Support Team`
    };

    // Kirim secara paralel agar cepat
    await Promise.all([
      transporter.sendMail(adminMail),
      transporter.sendMail(userMail)
    ]);

    return NextResponse.json({ success: true, message: 'Support request sent successfully.' });
  } catch (error: any) {
    console.error("Support Submission Error:", error);
    return NextResponse.json({ message: 'Terjadi kesalahan sistem pengiriman bantuan.' }, { status: 500 });
  }
}