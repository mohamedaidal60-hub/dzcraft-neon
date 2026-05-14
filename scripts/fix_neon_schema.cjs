const { Client } = require('pg');
const connectionString = 'postgresql://neondb_owner:npg_yDrIU7dQFo0j@ep-divine-bar-amzxxz08-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

async function updateSchema() {
  const client = new Client({ connectionString });
  try {
    await client.connect();
    console.log('Adding missing columns to products table...');
    
    await client.query(`
      ALTER TABLE products 
      ADD COLUMN IF NOT EXISTS subtitle TEXT,
      ADD COLUMN IF NOT EXISTS hover_image TEXT,
      ADD COLUMN IF NOT EXISTS gallery TEXT[] DEFAULT '{}',
      ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT TRUE,
      ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS stock INTEGER DEFAULT 100,
      ADD COLUMN IF NOT EXISTS price_cents INTEGER,
      ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'EUR',
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
    `);

    // Also check categories table
    await client.query(`
      ALTER TABLE categories 
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
    `);

    // Also check history_posts vs stories
    // If the code uses 'stories', maybe we should rename or create a view
    await client.query(`
      CREATE TABLE IF NOT EXISTS stories (
        id SERIAL PRIMARY KEY,
        title TEXT,
        content TEXT,
        image_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('Schema updated successfully!');
  } catch (err) {
    console.error('Error updating schema:', err.message);
  } finally {
    await client.end();
  }
}
updateSchema();
