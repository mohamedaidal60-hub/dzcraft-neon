const { Client } = require('pg');
const connectionString = 'postgresql://neondb_owner:npg_yDrIU7dQFo0j@ep-divine-bar-amzxxz08-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

async function check() {
  const client = new Client({ connectionString });
  try {
    await client.connect();
    const res = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'categories'");
    console.log('Categories columns:', res.rows.map(r => r.column_name));
    
    const res2 = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'products'");
    console.log('Products columns:', res2.rows.map(r => r.column_name));
  } finally {
    await client.end();
  }
}
check();
