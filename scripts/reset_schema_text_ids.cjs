const { Client } = require('pg');
const connectionString = 'postgresql://neondb_owner:npg_yDrIU7dQFo0j@ep-divine-bar-amzxxz08-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

async function resetSchema() {
  const client = new Client({ connectionString });
  try {
    await client.connect();
    
    // Drop existing tables (order matters)
    await client.query('DROP TABLE IF EXISTS variants CASCADE');
    await client.query('DROP TABLE IF EXISTS order_items CASCADE');
    await client.query('DROP TABLE IF EXISTS products CASCADE');
    await client.query('DROP TABLE IF EXISTS categories CASCADE');
    await client.query('DROP TABLE IF EXISTS history_posts CASCADE');
    await client.query('DROP TABLE IF EXISTS stories CASCADE');

    // Create with TEXT IDs for Supabase compatibility
    await client.query(`
      CREATE TABLE categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        image_url TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE products (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        description TEXT,
        price NUMERIC(10, 2),
        price_cents INTEGER,
        currency TEXT DEFAULT 'EUR',
        category_id TEXT REFERENCES categories(id),
        image_url TEXT,
        hover_image TEXT,
        gallery TEXT[] DEFAULT '{}',
        target_group TEXT[] DEFAULT '{}',
        is_published BOOLEAN DEFAULT TRUE,
        is_featured BOOLEAN DEFAULT FALSE,
        stock INTEGER DEFAULT 100,
        subtitle TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE variants (
        id SERIAL PRIMARY KEY,
        product_id TEXT REFERENCES products(id),
        type TEXT NOT NULL,
        value TEXT NOT NULL,
        stock INTEGER DEFAULT 100,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE history_posts (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        image_url TEXT,
        bg_image_url TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE stories (
        id TEXT PRIMARY KEY,
        title TEXT,
        content TEXT,
        image_url TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    console.log('Schema reset with TEXT IDs.');
  } finally {
    await client.end();
  }
}
resetSchema();
