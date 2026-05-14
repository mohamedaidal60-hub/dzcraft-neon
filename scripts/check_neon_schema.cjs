const { Client } = require('pg');
const connectionString = 'postgresql://neondb_owner:npg_yDrIU7dQFo0j@ep-divine-bar-amzxxz08-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

async function checkSchema() {
  const client = new Client({ connectionString });
  try {
    await client.connect();
    const res = await client.query(`
      SELECT table_name, column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public'
      ORDER BY table_name, ordinal_position
    `);
    const schema = {};
    res.rows.forEach(row => {
      if (!schema[row.table_name]) schema[row.table_name] = [];
      schema[row.table_name].push({ column: row.column_name, type: row.data_type });
    });
    console.log(JSON.stringify(schema, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

checkSchema();
