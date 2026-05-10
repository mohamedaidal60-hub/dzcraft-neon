import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function migrate() {
  try {
    console.log('Checking database schema...');
    
    // Add tracking_number and carrier to orders table if they don't exist
    await pool.query(`
      ALTER TABLE orders 
      ADD COLUMN IF NOT EXISTS tracking_number VARCHAR(255),
      ADD COLUMN IF NOT EXISTS carrier VARCHAR(255);
    `);
    
    console.log('Migration completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
