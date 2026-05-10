const pg = require('pg');
const client = new pg.Pool({
  connectionString: 'postgresql://neondb_owner:npg_yDrIU7dQFo0j@ep-divine-bar-amzxxz08-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require',
});

async function run() {
  try {
    const res = await client.query("SELECT email, phone, password FROM users WHERE role = 'admin'");
    console.log('Admin Users:', res.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

run();
