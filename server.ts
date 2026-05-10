import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import fs from 'fs';
import pkg from 'pg';
const { Pool } = pkg;
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Neon Postgres Pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Health check
  app.get('/api/health', async (req, res) => {
    try {
      const client = await pool.connect();
      const dbRes = await client.query('SELECT NOW()');
      client.release();
      res.json({
        status: 'ok',
        database: 'neon_postgres',
        time: dbRes.rows[0].now
      });
    } catch (err: any) {
      res.status(500).json({ status: 'error', message: err.message });
    }
  });

  // Upload endpoint (Store as Base64 for maximum reliability on Neon)
  app.post('/api/upload', upload.single('file'), async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    try {
      const b64 = req.file.buffer.toString('base64');
      const url = `data:${req.file.mimetype};base64,${b64}`;
      res.json({ success: true, url });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Auth
  app.post('/api/auth/login', async (req, res) => {
    let { phone, password, email } = req.body;
    try {
      const query = email 
        ? 'SELECT * FROM users WHERE email = $1 AND password = $2' 
        : 'SELECT * FROM users WHERE phone = $1 AND password = $2';
      const values = email ? [email, password] : [phone, password];
      const dbRes = await pool.query(query, values);
      
      if (dbRes.rows.length > 0) {
        const user = dbRes.rows[0];
        res.json({
          success: true,
          user: {
            id: user.id,
            phone: user.phone,
            email: user.email,
            role: user.role,
            first_name: user.first_name,
            last_name: user.last_name
          }
        });
      } else {
        res.status(401).json({ success: false, message: 'Identifiants incorrects' });
      }
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.post('/api/auth/register', async (req, res) => {
    const { email, phone, password, first_name, last_name, address, city, postal_code } = req.body;
    try {
      const dbRes = await pool.query(
        'INSERT INTO users (email, phone, password, role, first_name, last_name, address, city, postal_code) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
        [email, phone, password, 'user', first_name, last_name, address, city, postal_code]
      );
      res.json({ success: true, user: dbRes.rows[0] });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Shop Data
  app.get('/api/categories', async (req, res) => {
    try {
      const dbRes = await pool.query('SELECT * FROM categories');
      res.json(dbRes.rows);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/products', async (req, res) => {
    try {
      const { category } = req.query;
      let query = `
        SELECT p.*, c.name as category_name, c.slug as category_slug 
        FROM products p 
        LEFT JOIN categories c ON p.category_id = c.id
      `;
      let values: any[] = [];
      if (category) {
        query += ' WHERE c.slug = $1';
        values = [category];
      }
      const dbRes = await pool.query(query, values);
      res.json(dbRes.rows);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/products/:id', async (req, res) => {
    try {
      const productRes = await pool.query(
        'SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = $1',
        [req.params.id]
      );
      if (productRes.rows.length === 0) return res.status(404).json({ error: 'Not found' });

      const variantsRes = await pool.query('SELECT * FROM variants WHERE product_id = $1', [req.params.id]);
      res.json({
        ...productRes.rows[0],
        variants: variantsRes.rows
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/history', async (req, res) => {
    try {
      const dbRes = await pool.query('SELECT * FROM history_posts ORDER BY created_at DESC');
      res.json(dbRes.rows);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/settings', async (req, res) => {
    try {
      const dbRes = await pool.query('SELECT * FROM settings');
      const settingsObj = dbRes.rows.reduce((acc: any, item: any) => {
        acc[item.key] = item.value;
        return acc;
      }, {});
      res.json(settingsObj);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Admin
  app.post('/api/admin/products', async (req, res) => {
    const { name, slug, description, price, category_id, image_url } = req.body;
    try {
      const dbRes = await pool.query(
        'INSERT INTO products (name, slug, description, price, category_id, image_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
        [name, slug, description, parseFloat(price), parseInt(category_id), image_url]
      );
      res.json({ success: true, id: dbRes.rows[0].id });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.put('/api/admin/settings', async (req, res) => {
    const settings = req.body;
    try {
      for (const [key, value] of Object.entries(settings)) {
        await pool.query(
          'INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2',
          [key, String(value)]
        );
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.post('/api/admin/history', async (req, res) => {
    const { title, content, image_url, bg_image_url } = req.body;
    try {
      const dbRes = await pool.query(
        'INSERT INTO history_posts (title, content, image_url, bg_image_url) VALUES ($1, $2, $3, $4) RETURNING id',
        [title, content, image_url, bg_image_url]
      );
      res.json({ success: true, id: dbRes.rows[0].id });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.put('/api/admin/history/:id', async (req, res) => {
    const { title, content, image_url, bg_image_url } = req.body;
    try {
      await pool.query(
        'UPDATE history_posts SET title = $1, content = $2, image_url = $3, bg_image_url = $4 WHERE id = $5',
        [title, content, image_url, bg_image_url, req.params.id]
      );
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.delete('/api/admin/history/:id', async (req, res) => {
    try {
      await pool.query('DELETE FROM history_posts WHERE id = $1', [req.params.id]);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.get('/api/admin/orders', async (req, res) => {
    try {
      const dbRes = await pool.query(`
        SELECT o.*, u.first_name, u.last_name, u.email 
        FROM orders o 
        JOIN users u ON o.user_id = u.id 
        ORDER BY o.created_at DESC
      `);
      res.json(dbRes.rows);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/orders', async (req, res) => {
    const { user_id, total_amount, shipping_address, shipping_city, shipping_postal_code, items } = req.body;
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const orderRes = await client.query(
        'INSERT INTO orders (user_id, total_amount, shipping_address, shipping_city, shipping_postal_code, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
        [user_id, total_amount, shipping_address, shipping_city, shipping_postal_code, 'pending']
      );
      const orderId = orderRes.rows[0].id;
      
      for (const item of items) {
        await client.query(
          'INSERT INTO order_items (order_id, product_id, quantity, price, size, color) VALUES ($1, $2, $3, $4, $5, $6)',
          [orderId, item.id, item.quantity, item.price, item.size || null, item.color || null]
        );
      }
      await client.query('COMMIT');
      res.json({ success: true, orderId });
    } catch (error: any) {
      await client.query('ROLLBACK');
      res.status(500).json({ success: false, error: error.message });
    } finally {
      client.release();
    }
  });

  // Static files and Vite
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (req, res) => res.sendFile(path.join(distPath, 'index.html')));
    }
  }

  app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT} (Neon/Postgres mode)`));
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
