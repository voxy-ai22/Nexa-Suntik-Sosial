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

    // 1. Log report to Database immediately
    await sql`
      INSERT INTO support_email_logs (order_id, email_user, direction, subject, body, status)
      VALUES (${orderId || null}, ${email}, 'incoming', 'Support Request via Web', ${message}, 'Waiting Admin')
    `;

    const smtpUser = process.env.EMAIL_SMTP_USER;
    const smtpPass = process.env.EMAIL_SMTP_PASS; // App Password (16 characters)
    const adminEmail = process.env.EMAIL_ADMIN || smtpUser;

    if (!smtpPass || !smtpUser) {
      console.error("CRITICAL SMTP CONFIG MISSING: Check EMAIL_SMTP_USER/PASS");
      return NextResponse.json({ 
        success: true, 
        message: 'Laporan tersimpan di sistem internal. Email pengiriman belum dikonfigurasi.' 
      });
    }

    // Optimized Gmail SMTP Configuration (SSL Port 465)
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, // SSL
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    const refundPageUrl = `${req.nextUrl.origin}/support/refund`;

    // 2. Prepare Emails
    const adminMail = {
      from: `"Nexa Auto-Bot" <${smtpUser}>`,
      to: adminEmail,
      subject: `[TIKET NEXA] Laporan Baru: ${email}`,
      html: `
        <div style="font-family: sans-serif; padding: 25px; color: #1e293b; background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0;">
          <h2 style="color: #2563eb; font-size: 18px; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">Laporan Support Web</h2>
          <p style="margin: 10px 0;"><b>User:</b> ${email}</p>
          <p style="margin: 10px 0;"><b>Order ID:</b> ${orderId || 'N/A'}</p>
          <div style="background: white; padding: 20px; border-radius: 10px; margin-top: 15px; border-left: 4px solid #2563eb; font-style: italic;">
            "${message}"
          </div>
          <p style="font-size: 11px; color: #94a3b8; margin-top: 25px;">Logged at: ${new Date().toLocaleString('id-ID')}</p>
        </div>
      `
    };

    const userMail = {
      from: `"Nexa Support Team" <${smtpUser}>`,
      to: email,
      subject: "Konfirmasi Penerimaan Laporan - Nexa Sosial",
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 24px; overflow: hidden; background: white;">
          <div style="background: #2563eb; padding: 35px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px; font-style: italic;">NEXA SOSIAL</h1>
            <p style="margin: 10px 0 0 0; font-size: 12px; font-weight: 700; text-transform: uppercase; opacity: 0.8; letter-spacing: 2px;">Automated Support Desk</p>
          </div>
          <div style="padding: 40px; color: #334155; line-height: 1.7;">
            <p style="font-size: 15px;">Halo,</p>
            <p>Pesan Anda mengenai pesanan <b>#${orderId || 'Umum'}</b> telah kami terima dalam sistem antrean.</p>
            
            <div style="background: #f1f5f9; padding: 20px; border-radius: 16px; margin: 25px 0;">
              <p style="margin: 0 0 10px 0; font-weight: 800; color: #1e293b; font-size: 13px; text-transform: uppercase;">Langkah Berikutnya:</p>
              <p style="margin: 0; font-size: 14px;">Harap <b>Balas Email Ini</b> dengan melampirkan data berikut agar dapat kami proses segera:</p>
              <ul style="margin: 10px 0 0 0; padding-left: 20px; font-weight: 600;">
                <li>Bukti pembayaran (Screenshot QRIS)</li>
                <li>Nomor WhatsApp aktif</li>
                <li>ID Pesanan: #${orderId || 'N/A'}</li>
                <li>Link TikTok yang dipesan</li>
              </ul>
            </div>

            <p style="font-size: 14px;">Jika layanan PREMIUM Anda belum berjalan melebihi 1,5 jam, silakan gunakan tombol di bawah untuk klaim refund cepat:</p>
            
            <div style="text-align: center; margin: 35px 0;">
              <a href="${refundPageUrl}" style="background: #2563eb; color: white; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: 800; font-size: 14px; display: inline-block; box-shadow: 0 4px 15px rgba(37,99,235,0.3);">
                AJUKAN REFUND (WA ADMIN)
              </a>
            </div>

            <p style="font-size: 12px; color: #94a3b8; text-align: center; font-style: italic; border-top: 1px solid #f1f5f9; padding-top: 25px;">
              Email ini dikirim secara otomatis. Mohon tidak membalas jika data di atas belum siap.
            </p>
          </div>
        </div>
      `
    };

    // 3. Attempt Delivery
    try {
      await transporter.verify();
      await Promise.all([
        transporter.sendMail(adminMail),
        transporter.sendMail(userMail)
      ]);
      console.log(`Success: Support emails dispatched to ${email}`);
    } catch (mailError: any) {
      console.error("Nodemailer Dispatch Error:", mailError.message);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Support API Internal Error:", error);
    return NextResponse.json({ message: 'Gagal memproses permintaan' }, { status: 500 });
  }
}