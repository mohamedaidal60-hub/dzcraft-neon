import pkg from 'pg';
const { Pool } = pkg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

export default async function (req: any, res: any) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Clear existing
    await client.query('DELETE FROM variants');
    await client.query('DELETE FROM products');
    await client.query('DELETE FROM categories');
    
    // Categories
    await client.query(`
      INSERT INTO categories (id, name, slug) VALUES 
      (1, 'Adulte', 'adulte'),
      (2, 'Enfant', 'enfant'),
      (3, 'Bébé', 'bebe'),
      (4, 'Accessoire', 'accessoire')
      ON CONFLICT (id) DO NOTHING;
    `);

    // Products
    const bodyRes = await client.query(
      'INSERT INTO products (name, slug, description, price, category_id, image_url, target_group) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      ['Body Bébé Personnalisé', 'body-bebe-personnalise', "Offrez à votre bébé un body unique avec une touche d'humour et de fierté algérienne.", 19.90, 3, '/images/bb3.jpg', ['Bébé']]
    );
    const bodyId = bodyRes.rows[0].id;

    const mugRes = await client.query(
      'INSERT INTO products (name, slug, description, price, category_id, image_url, target_group) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      ['Mug Wilaya Personnalisé', 'mug-wilaya-personnalise', "Le mug parfait pour votre café du matin, affichant fièrement votre wilaya d'origine.", 15.90, 4, '/images/mug_wilaya_1.jpg', ['Accessoire']]
    );
    const mugId = mugRes.rows[0].id;

    const passportRes = await client.query(
      'INSERT INTO products (name, slug, description, price, category_id, image_url, target_group) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      ['Protège Passeport Karakou', 'protege-passeport-karakou', "Gardez votre passeport en sécurité avec style. Un design inspiré du Karakou algérien.", 14.90, 4, '/images/passport_karakou.jpg', ['Accessoire']]
    );
    const passportId = passportRes.rows[0].id;

    // Variants for Body
    const bodyOptions = ['Mon père', 'Ma mère', 'Ma tata', 'Mon tonton', 'Ma grand mère'];
    for (const option of bodyOptions) {
      await client.query('INSERT INTO variants (product_id, type, value) VALUES ($1, $2, $3)', [bodyId, 'Texte', option]);
    }
    const bodySizes = ['0-3 mois', '3-6 mois', '6-12 mois', '12-18 mois'];
    for (const size of bodySizes) {
      await client.query('INSERT INTO variants (product_id, type, value) VALUES ($1, $2, $3)', [bodyId, 'Taille', size]);
    }

    // Variants for Mug (Wilayas)
    const wilayas = ["01 Adrar","02 Chlef","03 Laghouat","04 Oum El Bouaghi","05 Batna","06 Béjaïa","07 Biskra","08 Béchar","09 Blida","10 Bouira","11 Tamanrasset","12 Tébessa","13 Tlemcen","14 Tiaret","15 Tizi Ouzou","16 Alger","17 Djelfa","18 Jijel","19 Sétif","20 Saïda","21 Skikda","22 Sidi Bel Abbès","23 Annaba","24 Guelma","25 Constantine","26 Médéa","27 Mostaganem","28 M'Sila","29 Mascara","30 Ouargla","31 Oran","32 El Bayadh","33 Illizi","34 Bordj Bou Arreridj","35 Boumerdès","36 El Tarf","37 Tindouf","38 Tissemsilt","39 El Oued","40 Khenchela","41 Souk Ahras","42 Tipaza","43 Mila","44 Aïn Defla","45 Naâma","46 Aïn Témouchent","47 Ghardaïa","48 Relizane","49 Timimoun","50 Bordj Badji Mokhtar","51 Ouled Djellal","52 Béni Abbès","53 In Salah","54 In Guezzam","55 Touggourt","56 Djanet","57 El M'Ghair","58 El Meniaa"];
    for (const w of wilayas) {
      await client.query('INSERT INTO variants (product_id, type, value) VALUES ($1, $2, $3)', [mugId, 'Wilaya', w]);
    }

    // History Posts (Le saviez-vous)
    await client.query(`
      INSERT INTO history_posts (title, content, image_url) VALUES 
      ('L''Émir Abdelkader', 'Héros national et fondateur de l''État algérien moderne, il a mené la résistance contre l''invasion française pendant plus de 15 ans. Un homme de foi, de culture et d''humanisme.', 'https://images.unsplash.com/photo-1590073242678-70ee3fc28e8e?auto=format&fit=crop&q=80'),
      ('Le Karakou Algérois', 'Vêtement traditionnel algérois d''exception, le Karakou est une veste en velours finement brodée au fil d''or (majboub ou fetla). Il symbolise l''élégance et le savoir-faire ancestral.', 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&q=80'),
      ('L''Héritage des Berbères', 'La culture berbère (Amazigh) est au cœur de l''identité algérienne. Des bijoux en argent de Kabylie aux tapis du M''Zab, chaque motif raconte une légende millénaire.', 'https://images.unsplash.com/photo-1590073242678-70ee3fc28e8e?auto=format&fit=crop&q=80')
    `);

    // Settings
    await client.query(`
      INSERT INTO settings (key, value) VALUES 
      ('hero_title', 'La première boutique de cadeaux des Algériens'),
      ('site_name', 'DZCRAFTDESIGN'),
      ('contact_email', 'contact@dzcd.fr'),
      ('hero_image_url', 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&q=80'),
      ('about_image_url', 'https://images.unsplash.com/photo-1590073242678-70ee3fc28e8e?auto=format&fit=crop&q=80')
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
    `);

    await client.query('COMMIT');
    res.json({ success: true, message: 'Database seeded on live site!' });
  } catch (e: any) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: e.message });
  } finally {
    client.release();
  }
}
