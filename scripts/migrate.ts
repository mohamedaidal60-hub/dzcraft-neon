import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://upyrxeikpjyxmeeysiyw.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; // MUST be service role for full access
const NEON_URL = process.env.DATABASE_URL;

if (!SUPABASE_KEY || !NEON_URL) {
  console.error("ERREUR : Les variables SUPABASE_SERVICE_ROLE_KEY et DATABASE_URL doivent être définies dans le fichier .env");
  process.exit(1);
}

const pool = new Pool({
  connectionString: NEON_URL,
  ssl: { rejectUnauthorized: false }
});

async function migrate() {
  const client = await pool.connect();
  try {
    console.log("--- DÉBUT DE LA MIGRATION ---");

    // 1. Catégories
    console.log("Migration des catégories...");
    const catRes = await fetch(`${SUPABASE_URL}/rest/v1/categories?select=*`, {
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
    });
    const categories = await catRes.json();
    console.log(`${categories.length} catégories trouvées.`);

    for (const cat of categories) {
      await client.query(
        'INSERT INTO categories (id, name, slug, image_url) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, slug = EXCLUDED.slug, image_url = EXCLUDED.image_url',
        [cat.id, cat.name, cat.slug, cat.image_url]
      );
    }

    // 2. Produits
    console.log("Migration des produits...");
    const prodRes = await fetch(`${SUPABASE_URL}/rest/v1/products?select=*`, {
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
    });
    const products = await prodRes.json();
    console.log(`${products.length} produits trouvés.`);

    for (const prod of products) {
      await client.query(
        'INSERT INTO products (id, name, slug, description, price, category_id, image_url, target_group) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, slug = EXCLUDED.slug',
        [prod.id, prod.name, prod.slug, prod.description, prod.price, prod.category_id, prod.image_url, prod.target_group || []]
      );
    }

    // 3. Variants (si existants)
    console.log("Migration des variants...");
    const varRes = await fetch(`${SUPABASE_URL}/rest/v1/variants?select=*`, {
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
    });
    if (varRes.ok) {
      const variants = await varRes.json();
      console.log(`${variants.length} variants trouvés.`);
      for (const v of variants) {
        await client.query(
          'INSERT INTO variants (id, product_id, type, value, stock) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id) DO NOTHING',
          [v.id, v.product_id, v.type, v.value, v.stock]
        );
      }
    }

    // 4. Histoire
    console.log("Migration de l'histoire...");
    const histRes = await fetch(`${SUPABASE_URL}/rest/v1/history_posts?select=*`, {
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
    });
    const history = await histRes.json();
    for (const h of history) {
      await client.query(
        'INSERT INTO history_posts (id, title, content, image_url, bg_image_url) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id) DO NOTHING',
        [h.id, h.title, h.content, h.image_url, h.bg_image_url]
      );
    }

    // 5. Settings
    console.log("Migration des réglages...");
    const setRes = await fetch(`${SUPABASE_URL}/rest/v1/settings?select=*`, {
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
    });
    const settings = await setRes.json();
    for (const s of settings) {
      await client.query(
        'INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value',
        [s.key, s.value]
      );
    }

    console.log("--- MIGRATION RÉUSSIE ---");
  } catch (error) {
    console.error("ERREUR lors de la migration :", error);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
