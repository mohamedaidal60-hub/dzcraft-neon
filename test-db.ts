import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const { Client } = pg;
const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function testConnection() {
  console.log('Testing connection with URL:', process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':***@'));
  try {
    await client.connect();
    console.log('Successfully connected to the database');
    const res = await client.query('SELECT NOW()');
    console.log('Query result:', res.rows[0]);
    await client.end();
  } catch (err) {
    console.error('Connection error:', err);
  }
}

testConnection();
