import pkg from 'pg';
const { Pool } = pkg;
import fs from 'fs';

const connectionString = "postgresql://neondb_owner:npg_K8YXBEDZd4NJ@ep-dawn-unit-apjo53d2-pooler.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require";

const pool = new Pool({ 
  connectionString,
  ssl: { rejectUnauthorized: false } 
});

async function updateAboutImage() {
  try {
    const imgPath = "C:/Users/PC/.gemini/antigravity/brain/d0117ea7-91c2-45d0-9fad-c93e160b9dbd/media__1778409690646.jpg";
    const base64 = fs.readFileSync(imgPath, { encoding: 'base64' });
    const dataUrl = `data:image/jpeg;base64,${base64}`;

    await pool.query(
      "INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value",
      ['about_image_url', dataUrl]
    );

    console.log("Image de l'Emir Abdelkader injectée avec succès !");
  } catch (err: any) {
    console.error("Erreur :", err.message);
  } finally {
    await pool.end();
  }
}

updateAboutImage();
