import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function addProducts() {
  try {
    const client = await pool.connect();
    
    // 1. Body Bébé
    const bodyRes = await client.query(
      'INSERT INTO products (name, slug, description, price, category_id, image_url, target_group) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      [
        'Body Bébé Personnalisé', 
        'body-bebe-personnalise', 
        'Offrez à votre bébé un body unique avec une touche d\'humour et de fierté algérienne. 100% coton, doux et confortable.', 
        19.90, 
        3, 
        '/images/bb3.jpg', 
        ['Bébé']
      ]
    );
    const bodyId = bodyRes.rows[0].id;
    
    const bodyOptions = ['Mon père', 'Ma mère', 'Ma tata', 'Mon tonton', 'Ma grand mère'];
    for (const option of bodyOptions) {
      await client.query(
        'INSERT INTO variants (product_id, type, value) VALUES ($1, $2, $3)',
        [bodyId, 'Texte', option]
      );
    }
    
    const bodySizes = ['0-3 mois', '3-6 mois', '6-12 mois', '12-18 mois'];
    for (const size of bodySizes) {
      await client.query(
        'INSERT INTO variants (product_id, type, value) VALUES ($1, $2, $3)',
        [bodyId, 'Taille', size]
      );
    }

    // 2. Mug Wilaya
    const mugRes = await client.query(
      'INSERT INTO products (name, slug, description, price, category_id, image_url, target_group) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      [
        'Mug Wilaya Personnalisé', 
        'mug-wilaya-personnalise', 
        'Le mug parfait pour votre café du matin, affichant fièrement votre wilaya d\'origine. Design moderne et épuré.', 
        15.90, 
        4, 
        '/images/mug_wilaya_1.jpg', 
        ['Accessoire']
      ]
    );
    const mugId = mugRes.rows[0].id;
    
    const wilayas = [
      '01 - Adrar', '02 - Chlef', '03 - Laghouat', '04 - Oum El Bouaghi', '05 - Batna', '06 - Béjaïa', '07 - Biskra', '08 - Béchar', '09 - Blida', '10 - Bouira',
      '11 - Tamanrasset', '12 - Tébessa', '13 - Tlemcen', '14 - Tiaret', '15 - Tizi Ouzou', '16 - Alger', '17 - Djelfa', '18 - Jijel', '19 - Sétif', '20 - Saïda',
      '21 - Skikda', '22 - Sidi Bel Abbès', '23 - Annaba', '24 - Guelma', '25 - Constantine', '26 - Médéa', '27 - Mostaganem', '28 - M\'Sila', '29 - Mascara', '30 - Ouargla',
      '31 - Oran', '32 - El Bayadh', '33 - Illizi', '34 - Bordj Bou Arreridj', '35 - Boumerdès', '36 - El Tarf', '37 - Tindouf', '38 - Tissemsilt', '39 - El Oued', '40 - Khenchela',
      '41 - Souk Ahras', '42 - Tipaza', '43 - Mila', '44 - Aïn Defla', '45 - Naâma', '46 - Aïn Témouchent', '47 - Ghardaïa', '48 - Relizane', '49 - El M\'Ghair', '50 - El Meniaa',
      '51 - Ouled Djellal', '52 - Bordj Baji Mokhtar', '53 - Béni Abbès', '54 - Timimoun', '55 - Touggourt', '56 - Djanet', '57 - In Salah', '58 - In Guezzam'
    ];
    for (const wilaya of wilayas) {
      await client.query(
        'INSERT INTO variants (product_id, type, value) VALUES ($1, $2, $3)',
        [mugId, 'Wilaya', wilaya]
      );
    }

    // 3. Protège Passeport
    await client.query(
      'INSERT INTO products (name, slug, description, price, category_id, image_url, target_group) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [
        'Protège Passeport Alger', 
        'protege-passeport-alger', 
        'Voyagez avec style grâce à ce protège-passeport élégant. Une pièce unique pour les amoureux d\'Alger.', 
        9.90, 
        4, 
        '/images/p_passeport.jpg', 
        ['Accessoire']
      ]
    );

    console.log('Products added successfully!');
    client.release();
    process.exit(0);
  } catch (err) {
    console.error('Error adding products:', err);
    process.exit(1);
  }
}

addProducts();
