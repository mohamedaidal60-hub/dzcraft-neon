const { Client } = require('pg');
const connectionString = 'postgresql://neondb_owner:npg_yDrIU7dQFo0j@ep-divine-bar-amzxxz08-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

async function checkSettingsTable() {
  const client = new Client({ connectionString });
  try {
    await client.connect();
    
    console.log('--- Columns ---');
    const cols = await client.query("SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'settings'");
    console.log(cols.rows);

    console.log('--- Constraints ---');
    const consts = await client.query(`
      SELECT conname, contype 
      FROM pg_constraint 
      WHERE conrelid = 'settings'::regclass
    `);
    console.log(consts.rows);

    console.log('--- Indexes ---');
    const idxs = await client.query(`
      SELECT indexname, indexdef 
      FROM pg_indexes 
      WHERE tablename = 'settings'
    `);
    console.log(idxs.rows);

  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

checkSettingsTable();
