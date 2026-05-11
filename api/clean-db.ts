import pkg from 'pg';
const { Pool } = pkg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

export default async function (req: any, res: any) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Wipe everything I seeded
    await client.query('DELETE FROM variants');
    await client.query('DELETE FROM order_items');
    await client.query('DELETE FROM products');
    await client.query('DELETE FROM history_posts');
    await client.query('DELETE FROM settings');
    
    // We leave categories alone or clear them too? The user needs them to add products.
    // I'll leave the 4 base categories (Adulte, Enfant, Bébé, Accessoire)
    
    await client.query('COMMIT');
    res.json({ success: true, message: 'Database cleaned of all fake seed data!' });
  } catch (e: any) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: e.message });
  } finally {
    client.release();
  }
}
