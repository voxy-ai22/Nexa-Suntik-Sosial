import { NextRequest, NextResponse } from 'next/server';
import { sql, initDb } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    await initDb();
    if (!sql) return NextResponse.json({ message: 'DB Error' }, { status: 500 });

    const payload = await req.json();
    const fromEmail = payload.from; 
    const subject = payload.subject || 'No Subject';
    const body = payload.text || payload.html || 'No Content';

    // Anti-Loop Logic
    if (subject.toLowerCase().includes('re:') || subject.toLowerCase().includes('fwd:')) {
      await sql`
        INSERT INTO support_email_logs (email_user, direction, subject, body, status)
        VALUES (${fromEmail}, 'incoming', ${subject}, ${body}, 'Update Received')
      `;
      return NextResponse.json({ message: 'Logged without auto-reply' });
    }

    // Rate Limit Auto-Reply (1 per hour per user)
    const recentLogs = await sql`
      SELECT id FROM support_email_logs 
      WHERE email_user = ${fromEmail} 
      AND direction = 'outgoing' 
      AND created_at > NOW() - INTERVAL '1 hour'
    `;

    if (recentLogs.length > 0) {
      return NextResponse.json({ message: 'Rate limited' });
    }

    await sql`
      INSERT INTO support_email_logs (email_user, direction, subject, body, status)
      VALUES (${fromEmail}, 'incoming', ${subject}, ${body}, 'Waiting Admin Review')
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ message: 'Webhook Error' }, { status: 500 });
  }
}