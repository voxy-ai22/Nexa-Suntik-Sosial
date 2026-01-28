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
    
    // Tabel Support Email Logs
    await sql`
      CREATE TABLE IF NOT EXISTS support_email_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id TEXT,
        email_user TEXT NOT NULL,
        direction TEXT NOT NULL, -- incoming, outgoing
        subject TEXT NOT NULL,
        body TEXT NOT NULL,
        status TEXT DEFAULT 'Waiting User', -- Waiting User, Data Complete, Refund Process, Resolved
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    await sql`CREATE INDEX IF NOT EXISTS idx_orders_device ON orders(device_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_support_email_user ON support_email_logs(email_user)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_support_order_id ON support_email_logs(order_id)`;
  } catch (err) {
    console.error("Database initialization failed:", err);
  }
}