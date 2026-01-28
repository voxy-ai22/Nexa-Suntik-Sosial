
import { sql } from './db';

export async function checkRateLimit(deviceId: string, ip: string): Promise<{ 
  allowed: boolean; 
  message?: string; 
}> {
  if (!sql) return { allowed: true };

  // 1. SPAM PROTECTION (IP BASED - 1 Minute Block)
  // Memeriksa apakah IP sedang dalam masa blokir
  const blockCheck = await sql`
    SELECT blocked_until 
    FROM ip_rate_limits 
    WHERE ip = ${ip} AND blocked_until > NOW()
  `;

  if (blockCheck.length > 0) {
    return { 
      allowed: false, 
      message: "Spam terdeteksi! IP Anda diblokir sementara selama 1 menit. Mohon tenang." 
    };
  }

  // Catat atau perbarui percobaan dari IP ini
  // Jika lebih dari 5 percobaan dalam 60 detik, kunci IP selama 1 menit
  await sql`
    INSERT INTO ip_rate_limits (ip, attempts, last_attempt)
    VALUES (${ip}, 1, NOW())
    ON CONFLICT (ip) DO UPDATE SET
      attempts = CASE 
        WHEN ip_rate_limits.last_attempt > NOW() - INTERVAL '1 minute' THEN ip_rate_limits.attempts + 1 
        ELSE 1 
      END,
      blocked_until = CASE 
        WHEN ip_rate_limits.last_attempt > NOW() - INTERVAL '1 minute' AND ip_rate_limits.attempts + 1 > 5 THEN NOW() + INTERVAL '1 minute'
        ELSE ip_rate_limits.blocked_until
      END,
      last_attempt = NOW()
  `;

  // 2. DAILY LOCK (DEVICE ID BASED - 24 Hours)
  // Memeriksa apakah device ini sudah melakukan request FREE dalam 24 jam terakhir
  const lastRequest = await sql`
    SELECT created_at 
    FROM orders 
    WHERE device_id = ${deviceId} 
    AND service_type = 'FREE'
    AND created_at > NOW() - INTERVAL '24 hours'
    ORDER BY created_at DESC 
    LIMIT 1
  `;

  if (lastRequest.length > 0) {
    const lastTime = new Date(lastRequest[0].created_at).getTime();
    const currentTime = new Date().getTime();
    const diffMs = currentTime - lastTime;
    const diffHours = diffMs / (1000 * 60 * 60);
    const remainingHours = Math.ceil(24 - diffHours);
    
    return { 
      allowed: false, 
      message: `Limit tercapai! Anda hanya bisa klaim FREE 1x per hari. Silakan coba lagi dalam ${remainingHours} jam atau gunakan layanan PREMIUM.` 
    };
  }

  return { allowed: true };
}
