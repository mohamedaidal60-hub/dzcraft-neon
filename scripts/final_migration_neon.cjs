const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = 'postgresql://neondb_owner:npg_yDrIU7dQFo0j@ep-divine-bar-amzxxz08-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const DATA_DIR = path.join(__dirname, '..', '..', 'farah2');

async function migrate() {
  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    console.log('Connected to Neon database.');

    // 1. Clear existing data in correct order
    console.log('Clearing existing data...');
    await client.query('DELETE FROM order_items');
    await client.query('DELETE FROM orders');
    await client.query('DELETE FROM variants');
    await client.query('DELETE FROM products');
    await client.query('DELETE FROM categories');
    await client.query('DELETE FROM history_posts');

    // 2. Migrate Categories
    console.log('Migrating categories...');
    const categoriesData = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'supabase_categories.json'), 'utf8'));
    const categoryMapping = {}; // UUID -> Neon ID

    for (const cat of categoriesData) {
      const res = await client.query(
        'INSERT INTO categories (name, slug) VALUES ($1, $2) RETURNING id',
        [cat.name, cat.slug]
      );
      categoryMapping[cat.id] = res.rows[0].id;
      console.log(`Migrated category: ${cat.name}`);
    }

    // 3. Migrate Products & Variants
    console.log('Migrating products & variants...');
    const productsData = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'supabase_dump.json'), 'utf8'));

    for (const p of productsData) {
      const neonCategoryId = categoryMapping[p.category_id] || null;
      const price = p.price_cents ? p.price_cents / 100 : 0;
      const imageUrl = p.primary_image || (p.images && p.images[0]) || '';

      const prodRes = await client.query(
        'INSERT INTO products (name, slug, description, price, category_id, image_url, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
        [p.name, p.slug, p.description, price, neonCategoryId, imageUrl, p.created_at]
      );
      const neonProductId = prodRes.rows[0].id;

      // Migrate variants if present
      if (p.variants && Array.isArray(p.variants)) {
        for (const variantGroup of p.variants) {
          const type = variantGroup.label || 'Option';
          if (variantGroup.options && Array.isArray(variantGroup.options)) {
            for (const optionValue of variantGroup.options) {
              await client.query(
                'INSERT INTO variants (product_id, type, value, stock) VALUES ($1, $2, $3, $4)',
                [neonProductId, type, optionValue, p.stock || 0]
              );
            }
          }
        }
      }
    }
    console.log(`Migrated ${productsData.length} products with their variants.`);

    // 4. Migrate Stories (History Posts)
    console.log('Migrating stories...');
    const storiesData = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'supabase_stories.json'), 'utf8'));

    for (const s of storiesData) {
      let content = '';
      let imageUrl = '';
      try {
        const body = JSON.parse(s.body);
        content = body.text || '';
        imageUrl = body.image || '';
      } catch (e) {
        content = s.body;
      }

      await client.query(
        'INSERT INTO history_posts (title, content, image_url, created_at) VALUES ($1, $2, $3, $4)',
        [s.title, content, imageUrl, s.created_at]
      );
    }
    console.log(`Migrated ${storiesData.length} stories.`);

    // 5. Migrate Settings
    console.log('Migrating settings...');
    const settingsData = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'supabase_settings.json'), 'utf8'));

    for (const set of settingsData) {
      await client.query(
        `INSERT INTO settings (key, value) VALUES ($1, $2)
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
        [set.key, set.value]
      );
    }
    console.log('Migrated settings.');

    console.log('Migration completed successfully!');

  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await client.end();
  }
}

migrate();
