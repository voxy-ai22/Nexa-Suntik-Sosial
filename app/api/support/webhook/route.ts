import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  try {
    // Asumsi payload dari Inbound Email Service (seperti Resend/SendGrid)
    const payload = await req.json();
    const fromEmail = payload.from; 
    const subject = payload.subject;
    const body = payload.text || payload.html;

    // 1. PENCEGAHAN EMAIL LOOP
    // Jangan balas jika subject mengandung Re: atau Fwd: yang sudah kita proses
    if (subject.toLowerCase().includes('re:') || subject.toLowerCase().includes('fwd:')) {
      // Kita tetap simpan ke log agar admin bisa baca, tapi tidak auto-reply lagi
      await sql`
        INSERT INTO support_email_logs (email_user, direction, subject, body, status)
        VALUES (${fromEmail}, 'incoming', ${subject}, ${body}, 'Data Complete')
      `;
      return NextResponse.json({ message: 'Logged without auto-reply (Anti-Loop)' });
    }

    // 2. Cek apakah sudah pernah kirim auto-reply untuk email ini dalam 1 jam terakhir
    const recentLogs = await sql`
      SELECT id FROM support_email_logs 
      WHERE email_user = ${fromEmail} 
      AND direction = 'outgoing' 
      AND created_at > NOW() - INTERVAL '1 hour'
    `;

    if (recentLogs.length > 0) {
      return NextResponse.json({ message: 'Rate limited auto-reply' });
    }

    // 3. Simpan balasan user
    await sql`
      INSERT INTO support_email_logs (email_user, direction, subject, body, status)
      VALUES (${fromEmail}, 'incoming', ${subject}, ${body}, 'Waiting Admin Review')
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ message: 'Webhook Error' }, { status: 500 });
  }
}