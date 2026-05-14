const { Client } = require('pg');
const conn1 = 'postgresql://neondb_owner:npg_yDrIU7dQFo0j@ep-divine-bar-amzxxz08-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const conn2 = 'postgresql://neondb_owner:npg_q3YQ2djLxNAa@ep-muddy-dust-apiv5coj.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require';

async function check() {
  console.log('--- DB 1 (Divine Bar) ---');
  const c1 = new Client({ connectionString: conn1 });
  try {
    await c1.connect();
    const p = await c1.query('SELECT count(*) FROM products');
    const h = await c1.query('SELECT count(*) FROM history_posts');
    console.log('Products:', p.rows[0].count);
    console.log('History:', h.rows[0].count);
  } catch (e) { console.log('Error DB1:', e.message); }
  finally { await c1.end(); }

  console.log('\n--- DB 2 (Muddy Dust) ---');
  const c2 = new Client({ connectionString: conn2 });
  try {
    await c2.connect();
    const tables = await c2.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    console.log('Tables:', tables.rows.map(r => r.table_name).join(', '));
    if (tables.rows.some(r => r.table_name === 'products')) {
      const p = await c2.query('SELECT count(*) FROM products');
      console.log('Products:', p.rows[0].count);
    }
  } catch (e) { console.log('Error DB2:', e.message); }
  finally { await c2.end(); }
}
check();
