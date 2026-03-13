import express from 'express';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const app = express();
app.use(express.json());

// API Routes
app.get('/api/health', async (req, res) => {
  try {
    const client = await pool.connect();
    res.json({ status: 'ok', database: 'neon' });
    client.release();
  } catch (err: any) {
    res.status(500).json({ status: 'error', error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  let { phone, password, email } = req.body;
  try {
    let query = 'SELECT * FROM users WHERE password = $1 AND ';
    let params = [password];
    if (email) {
      query += 'email = $2';
      params.push(email);
    } else {
      query += 'phone = $2';
      params.push(phone);
    }
    const result = await pool.query(query, params);
    const user = result.rows[0];
    if (user) {
      res.json({ success: true, user });
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
    const result = await pool.query(
      'INSERT INTO users (email, phone, password, role, first_name, last_name, address, city, postal_code) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
      [email, phone, password, 'user', first_name, last_name, address, city, postal_code]
    );
    res.json({ success: true, user: result.rows[0] });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/categories', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categories');
    res.json(result.rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/products', async (req, res) => {
  try {
    const { category, ethnicity, wilaya, target_group } = req.query;
    let query = `
      SELECT p.*, c.name as category_name, c.slug as category_slug 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `;
    const params: any[] = [];
    if (category) {
      const catArray = (category as string).split(',');
      params.push(catArray);
      query += ` AND EXISTS (SELECT 1 FROM categories c WHERE c.id = ANY(p.category_ids) AND c.slug = ANY($${params.length}))`;
    }
    
    // Multi-select filters
    if (ethnicity) {
      const ethArray = (ethnicity as string).split(',');
      params.push(ethArray);
      query += ` AND p.ethnicity && $${params.length}`;
    }
    if (wilaya) {
      const wilArray = (wilaya as string).split(',');
      params.push(wilArray);
      query += ` AND p.wilaya && $${params.length}`;
    }
    if (target_group) {
      const tgtArray = (target_group as string).split(',');
      params.push(tgtArray);
      query += ` AND p.target_group && $${params.length}`;
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const productResult = await pool.query(
      'SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = $1',
      [req.params.id]
    );
    const product = productResult.rows[0];
    if (!product) return res.status(404).json({ error: 'Produit non trouvé' });

    const variantsResult = await pool.query('SELECT * FROM variants WHERE product_id = $1', [req.params.id]);
    res.json({ ...product, variants: variantsResult.rows });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/history', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM history_posts ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/settings', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM settings');
    const settingsObj = result.rows.reduce((acc: any, item: any) => {
      acc[item.key] = item.value;
      return acc;
    }, {});
    res.json(settingsObj);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/clients', async (req, res) => {
  const { name, email, phone } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO clients (name, email, phone) VALUES ($1, $2, $3) RETURNING id',
      [name, email, phone]
    );
    res.json({ success: true, id: result.rows[0].id });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Admin Routes
app.post('/api/admin/ai-generate', async (req, res) => {
  const { name, ethnicity, wilaya } = req.body;
  const description = `Découvrez notre magnifique ${name}, une pièce unique célébrant l'héritage riche et vibrant de la culture ${ethnicity} de la wilaya de ${wilaya}. Conçu avec passion par DZCRAFTDESIGN, ce produit allie tradition artisanale et élégance moderne, parfait pour exprimer votre identité algérienne avec fierté et style.`;
  res.json({ success: true, description });
});

app.post('/api/admin/products', async (req, res) => {
  const { name, slug, description, price, category_id, image_url, ethnicity, wilaya, target_group } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO products (name, slug, description, price, category_id, image_url, ethnicity, wilaya, target_group) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id',
      [name, slug, description, parseFloat(price), category_id, image_url, ethnicity, wilaya, target_group]
    );
    res.json({ success: true, id: result.rows[0].id });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/admin/clients', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM clients ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/admin/settings', async (req, res) => {
  const settings = req.body;
  try {
    for (const [key, value] of Object.entries(settings)) {
      await pool.query(
        'INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value',
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
    const result = await pool.query(
      'INSERT INTO history_posts (title, content, image_url, bg_image_url) VALUES ($1, $2, $3, $4) RETURNING id',
      [title, content, image_url, bg_image_url]
    );
    res.json({ success: true, id: result.rows[0].id });
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

// Orders
app.post('/api/orders', async (req, res) => {
  const { user_id, total_amount, shipping_address, shipping_city, shipping_postal_code, items } = req.body;
  try {
    const orderResult = await pool.query(
      'INSERT INTO orders (user_id, total_amount, shipping_address, shipping_city, shipping_postal_code, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      [user_id, total_amount, shipping_address, shipping_city, shipping_postal_code, 'pending']
    );
    const orderId = orderResult.rows[0].id;
    
    for (const item of items) {
      await pool.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price, size, color) VALUES ($1, $2, $3, $4, $5, $6)',
        [orderId, item.id, item.quantity, item.price, item.size || null, item.color || null]
      );
    }
    res.json({ success: true, orderId });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/admin/orders', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT o.*, u.first_name, u.last_name, u.email 
      FROM orders o 
      LEFT JOIN users u ON o.user_id = u.id 
      ORDER BY o.created_at DESC
    `);
    res.json(result.rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default app;
