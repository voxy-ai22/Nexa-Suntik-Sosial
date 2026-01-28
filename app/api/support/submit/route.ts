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

    // 1. Log ke Database
    await sql`
      INSERT INTO support_email_logs (order_id, email_user, direction, subject, body, status)
      VALUES (${orderId || null}, ${email}, 'incoming', 'Support Request via Web', ${message}, 'Waiting Admin')
    `;

    const smtpUser = process.env.EMAIL_SMTP_USER;
    const smtpPass = process.env.EMAIL_SMTP_PASS;
    const adminEmail = process.env.EMAIL_ADMIN || smtpUser;

    if (!smtpPass || !smtpUser) {
      console.warn("SMTP credentials missing.");
      return NextResponse.json({ 
        success: true, 
        message: 'Laporan tersimpan. Email belum terkonfigurasi.' 
      });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    const refundPageUrl = `${req.nextUrl.origin}/support/refund`;

    // 2. Email ke Admin
    const adminMail = {
      from: `"Nexa Monitoring" <${smtpUser}>`,
      to: adminEmail,
      subject: `[TICKET] ${email} - ${orderId || 'No ID'}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #1e293b;">
          <h2 style="color: #2563eb;">New Support Ticket</h2>
          <p><b>User:</b> ${email}</p>
          <p><b>Order ID:</b> ${orderId || 'N/A'}</p>
          <div style="background: #f1f5f9; padding: 15px; border-radius: 8px; margin-top: 10px;">
            ${message}
          </div>
        </div>
      `
    };

    // 3. Automated Stylish Auto-Reply to User
    const userMail = {
      from: `"Nexa Support Team" <${smtpUser}>`,
      to: email,
      subject: "Support Request Received - Action Required",
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
          <div style="background: #2563eb; padding: 30px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 24px; letter-spacing: -1px;">NEXA SOSIAL</h1>
            <p style="margin: 5px 0 0 0; font-size: 12px; opacity: 0.8; font-weight: bold; text-transform: uppercase;">Customer Excellence</p>
          </div>
          <div style="padding: 40px; color: #334155; line-height: 1.6;">
            <p>Halo,</p>
            <p>Pesan Anda mengenai pesanan <b>#${orderId || 'N/A'}</b> telah kami terima dan sedang dalam antrean review admin.</p>
            
            <div style="background: #eff6ff; border-left: 4px solid #2563eb; padding: 20px; border-radius: 8px; margin: 25px 0;">
              <p style="margin: 0; color: #1e40af; font-weight: 600;">Penting: Untuk pengajuan refund otomatis ke WhatsApp Admin, silakan klik tombol di bawah ini:</p>
            </div>

            <div style="text-align: center; margin: 35px 0;">
              <a href="${refundPageUrl}" style="background: #2563eb; color: white; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; display: inline-block; box-shadow: 0 4px 12px rgba(37,99,235,0.2);">
                Lanjut ke Refund Desk
              </a>
            </div>

            <p style="font-size: 13px; color: #64748b;">Jika tombol tidak berfungsi, salin link ini: <br/> ${refundPageUrl}</p>
          </div>
          <div style="background: #f8fafc; padding: 20px; text-align: center; color: #94a3b8; font-size: 11px; border-top: 1px solid #f1f5f9;">
            © 2026 NEXA ENGINE. Automatic response, please do not reply directly.
          </div>
        </div>
      `
    };

    await Promise.all([
      transporter.sendMail(adminMail),
      transporter.sendMail(userMail)
    ]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ message: 'Mail server error' }, { status: 500 });
  }
}