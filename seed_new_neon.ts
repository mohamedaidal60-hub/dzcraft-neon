import pkg from 'pg';
const { Pool } = pkg;

const connectionString = "postgresql://neondb_owner:npg_K8YXBEDZd4NJ@ep-dawn-unit-apjo53d2-pooler.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require";

const pool = new Pool({ 
  connectionString,
  ssl: { rejectUnauthorized: false } 
});

async function seed() {
  try {
    console.log("Initialisation de la nouvelle base Neon...");
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE,
        phone TEXT,
        password TEXT,
        role TEXT DEFAULT 'user',
        first_name TEXT,
        last_name TEXT,
        address TEXT,
        city TEXT,
        postal_code TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name TEXT,
        slug TEXT UNIQUE,
        image_url TEXT
      );

      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name TEXT,
        slug TEXT UNIQUE,
        description TEXT,
        price DECIMAL(10,2),
        category_id INTEGER,
        image_url TEXT,
        ethnicity TEXT[],
        wilaya TEXT[],
        target_group TEXT[],
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS history_posts (
        id SERIAL PRIMARY KEY,
        title TEXT,
        content TEXT,
        image_url TEXT,
        bg_image_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT
      );

      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        total_amount DECIMAL(10,2),
        shipping_address TEXT,
        shipping_city TEXT,
        shipping_postal_code TEXT,
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Insertion de l'admin par défaut
      INSERT INTO users (email, password, role, first_name) 
      VALUES ('DZCD2@hotmail.com', '@sba-Trs2026', 'admin', 'Admin')
      ON CONFLICT (email) DO NOTHING;

      -- Categories par défaut
      INSERT INTO categories (name, slug) VALUES 
      ('Adulte', 'adulte'),
      ('Enfant', 'enfant'),
      ('Bébé', 'bebe'),
      ('Accessoire', 'accessoire')
      ON CONFLICT (slug) DO NOTHING;
    `);

    console.log("Base de données initialisée avec succès !");
  } catch (err) {
    console.error("Erreur lors de l'initialisation :", err.message);
  } finally {
    await pool.end();
  }
}

seed();
