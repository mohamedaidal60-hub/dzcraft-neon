const fs = require('fs'); 
const { Pool } = require('pg'); 
const pool = new Pool({ connectionString: 'postgresql://neondb_owner:npg_yDrIU7dQFo0j@ep-divine-bar-amzxxz08-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require' }); 
async function run() { 
  const p1 = 'data:image/jpeg;base64,' + fs.readFileSync('C:/Users/PC/.gemini/antigravity/scratch/farah2/src/assets/protege-passeport.jpeg').toString('base64'); 
  await pool.query('UPDATE products SET image_url = $1 WHERE id = $2', [p1, '345c4ba1-3f91-4853-8a56-51cd0b7cd2cf']); 
  const p2 = 'data:image/jpeg;base64,' + fs.readFileSync('C:/Users/PC/.gemini/antigravity/scratch/farah2/src/assets/mug-wilaya-2.jpeg').toString('base64'); 
  await pool.query('UPDATE products SET image_url = $1 WHERE id = $2', [p2, '9173418d-1616-47a8-a531-511b4e04c541']); 
  const p3 = 'data:image/jpeg;base64,' + fs.readFileSync('C:/Users/PC/.gemini/antigravity/scratch/farah2/src/assets/body-pere-bebe.jpeg').toString('base64'); 
  await pool.query('UPDATE products SET image_url = $1 WHERE id = $2', [p3, 'd9ddea17-aa9e-4e53-a9bd-9186cb766dac']); 
  console.log('Done!'); 
  pool.end(); 
} 
run();
