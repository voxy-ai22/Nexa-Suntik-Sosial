
import postgres from 'postgres';

const connectionString = process.env.DATA_BASE;

if (!connectionString) {
  throw new Error('DATABASE_URL is not set in environment variables');
}

export const sql = postgres(connectionString, {
  ssl: 'require',
  max: 10,
});

export async function initDb() {
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
}
