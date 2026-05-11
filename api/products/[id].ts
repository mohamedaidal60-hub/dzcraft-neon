import pkg from 'pg';
const { Pool } = pkg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

export default async function (req: any, res: any) {
  const { id } = req.query;
  try {
    const productResult = await pool.query(
      'SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = $1',
      [id]
    );
    const product = productResult.rows[0];
    if (!product) return res.status(404).json({ error: 'Produit non trouvé' });

    const variantsResult = await pool.query('SELECT * FROM variants WHERE product_id = $1', [id]);
    res.json({ ...product, variants: variantsResult.rows });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
