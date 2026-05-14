import express from 'express';
import pkg from 'pg';
// import { emailService } from './email';

const { Pool } = pkg;

let pool: any;
function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    });
  }
  return pool;
}

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.get('/api/debug-env', (req, res) => {
  res.json({
    hasDbUrl: !!process.env.DATABASE_URL,
    dbUrlPrefix: process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 15) : 'none',
    nodeEnv: process.env.NODE_ENV
  });
});

app.get('/api/health', async (req, res) => {
  try {
    const client = await getPool().connect();
    const result = await client.query('SELECT NOW()');
    res.json({ status: 'ok', database: 'neon', time: result.rows[0] });
    client.release();
  } catch (err: any) {
    res.status(500).json({ status: 'error', message: 'DB connection failed', detail: err.message });
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
    const result = await getPool().query(query, params);
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
    const result = await getPool().query(
      'INSERT INTO users (email, phone, password, role, first_name, last_name, address, city, postal_code) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
      [email, phone, password, 'user', first_name, last_name, address, city, postal_code]
    );
    const user = result.rows[0];
    
    // Send Welcome Email
    // await emailService.sendWelcomeEmail(email, `${first_name} ${last_name}`);
    
    res.json({ success: true, user });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/categories', async (req, res) => {
  try {
    const result = await getPool().query('SELECT * FROM categories');
    res.json(result.rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/products', async (req, res) => {
  try {
    const { category, target_group } = req.query;
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
      query += ` AND c.slug = ANY($${params.length})`;
    }
    
    if (target_group) {
      const tgtArray = (target_group as string).split(',');
      params.push(tgtArray);
      query += ` AND p.target_group && $${params.length}`;
    }

    const result = await getPool().query(query, params);
    res.json(result.rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const productResult = await getPool().query(
      'SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = $1',
      [req.params.id]
    );
    const product = productResult.rows[0];
    if (!product) return res.status(404).json({ error: 'Produit non trouvé' });

    const variantsResult = await getPool().query('SELECT * FROM variants WHERE product_id = $1', [req.params.id]);
    res.json({ ...product, variants: variantsResult.rows });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/history', async (req, res) => {
  try {
    const result = await getPool().query('SELECT * FROM history_posts ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/settings', async (req, res) => {
  try {
    const result = await getPool().query('SELECT * FROM settings');
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
    const result = await getPool().query(
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
  const { name } = req.body;
  const description = `Découvrez notre magnifique ${name}, une pièce unique célébrant l'héritage riche et vibrant de la culture algérienne. Conçu avec passion par DZCRAFTDESIGN, ce produit allie tradition artisanale et élégance moderne, parfait pour offrir ou pour exprimer votre identité avec fierté et style.`;
  res.json({ success: true, description });
});

app.get('/api/admin/products', async (req, res) => {
  try {
    const result = await getPool().query('SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id ORDER BY p.created_at DESC');
    res.json(result.rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/products', async (req, res) => {
  const { name, slug, description, price, category_id, image_url, target_group } = req.body;
  try {
    const result = await getPool().query(
      'INSERT INTO products (name, slug, description, price, category_id, image_url, target_group) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      [name, slug, description, parseFloat(price), category_id, image_url, target_group]
    );
    res.json({ success: true, id: result.rows[0].id });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/admin/products/:id', async (req, res) => {
  const { name, slug, description, price, category_id, image_url, target_group } = req.body;
  try {
    await getPool().query(
      'UPDATE products SET name = $1, slug = $2, description = $3, price = $4, category_id = $5, image_url = $6, target_group = $7 WHERE id = $8',
      [name, slug, description, parseFloat(price), category_id, image_url, target_group, req.params.id]
    );
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/admin/products/:id', async (req, res) => {
  try {
    // Delete variants first
    await getPool().query('DELETE FROM variants WHERE product_id = $1', [req.params.id]);
    await getPool().query('DELETE FROM products WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/admin/clients', async (req, res) => {
  try {
    const result = await getPool().query('SELECT * FROM users WHERE role = \'user\' ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/admin/settings', async (req, res) => {
  const settings = req.body;
  try {
    for (const [key, value] of Object.entries(settings)) {
      await getPool().query(
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
    const result = await getPool().query(
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
    await getPool().query('DELETE FROM history_posts WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Orders
app.post('/api/orders', async (req, res) => {
  const { user_id, total_amount, shipping_address, shipping_city, shipping_postal_code, items } = req.body;
  try {
    const orderResult = await getPool().query(
      'INSERT INTO orders (user_id, total_amount, shipping_address, shipping_city, shipping_postal_code, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      [user_id, total_amount, shipping_address, shipping_city, shipping_postal_code, 'pending']
    );
    const orderId = orderResult.rows[0].id;
    
    // Get user details for email
    const userResult = await getPool().query('SELECT * FROM users WHERE id = $1', [user_id]);
    const user = userResult.rows[0];
    
    // if (user && user.email) {
    //   await emailService.sendOrderConfirmation(user.email, {
    //     name: `${user.first_name} ${user.last_name}`,
    //     orderId: orderId,
    //     total: total_amount,
    //     items: items
    //   });
    // }
    
    for (const item of items) {
      await getPool().query(
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
    const result = await getPool().query(`
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

app.post('/api/admin/orders/:id/tracking', async (req, res) => {
  const { tracking_number, carrier } = req.body;
  const orderId = req.params.id;
  
  try {
    // Update order status and tracking
    await getPool().query(
      'UPDATE orders SET tracking_number = $1, carrier = $2, status = $3 WHERE id = $4',
      [tracking_number, carrier, 'shipped', orderId]
    );
    
    // Get order and user details for email
    const result = await getPool().query(`
      SELECT o.*, u.first_name, u.last_name, u.email 
      FROM orders o 
      JOIN users u ON o.user_id = u.id 
      WHERE o.id = $1
    `, [orderId]);
    
    const order = result.rows[0];
    // if (order && order.email) {
    //   await emailService.sendTrackingEmail(order.email, {
    //     name: `${order.first_name} ${order.last_name}`,
    //     orderId: orderId,
    //     trackingNumber: tracking_number,
    //     carrier: carrier
    //   });
    // }
    
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default app;
