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
    // Schema update
    await sql`
      CREATE TABLE IF NOT EXISTS requests (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        link_tiktok TEXT NOT NULL,
        jumlah_view INTEGER NOT NULL,
        service_type TEXT NOT NULL,
        harga INTEGER NOT NULL,
        identifier TEXT NOT NULL,
        status TEXT NOT NULL, -- CREATED, WAITING_PAYMENT, USER_CONFIRM, PAID, REJECTED
        payment_ref TEXT,
        proof_image TEXT, -- Base64 or URL
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    await sql`CREATE INDEX IF NOT EXISTS idx_status ON requests(status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_identifier_service ON requests(identifier, service_type)`;
  } catch (err) {
    console.error("Database initialization failed:", err);
  }
}