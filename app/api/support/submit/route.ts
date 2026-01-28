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

    // 1. Log report to Database immediately (as per section 7 of document)
    await sql`
      INSERT INTO support_email_logs (order_id, email_user, direction, subject, body, status)
      VALUES (${orderId || null}, ${email}, 'incoming', 'Support Request via Web', ${message}, 'Waiting Admin')
    `;

    const smtpUser = process.env.EMAIL_SMTP_USER;
    const smtpPass = process.env.EMAIL_SMTP_PASS; 
    const adminEmail = process.env.EMAIL_ADMIN || smtpUser;

    if (!smtpPass || !smtpUser) {
      console.error("CRITICAL SMTP CONFIG MISSING");
      return NextResponse.json({ 
        success: true, 
        message: 'Laporan tersimpan di sistem internal. Email pengiriman belum dikonfigurasi.' 
      });
    }

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, 
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    const refundPageUrl = `${req.nextUrl.origin}/support/refund`;

    // Updated email following document requirements: Auto-reply asks for specific data
    const userMail = {
      from: `"Nexa Support Desk" <${smtpUser}>`,
      to: email,
      subject: "Konfirmasi & Permintaan Data Dukungan - Nexa Sosial",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 24px; overflow: hidden; background: white;">
          <div style="background: #0ea5e9; padding: 40px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 24px; font-weight: 800; font-style: italic;">NEXA SOSIAL</h1>
            <p style="margin: 5px 0 0 0; font-size: 10px; font-weight: 700; text-transform: uppercase; opacity: 0.8; letter-spacing: 2px;">Automated Support Desk</p>
          </div>
          <div style="padding: 40px; color: #334155; line-height: 1.6;">
            <p style="font-size: 14px;">Halo,</p>
            <p style="font-size: 14px;">Pesan Anda telah kami terima dalam sistem antrean internal Nexa. Sesuai prosedur resmi kami, harap lengkapi data verifikasi berikut:</p>
            
            <div style="background: #f0f9ff; padding: 25px; border-radius: 20px; margin: 25px 0; border: 1px solid #bae6fd;">
              <p style="margin: 0 0 15px 0; font-weight: 800; color: #0369a1; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Wajib Dilampirkan (Balas Email Ini):</p>
              <ol style="margin: 0; padding-left: 20px; font-size: 14px; font-weight: 600; color: #0c4a6e;">
                <li style="margin-bottom: 8px;">Bukti pembayaran (Screenshot / Foto QRIS)</li>
                <li style="margin-bottom: 8px;">Nomor WhatsApp / Nomor Aktif</li>
                <li style="margin-bottom: 8px;">ID Pesanan: #${orderId || 'N/A'}</li>
                <li>Link TikTok yang dipesan</li>
              </ol>
            </div>

            <p style="font-size: 13px; font-weight: 500;"><b>Catatan SLA:</b> Proses layanan adalah maksimal 1x24 jam. Jika pesanan PREMIUM Anda sudah melebihi 24 jam dan data di atas sudah lengkap, Anda dapat mengajukan refund cepat via WhatsApp Admin melalui link di bawah:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${refundPageUrl}" style="background: #0ea5e9; color: white; padding: 15px 30px; border-radius: 12px; text-decoration: none; font-weight: 800; font-size: 14px; display: inline-block;">
                KLAIM REFUND (WA ADMIN)
              </a>
            </div>

            <p style="font-size: 11px; color: #94a3b8; text-align: center; font-style: italic; border-top: 1px solid #f1f5f9; padding-top: 25px; margin-top: 20px;">
              Ini adalah email balasan otomatis. Sistem kami tidak akan memproses pengajuan tanpa data yang lengkap sesuai prosedur resmi Nexa.
            </p>
          </div>
        </div>
      `
    };

    const adminMail = {
      from: `"Nexa Auto-Bot" <${smtpUser}>`,
      to: adminEmail,
      subject: `[SUPPORT LOG] ${email}`,
      html: `<p>User <b>${email}</b> mengirim pesan support.</p><p>Order ID: ${orderId || 'N/A'}</p><p>Pesan: ${message}</p>`
    };

    try {
      await transporter.verify();
      await Promise.all([
        transporter.sendMail(adminMail),
        transporter.sendMail(userMail)
      ]);
    } catch (mailError: any) {
      console.error("Nodemailer Dispatch Error:", mailError.message);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Support API Internal Error:", error);
    return NextResponse.json({ message: 'Gagal memproses permintaan' }, { status: 500 });
  }
}
