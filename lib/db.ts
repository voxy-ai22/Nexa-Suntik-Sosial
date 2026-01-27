import postgres from 'postgres';

const connectionString = process.env.DATA_BASE || process.env.DATABASE_URL;

const globalForSql = globalThis as unknown as { sql: any };

export const sql = globalForSql.sql || (connectionString ? postgres(connectionString, {
  ssl: 'require',
  max: 10,
  idle_timeout: 20,
  connect_timeout: 30,
}) : null);

if (process.env.NODE_ENV !== 'production') globalForSql.sql = sql;

export async function initDb() {
  if (!sql) return;
  
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS orders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        device_id TEXT NOT NULL,
        service_type TEXT NOT NULL, -- FREE, PREMIUM
        tiktok_link TEXT NOT NULL,
        views INTEGER NOT NULL,
        phone_number TEXT,
        status TEXT NOT NULL, -- pending_payment, waiting_admin, processing, success, failed
        payment_proof_url TEXT,
        qris_expired_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    await sql`CREATE INDEX IF NOT EXISTS idx_orders_device ON orders(device_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_orders_type ON orders(service_type)`;
  } catch (err) {
    console.error("Database initialization failed:", err);
  }
}