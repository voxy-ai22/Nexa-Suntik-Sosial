
import postgres from 'postgres';

const connectionString = process.env.DATA_BASE;

// Gunakan global agar koneksi tidak dibuat berulang kali saat hot-reload
// Fix: Use globalThis instead of global to avoid 'Cannot find name global' error in TypeScript
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
    console.warn("Database connection string is missing.");
    return;
  }
  
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS requests (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        link_tiktok TEXT NOT NULL,
        jumlah_view INTEGER NOT NULL,
        service_type TEXT NOT NULL,
        harga INTEGER NOT NULL,
        identifier TEXT NOT NULL,
        status TEXT NOT NULL,
        payment_ref TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_identifier ON requests(identifier)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_created_at ON requests(created_at)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_service_type ON requests(service_type)`;
  } catch (err) {
    console.error("Database initialization failed:", err);
  }
}
