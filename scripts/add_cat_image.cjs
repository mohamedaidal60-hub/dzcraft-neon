const { Client } = require('pg');
const connectionString = 'postgresql://neondb_owner:npg_yDrIU7dQFo0j@ep-divine-bar-amzxxz08-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

async function update() {
  const client = new Client({ connectionString });
  try {
    await client.connect();
    await client.query('ALTER TABLE categories ADD COLUMN IF NOT EXISTS image_url TEXT');
    console.log('Categories updated.');
  } finally {
    await client.end();
  }
}
update();
