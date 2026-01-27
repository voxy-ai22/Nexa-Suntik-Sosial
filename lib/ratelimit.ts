
import { sql } from './db';

export async function checkRateLimit(identifier: string): Promise<{ allowed: boolean; waitTimeHours?: number }> {
  // Free service: 1 request per 25 hours
  const hoursLimit = 25;
  
  const lastRequest = await sql`
    SELECT created_at 
    FROM requests 
    WHERE identifier = ${identifier} 
    AND service_type = 'free'
    ORDER BY created_at DESC 
    LIMIT 1
  `;

  if (lastRequest.length === 0) {
    return { allowed: true };
  }

  const lastTime = new Date(lastRequest[0].created_at).getTime();
  const currentTime = new Date().getTime();
  const diffHours = (currentTime - lastTime) / (1000 * 60 * 60);

  if (diffHours < hoursLimit) {
    return { 
      allowed: false, 
      waitTimeHours: Math.ceil(hoursLimit - diffHours) 
    };
  }

  return { allowed: true };
}
