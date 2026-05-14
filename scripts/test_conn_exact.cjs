const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_yDrIU7dQFo0j@ep-divine-bar-amzxxz08-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
});

pool.query('SELECT count(*) FROM products')
  .then(res => {
    console.log('Success! Count:', res.rows[0].count);
    process.exit(0);
  })
  .catch(err => {
    console.error('Connection failed:', err.message);
    process.exit(1);
  });
