const { Client } = require('pg');

const connectionString = 'postgresql://neondb_owner:npg_yDrIU7dQFo0j@ep-divine-bar-amzxxz08-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const client = new Client({
  connectionString,
});

async function run() {
  await client.connect();
  console.log("Connected");
  
  const res = await client.query('DELETE FROM products WHERE name ILIKE $1', ['%robe%']);
  console.log('Deleted robes:', res.rowCount);

  const res2 = await client.query('DELETE FROM products WHERE name ILIKE $1', ['%kabyle%']);
  console.log('Deleted kabyle:', res2.rowCount);

  // Or maybe just show all products to see if it's there
  const res3 = await client.query('SELECT id, name FROM products');
  console.log('Remaining products:', res3.rows);

  await client.end();
}
run();
