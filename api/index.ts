import express from 'express';
import pkg from 'pg';
import Stripe from 'stripe';

const { Pool } = pkg;

let pool: any;
function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });
  }
  return pool;
}

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// ── Debug ──────────────────────────────────────────────────────────────────────
app.get('/api/debug-env', (req: any, res: any) => {
  res.json({
    hasDbUrl: !!process.env.DATABASE_URL,
    dbUrlPrefix: process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 15) : 'none',
    hasStripe: !!process.env.STRIPE_SECRET_KEY,
    nodeEnv: process.env.NODE_ENV
  });
});

app.get('/api/health', async (req: any, res: any) => {
  try {
    const client = await getPool().connect();
    const result = await client.query('SELECT NOW()');
    res.json({ status: 'ok', database: 'neon', time: result.rows[0] });
    client.release();
  } catch (err: any) {
    res.status(500).json({ status: 'error', message: 'DB connection failed', detail: err.message });
  }
});

// ── Auth ───────────────────────────────────────────────────────────────────────
app.post('/api/auth/login', async (req: any, res: any) => {
  const { phone, password, email } = req.body;
  try {
    let query = 'SELECT * FROM users WHERE password = $1 AND ';
    const params: any[] = [password];
    if (email) { query += 'email = $2'; params.push(email); }
    else { query += 'phone = $2'; params.push(phone); }
    const result = await getPool().query(query, params);
    const user = result.rows[0];
    if (user) res.json({ success: true, user });
    else res.status(401).json({ success: false, message: 'Identifiants incorrects' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/auth/register', async (req: any, res: any) => {
  const { email, phone, password, first_name, last_name, address, city, postal_code } = req.body;
  try {
    const result = await getPool().query(
      'INSERT INTO users (email, phone, password, role, first_name, last_name, address, city, postal_code) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
      [email, phone, password, 'user', first_name, last_name, address, city, postal_code]
    );
    res.json({ success: true, user: result.rows[0] });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ── Products ──────────────────────────────────────────────────────────────────
app.get('/api/categories', async (req: any, res: any) => {
  try {
    const result = await getPool().query('SELECT * FROM categories');
    res.json(result.rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/products', async (req: any, res: any) => {
  try {
    const { category, target_group } = req.query;
    let query = `SELECT p.*, c.name as category_name, c.slug as category_slug FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE 1=1`;
    const params: any[] = [];
    if (category) {
      params.push((category as string).split(','));
      query += ` AND c.slug = ANY($${params.length})`;
    }
    if (target_group) {
      params.push((target_group as string).split(','));
      query += ` AND p.target_group && $${params.length}`;
    }
    const result = await getPool().query(query, params);
    res.json(result.rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/products/:id', async (req: any, res: any) => {
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

// ── History & Settings ────────────────────────────────────────────────────────
app.get('/api/history', async (req: any, res: any) => {
  try {
    const result = await getPool().query('SELECT * FROM history_posts ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/settings', async (req: any, res: any) => {
  try {
    const result = await getPool().query('SELECT * FROM settings');
    const settingsObj = result.rows.reduce((acc: any, item: any) => { acc[item.key] = item.value; return acc; }, {});
    res.json(settingsObj);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/clients', async (req: any, res: any) => {
  const { name, email, phone } = req.body;
  try {
    await getPool().query('CREATE TABLE IF NOT EXISTS clients (id SERIAL PRIMARY KEY, name TEXT, email TEXT, phone TEXT, created_at TIMESTAMPTZ DEFAULT NOW())');
    const result = await getPool().query(
      'INSERT INTO clients (name, email, phone) VALUES ($1, $2, $3) RETURNING id',
      [name, email, phone]
    );
    res.json({ success: true, id: result.rows[0].id });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ── Orders ────────────────────────────────────────────────────────────────────
app.post('/api/orders', async (req: any, res: any) => {
  const { user_id, total_amount, shipping_address, shipping_city, shipping_postal_code, shipping_country, delivery_method, relay_id, items } = req.body;
  try {
    // Auto-create tables if they don't exist
    await getPool().query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        total_amount NUMERIC,
        shipping_address TEXT,
        shipping_city TEXT,
        shipping_postal_code TEXT,
        shipping_country TEXT DEFAULT 'FR',
        delivery_method TEXT DEFAULT 'relay',
        relay_id TEXT,
        status TEXT DEFAULT 'pending',
        stripe_session_id TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    await getPool().query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER,
        product_id INTEGER,
        quantity INTEGER,
        price NUMERIC,
        size TEXT,
        color TEXT
      )
    `);

    const orderResult = await getPool().query(
      `INSERT INTO orders (user_id, total_amount, shipping_address, shipping_city, shipping_postal_code, shipping_country, delivery_method, relay_id, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
      [user_id || null, total_amount, shipping_address, shipping_city, shipping_postal_code, shipping_country || 'FR', delivery_method || 'relay', relay_id || null, 'pending']
    );
    const orderId = orderResult.rows[0].id;

    if (items && items.length > 0) {
      for (const item of items) {
        await getPool().query(
          'INSERT INTO order_items (order_id, product_id, quantity, price, size, color) VALUES ($1, $2, $3, $4, $5, $6)',
          [orderId, item.id || null, item.quantity, item.price, item.size || null, item.color || null]
        );
      }
    }
    res.json({ success: true, orderId });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ── Stripe Checkout ───────────────────────────────────────────────────────────
app.post('/api/create-checkout-session', async (req: any, res: any) => {
  const { items, email, orderId } = req.body;
  if (!items || items.length === 0) return res.status(400).json({ error: 'Panier vide' });

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' as any });

    const parsePrice = (p: any): number => {
      if (typeof p === 'number') return p;
      if (typeof p === 'string') return parseFloat(p.replace(',', '.')) || 0;
      return 0;
    };

    const lineItems: any[] = items.map((item: any) => ({
      price_data: {
        currency: 'eur',
        product_data: {
          name: item.name,
          description: [item.size ? `Taille: ${item.size}` : '', item.color ? `Couleur: ${item.color}` : ''].filter(Boolean).join(' · ') || undefined,
        },
        unit_amount: Math.round(parsePrice(item.price) * 100),
      },
      quantity: item.quantity,
    }));

    lineItems.push({
      price_data: {
        currency: 'eur',
        product_data: { name: 'Livraison Point Relais Mondial Relay' },
        unit_amount: 499,
      },
      quantity: 1,
    });

    const baseUrl = 'https://dz-farah-backup.vercel.app';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      customer_email: email || undefined,
      success_url: `${baseUrl}/checkout?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/checkout`,
      metadata: { order_id: String(orderId || '') },
    });

    res.status(200).json({ url: session.url });
  } catch (error: any) {
    console.error('Stripe error:', error);
    res.status(500).json({ error: error.message || 'Erreur Stripe interne' });
  }
});

// ── Admin ─────────────────────────────────────────────────────────────────────
app.post('/api/admin/ai-generate', (req: any, res: any) => {
  const { name } = req.body;
  const description = `Découvrez notre magnifique ${name}, une pièce unique célébrant l'héritage riche et vibrant de la culture algérienne.`;
  res.json({ success: true, description });
});

app.get('/api/admin/products', async (req: any, res: any) => {
  try {
    const result = await getPool().query('SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id ORDER BY p.created_at DESC');
    res.json(result.rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/products', async (req: any, res: any) => {
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

app.put('/api/admin/products/:id', async (req: any, res: any) => {
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

app.delete('/api/admin/products/:id', async (req: any, res: any) => {
  try {
    await getPool().query('DELETE FROM variants WHERE product_id = $1', [req.params.id]);
    await getPool().query('DELETE FROM products WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/admin/clients', async (req: any, res: any) => {
  try {
    const result = await getPool().query("SELECT * FROM users WHERE role = 'user' ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/admin/settings', async (req: any, res: any) => {
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

app.post('/api/admin/history', async (req: any, res: any) => {
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

app.delete('/api/admin/history/:id', async (req: any, res: any) => {
  try {
    await getPool().query('DELETE FROM history_posts WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/admin/orders', async (req: any, res: any) => {
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

app.post('/api/admin/orders/:id/tracking', async (req: any, res: any) => {
  const { tracking_number, carrier } = req.body;
  const orderId = req.params.id;
  try {
    await getPool().query(
      'UPDATE orders SET tracking_number = $1, carrier = $2, status = $3 WHERE id = $4',
      [tracking_number, carrier, 'shipped', orderId]
    );
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default app;