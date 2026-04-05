const pg = require('pg');
require('dotenv').config();

const client = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

async function run() {
  try {
    const cats = await client.query('SELECT id FROM categories LIMIT 1');
    if (cats.rows.length === 0) {
      console.log('No categories available to attach product to.');
      return;
    }
    const category_id = cats.rows[0].id;
    const query = `
      INSERT INTO products (name, slug, description, price, category_id, image_url, ethnicity, wilaya, target_group)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `;
    const values = [
      'Robe Traditionnelle Kabyle',
      'robe-traditionnelle-kabyle',
      'Une magnifique robe kabyle moderne et traditionnelle.',
      12000,
      category_id,
      '/logo.png',
      ['Kabyle'],
      ['Tizi Ouzou'],
      ['Femme']
    ];
    await client.query(query, values);
    console.log('Sample product inserted successfully');
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

run();
