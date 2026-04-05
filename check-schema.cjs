const pg = require('pg');
require('dotenv').config();

const client = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

async function run() {
  try {
    const res = await client.query("SELECT id, name, slug FROM categories");
    console.log('Categories:', res.rows);
    const schema = await client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'products'");
    console.log('Product Columns:', schema.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

run();
