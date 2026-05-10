import pkg from 'pg';
const { Pool } = pkg;
import 'dotenv/config';

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL, 
  ssl: { rejectUnauthorized: false } 
});

async function main() {
  try {
    // Check column types
    const res = await pool.query(`
      SELECT table_name, column_name, data_type, character_maximum_length 
      FROM information_schema.columns 
      WHERE table_name IN ('products', 'history_posts', 'settings')
      AND (column_name LIKE '%url%' OR column_name = 'value' OR column_name = 'image_url' OR column_name = 'bg_image_url')
      ORDER BY table_name, column_name
    `);
    console.log('Column types:');
    console.log(JSON.stringify(res.rows, null, 2));

    // Alter any non-TEXT columns to TEXT to support large Base64 strings
    const alterQueries = [
      "ALTER TABLE products ALTER COLUMN image_url TYPE TEXT",
      "ALTER TABLE history_posts ALTER COLUMN image_url TYPE TEXT",
      "ALTER TABLE history_posts ALTER COLUMN bg_image_url TYPE TEXT",
      "ALTER TABLE settings ALTER COLUMN value TYPE TEXT",
    ];

    for (const q of alterQueries) {
      try {
        await pool.query(q);
        console.log('OK:', q);
      } catch (e: any) {
        console.log('Skip (already TEXT or error):', e.message);
      }
    }
    console.log('Done!');
  } catch(e: any) { 
    console.error('Error:', e.message); 
  } finally { 
    await pool.end(); 
  }
}

main();
