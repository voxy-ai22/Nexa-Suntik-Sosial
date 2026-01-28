import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL || process.env.DATA_BASE;

const globalForSql = globalThis as unknown as { sql: any };

export const sql = globalForSql.sql || (connectionString ? postgres(connectionString, {
  ssl: 'require',
  max: 10,
  idle_timeout: 20,
  connect_timeout: 30,
}) : null);

if (process.env.NODE_ENV !== 'production') globalForSql.sql = sql;

export async function initDb() {
  if (!sql) {
    console.error("Database connection string missing!");
    return;
  }
  
  try {
    // Tabel Orders
    await sql`
      CREATE TABLE IF NOT EXISTS orders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        device_id TEXT NOT NULL,
        service_type TEXT NOT NULL,
        tiktok_link TEXT NOT NULL,
        views INTEGER NOT NULL,
        phone_number TEXT,
        status TEXT NOT NULL,
        payment_proof_url TEXT,
        qris_expired_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    // Tabel Support Logs
    await sql`
      CREATE TABLE IF NOT EXISTS support_email_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id TEXT,
        email_user TEXT NOT NULL,
        direction TEXT NOT NULL, 
        subject TEXT NOT NULL,
        body TEXT NOT NULL,
        status TEXT DEFAULT 'Waiting Admin', 
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Tabel IP Rate Limits
    await sql`
      CREATE TABLE IF NOT EXISTS ip_rate_limits (
        ip TEXT PRIMARY KEY,
        attempts INTEGER DEFAULT 1,
        blocked_until TIMESTAMP,
        last_attempt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    await sql`CREATE INDEX IF NOT EXISTS idx_orders_device ON orders(device_id)`;
  } catch (err) {
    console.error("Database initialization failed:", err);
  }
}