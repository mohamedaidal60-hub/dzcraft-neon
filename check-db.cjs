const pg = require('pg');
require('dotenv').config();

const client = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

async function run() {
  try {
    const res = await client.query('SELECT name, slug FROM categories');
    console.log('Categories:', JSON.stringify(res.rows, null, 2));
    const prodRes = await client.query('SELECT name FROM products');
    console.log('Products:', JSON.stringify(prodRes.rows, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

run();
