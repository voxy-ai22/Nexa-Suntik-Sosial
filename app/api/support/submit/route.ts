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

    // 1. Log to Database
    await sql`
      INSERT INTO support_email_logs (order_id, email_user, direction, subject, body, status)
      VALUES (${orderId || null}, ${email}, 'incoming', 'Support Request via Web', ${message}, 'Waiting Admin')
    `;

    const smtpUser = process.env.EMAIL_SMTP_USER;
    const smtpPass = process.env.EMAIL_SMTP_PASS; // Must be 16-character App Password for Gmail
    const adminEmail = process.env.EMAIL_ADMIN || smtpUser;

    if (!smtpPass || !smtpUser) {
      console.warn("SMTP credentials missing. Email logging only to DB.");
      return NextResponse.json({ success: true, warning: 'SMTP_CONFIG_MISSING' });
    }

    // Gmail SMTP Transport Configuration (Production Grade)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: smtpUser,
        pass: smtpPass,
      }
    });

    const refundPageUrl = `${req.nextUrl.origin}/support/refund`;

    // 2. Email to Admin
    const adminMail = {
      from: `"Nexa Monitoring" <${smtpUser}>`,
      to: adminEmail,
      subject: `[TICKET BARU] ${email}`,
      html: `
        <div style="font-family: sans-serif; color: #1e293b;">
          <h2>Request Support Baru</h2>
          <p><b>User Email:</b> ${email}</p>
          <p><b>Order ID:</b> ${orderId || 'N/A'}</p>
          <p><b>Pesan:</b><br/>${message}</p>
        </div>
      `
    };

    // 3. Automated Auto-Reply to User
    const userMail = {
      from: `"Nexa Support Desk" <${smtpUser}>`,
      to: email,
      subject: "Laporan Tiket Diterima - Nexa Sosial",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
          <div style="background: #2563eb; padding: 20px; color: white; text-align: center;">
            <h2 style="margin: 0;">NEXA SOSIAL</h2>
          </div>
          <div style="padding: 30px; color: #334155;">
            <p>Halo,</p>
            <p>Tiket dukungan Anda untuk <b>#${orderId || 'Umum'}</b> telah kami terima. Admin kami akan segera memvalidasi laporan Anda.</p>
            <p>Jika Anda memerlukan refund dana segera, silakan klik tombol di bawah ini:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${refundPageUrl}" style="background: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
                Lanjut ke Refund Desk (WA)
              </a>
            </div>
            <p style="font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 20px;">
              Email ini dikirim secara otomatis. Mohon tidak membalas email ini.
            </p>
          </div>
        </div>
      `
    };

    try {
      // Verify connection before sending
      await transporter.verify();
      // Send both emails
      await Promise.all([
        transporter.sendMail(adminMail),
        transporter.sendMail(userMail)
      ]);
      console.log(`Success: Emails dispatched to Admin and User (${email})`);
    } catch (mailError: any) {
      console.error("Nodemailer Dispatch Error:", mailError.message);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Support API Crash:", error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}