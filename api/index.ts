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

import Stripe from 'stripe';
app.post('/api/create-checkout-session', async (req, res) => {
  const { items, email, orderId } = req.body;

  if (!items || items.length === 0) return res.status(400).json({ error: 'Panier vide' });

  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY!;
    const stripe = new Stripe(stripeSecretKey, { apiVersion: '2023-10-16' as any });

    const parsePrice = (p: any) => {
      if (typeof p === 'number') return p;
      if (typeof p === 'string') return parseFloat(p.replace(',', '.')) || 0;
      return 0;
    };

    const lineItems = items.map((item: any) => ({
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
        product_data: {
          name: 'Livraison Point Relais',
        },
        unit_amount: 499,
      },
      quantity: 1,
    });

    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'https://dz-farah-backup.vercel.app';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      customer_email: email || undefined,
      success_url: `${baseUrl}/checkout?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/checkout`,
      metadata: { order_id: orderId || '' },
    });

    res.status(200).json({ url: session.url });
  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    res.status(500).json({ error: error.message || 'Erreur interne' });
  }
});

export default app;
i m p o r t   S t r i p e   f r o m   ' s t r i p e ' ;  
 a p p . p o s t ( ' / a p i / c r e a t e - c h e c k o u t - s e s s i o n ' ,   a s y n c   ( r e q ,   r e s )   = >   {   c o n s t   s t r i p e   =   n e w   S t r i p e ( p r o c e s s . e n v . S T R I P E _ S E C R E T _ K E Y ! ,   {   a p i V e r s i o n :   ' 2 0 2 3 - 1 0 - 1 6 '   a s   a n y   } ) ;   t r y   {   c o n s t   {   i t e m s ,   e m a i l ,   o r d e r I d   }   =   r e q . b o d y ;   c o n s t   l i n e I t e m s   =   i t e m s . m a p ( ( i t e m :   a n y )   = >   ( {   p r i c e _ d a t a :   {   c u r r e n c y :   ' e u r ' ,   p r o d u c t _ d a t a :   {   n a m e :   i t e m . n a m e   } ,   u n i t _ a m o u n t :   M a t h . r o u n d ( ( t y p e o f   i t e m . p r i c e   = = =   ' n u m b e r '   ?   i t e m . p r i c e   :   p a r s e F l o a t ( i t e m . p r i c e . t o S t r i n g ( ) . r e p l a c e ( ' , ' ,   ' . ' ) ) )   *   1 0 0 )   } ,   q u a n t i t y :   i t e m . q u a n t i t y   } ) ) ;   l i n e I t e m s . p u s h ( {   p r i c e _ d a t a :   {   c u r r e n c y :   ' e u r ' ,   p r o d u c t _ d a t a :   {   n a m e :   ' L i v r a i s o n   P o i n t   R e l a i s '   } ,   u n i t _ a m o u n t :   4 9 9   } ,   q u a n t i t y :   1   } ) ;   c o n s t   s e s s i o n   =   a w a i t   s t r i p e . c h e c k o u t . s e s s i o n s . c r e a t e ( {   p a y m e n t _ m e t h o d _ t y p e s :   [ ' c a r d ' ] ,   l i n e _ i t e m s :   l i n e I t e m s ,   m o d e :   ' p a y m e n t ' ,   s u c c e s s _ u r l :   ' h t t p s : / / d z - f a r a h - b a c k u p . v e r c e l . a p p / c h e c k o u t ? s u c c e s s = t r u e ' ,   c a n c e l _ u r l :   ' h t t p s : / / d z - f a r a h - b a c k u p . v e r c e l . a p p / c h e c k o u t '   } ) ;   r e s . j s o n ( {   u r l :   s e s s i o n . u r l   } ) ;   }   c a t c h   ( e r r o r :   a n y )   {   r e s . s t a t u s ( 5 0 0 ) . j s o n ( {   e r r o r :   e r r o r . m e s s a g e   } ) ;   }   } ) ;  
 