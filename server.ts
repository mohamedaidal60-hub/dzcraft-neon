import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Supabase
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase: any = null;
let initError = null;

if (supabaseUrl && supabaseServiceKey) {
  try {
    const cleanUrl = supabaseUrl.trim().replace(/\/$/, '');
    const hostname = new URL(cleanUrl).hostname;
    console.log('--- DEBUG SUPABASE ---');
    console.log('URL complète:', cleanUrl);
    console.log('Hostname extrait:', hostname);
    console.log('----------------------');
    supabase = createClient(cleanUrl, supabaseServiceKey);
    console.log('Supabase client initialized successfully');
  } catch (err: any) {
    initError = err.message;
    console.error('Failed to initialize Supabase:', err.message);
  }
} else {
  console.warn('Supabase credentials missing: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
}

const upload = multer({ storage: multer.memoryStorage() });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      database: 'supabase',
      initialized: !!supabase,
      error: initError,
      config: {
        supabaseUrl: !!supabaseUrl,
        supabaseServiceKey: !!supabaseServiceKey
      }
    });
  });

  // Upload endpoint (using Supabase Storage)
  app.post('/api/upload', upload.single('file'), async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    if (!supabase) {
      return res.status(503).json({ success: false, message: 'Supabase not initialized' });
    }

    try {
      const filename = `${Date.now()}-${req.file.originalname}`;
      const { data, error } = await supabase.storage
        .from('uploads')
        .upload(filename, req.file.buffer, {
          contentType: req.file.mimetype,
          upsert: true
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('uploads')
        .getPublicUrl(filename);

      res.json({ success: true, url: publicUrl });
    } catch (error: any) {
      console.error('Upload error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // API Routes
  app.post('/api/auth/login', async (req, res) => {
    let { phone, password, email } = req.body;

    phone = phone?.trim();
    password = password?.trim();
    email = email?.trim();

    if (!supabase) {
      return res.status(503).json({
        success: false,
        message: 'Base de données non initialisée. Vérifiez vos secrets Supabase.',
        error: initError
      });
    }

    try {
      console.log('Tentative de requête Supabase pour:', { email, phone });
      let query = supabase.from('users').select('*').eq('password', password);

      if (email) {
        query = query.eq('email', email);
      } else {
        query = query.eq('phone', phone);
      }

      const { data, error } = await query.single();

      if (error) {
        console.error('Erreur Supabase lors du login:', error);
        return res.status(401).json({
          success: false,
          message: 'Identifiants incorrects ou erreur de base de données',
          details: error.message
        });
      }

      if (data) {
        console.log('Connexion réussie pour:', data.phone || data.email);
        res.json({
          success: true,
          user: {
            id: data.id,
            phone: data.phone,
            email: data.email,
            role: data.role,
            first_name: data.first_name,
            last_name: data.last_name
          }
        });
      } else {
        console.warn('Échec de connexion: Utilisateur non trouvé');
        res.status(401).json({ success: false, message: 'Identifiants incorrects' });
      }
    } catch (error: any) {
      console.error('Exception lors du login:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.post('/api/auth/register', async (req, res) => {
    const { email, phone, password, first_name, last_name, address, city, postal_code } = req.body;
    try {
      const { data, error } = await supabase.from('users').insert([{
        email, phone, password, role: 'user', first_name, last_name, address, city, postal_code
      }]).select().single();

      if (error) throw error;
      res.json({ success: true, user: data });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.get('/api/categories', async (req, res) => {
    try {
      const { data, error } = await supabase.from('categories').select('*');
      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/products', async (req, res) => {
    try {
      const { category } = req.query;
      let query = supabase.from('products').select(`
        *,
        categories (
          name,
          slug
        )
      `);

      const { data, error } = await query;
      if (error) throw error;

      let products = data.map((p: any) => ({
        ...p,
        category_name: p.categories?.name,
        category_slug: p.categories?.slug
      }));

      if (category) {
        products = products.filter((p: any) => p.category_slug === category);
      }

      res.json(products);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/products/:id', async (req, res) => {
    try {
      const { data: product, error: pError } = await supabase
        .from('products')
        .select(`
          *,
          categories (name)
        `)
        .eq('id', req.params.id)
        .single();

      if (pError) throw pError;

      const { data: variants, error: vError } = await supabase
        .from('variants')
        .select('*')
        .eq('product_id', req.params.id);

      if (vError) throw vError;

      res.json({
        ...product,
        category_name: product.categories?.name,
        variants
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/history', async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('history_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/settings', async (req, res) => {
    try {
      const { data, error } = await supabase.from('settings').select('*');
      if (error) throw error;

      const settingsObj = data.reduce((acc: any, item: any) => {
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
      const { data, error } = await supabase.from('clients').insert([{ name, email, phone }]).select().single();
      if (error) throw error;
      res.json({ success: true, id: data.id });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Admin Routes
  app.post('/api/admin/products', async (req, res) => {
    const { name, slug, description, price, category_id, image_url } = req.body;
    try {
      const { data, error } = await supabase.from('products').insert([{
        name, slug, description, price: parseFloat(price), category_id, image_url
      }]).select().single();

      if (error) throw error;
      res.json({ success: true, id: data.id });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.get('/api/admin/clients', async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put('/api/admin/settings', async (req, res) => {
    const settings = req.body;
    try {
      for (const [key, value] of Object.entries(settings)) {
        const { error } = await supabase
          .from('settings')
          .upsert({ key, value: String(value) });
        if (error) throw error;
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.post('/api/admin/history', async (req, res) => {
    const { title, content, image_url, bg_image_url } = req.body;
    try {
      const { data, error } = await supabase.from('history_posts').insert([{
        title, content, image_url, bg_image_url
      }]).select().single();

      if (error) throw error;
      res.json({ success: true, id: data.id });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.delete('/api/admin/history/:id', async (req, res) => {
    try {
      const { error } = await supabase.from('history_posts').delete().eq('id', req.params.id);
      if (error) throw error;
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Orders
  app.post('/api/orders', async (req, res) => {
    const { user_id, total_amount, shipping_address, shipping_city, shipping_postal_code, items } = req.body;
    try {
      const { data: order, error: oError } = await supabase.from('orders').insert([{
        user_id, total_amount, shipping_address, shipping_city, shipping_postal_code,
        status: 'pending'
      }]).select().single();

      if (oError) throw oError;

      const orderItems = items.map((item: any) => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        price: item.price,
        size: item.size || null,
        color: item.color || null
      }));

      const { error: iError } = await supabase.from('order_items').insert(orderItems);
      if (iError) throw iError;

      res.json({ success: true, orderId: order.id });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.get('/api/admin/orders', async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          users (
            first_name,
            last_name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const orders = data.map((o: any) => ({
        ...o,
        first_name: o.users?.first_name,
        last_name: o.users?.last_name,
        email: o.users?.email
      }));

      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

