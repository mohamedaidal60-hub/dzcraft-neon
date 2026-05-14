const { Client } = require('pg');
const fs = require('fs');
const connectionString = 'postgresql://neondb_owner:npg_yDrIU7dQFo0j@ep-divine-bar-amzxxz08-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

async function migrateAll() {
  const client = new Client({ connectionString });
  try {
    await client.connect();
    
    // 1. Categories
    const categoriesData = JSON.parse(fs.readFileSync('../farah2/supabase_categories.json', 'utf8'));
    for (const cat of categoriesData) {
      await client.query(
        'INSERT INTO categories (id, name, slug, image_url) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO UPDATE SET name = $2, slug = $3, image_url = $4',
        [cat.id, cat.name, cat.slug, cat.image_url]
      );
    }
    console.log('Categories migrated.');

    // 2. Products
    const productsData = JSON.parse(fs.readFileSync('../farah2/supabase_dump.json', 'utf8'));
    for (const p of productsData) {
      await client.query(
        `INSERT INTO products (
          id, name, slug, description, price, category_id, image_url, 
          subtitle, hover_image, is_published, is_featured, stock, price_cents
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) 
        ON CONFLICT (id) DO UPDATE SET 
          name = $2, slug = $3, description = $4, price = $5, category_id = $6, 
          image_url = $7, subtitle = $8, hover_image = $9, is_published = $10, 
          is_featured = $11, stock = $12, price_cents = $13`,
        [
          p.id, p.name, p.slug, p.description, (p.price_cents || 0) / 100, p.category_id, 
          p.primary_image || p.image_url, p.subtitle, p.hover_image, 
          p.is_published ?? true, p.is_featured ?? false, p.stock || 0, p.price_cents
        ]
      );
    }
    console.log('Products migrated.');

    // 3. Stories
    const storiesData = JSON.parse(fs.readFileSync('../farah2/supabase_stories.json', 'utf8'));
    for (const s of storiesData) {
      // Into history_posts
      await client.query(
        'INSERT INTO history_posts (id, title, content, image_url) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO UPDATE SET title = $2, content = $3, image_url = $4',
        [s.id, s.title || '', s.content || '', s.image_url]
      );
      // Into stories (for the old code)
      await client.query(
        'INSERT INTO stories (id, title, content, image_url) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO UPDATE SET title = $2, content = $3, image_url = $4',
        [s.id, s.title || '', s.content || '', s.image_url]
      );
    }
    console.log('Stories migrated.');

    console.log('Migration completed successfully!');
  } catch (err) {
    console.error('Migration error:', err.message);
  } finally {
    await client.end();
  }
}
migrateAll();
