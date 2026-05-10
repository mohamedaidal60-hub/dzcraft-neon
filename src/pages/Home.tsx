import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { useStore } from '../store';
import { Filter, ChevronDown, Check, X, MessageCircle } from 'lucide-react';
import CustomizationSection from '../components/CustomizationSection';

const ETHNICITIES = ['Arabe', 'Kabyle', 'Chaoui', 'Touareg', 'Mozabite', 'Chenoui', 'Chelhi', 'Sahraoui'];
const TARGET_GROUPS = ['Adulte', 'Enfant', 'Bébé', 'Accessoire'];
const WILAYAS = [
  '01 - Adrar', '02 - Chlef', '03 - Laghouat', '04 - Oum El Bouaghi', '05 - Batna', '06 - Béjaïa', '07 - Biskra', '08 - Béchar', '09 - Blida', '10 - Bouira',
  '11 - Tamanrasset', '12 - Tébessa', '13 - Tlemcen', '14 - Tiaret', '15 - Tizi Ouzou', '16 - Alger', '17 - Djelfa', '18 - Jijel', '19 - Sétif', '20 - Saïda',
  '21 - Skikda', '22 - Sidi Bel Abbès', '23 - Annaba', '24 - Guelma', '25 - Constantine', '26 - Médéa', '27 - Mostaganem', '28 - M\'Sila', '29 - Mascara', '30 - Ouargla',
  '31 - Oran', '32 - El Bayadh', '33 - Illizi', '34 - Bordj Bou Arreridj', '35 - Boumerdès', '36 - El Tarf', '37 - Tindouf', '38 - Tissemsilt', '39 - El Oued', '40 - Khenchela',
  '41 - Souk Ahras', '42 - Tipaza', '43 - Mila', '44 - Aïn Defla', '45 - Naâma', '46 - Aïn Témouchent', '47 - Ghardaïa', '48 - Relizane'
];

export default function Home() {
  const { settings } = useStore();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  
  // Local filters for the UI
  const [filters, setFilters] = useState({
    ethnicity: [] as string[],
    wilaya: [] as string[],
    target_group: [] as string[]
  });

  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams();
    
    if (filters.ethnicity.length > 0) params.append('ethnicity', filters.ethnicity.join(','));
    if (filters.wilaya.length > 0) params.append('wilaya', filters.wilaya.join(','));
    if (filters.target_group.length > 0) params.append('target_group', filters.target_group.join(','));
    
    fetch(`/api/products?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setFeaturedProducts(data); 
        } else {
          setFeaturedProducts([]);
        }
      })
      .catch(err => {
        console.error('Error fetching products:', err);
        setFeaturedProducts([]);
      });
  }, [filters]);

  const toggleFilter = (type: 'ethnicity' | 'wilaya' | 'target_group', value: string) => {
    setFilters(prev => ({
      ...prev,
      [type]: prev[type].includes(value) 
        ? prev[type].filter(v => v !== value) 
        : [...prev[type], value]
    }));
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
       <section className="relative h-[95vh] flex items-center justify-center overflow-hidden">
         <div className="absolute inset-0 bg-stone-900">
           <img 
             src={settings.hero_image_url || "https://images.unsplash.com/photo-1512412023212-f09990aa80c8?auto=format&fit=crop&q=80"} 
             alt="Algerian Tradition" 
             className="w-full h-full object-cover opacity-60 object-center"
             referrerPolicy="no-referrer"
           />
          {/* Logo en filigrane dynamique */}
          <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
            <img 
              src={settings.logo_url} 
              alt="Watermark" 
              className="w-[500px] h-[500px] object-contain grayscale brightness-0 invert" 
            />
          </div>
        </div>
        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-3xl md:text-5xl lg:text-6xl font-sans font-semibold mb-6 tracking-tight uppercase"
          >
            LA PREMIÈRE BOUTIQUE CADEAU DES ALGÉRIENS
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg md:text-xl font-light mb-10 text-stone-200"
          >
            Des créations inspirées de notre culture et de nos traditions.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center flex-wrap"
          >
            <Link to="/collection/adulte" className="px-8 py-4 bg-white text-stone-900 font-medium rounded-full hover:bg-stone-100 transition-colors">
              Collection Adulte
            </Link>
            <Link to="/collection/enfant" className="px-8 py-4 bg-transparent border border-white text-white font-medium rounded-full hover:bg-white/10 transition-colors">
              Collection Enfant
            </Link>
            <Link to="/collection/accessoire" className="px-8 py-4 bg-transparent border border-white text-white font-medium rounded-full hover:bg-white/10 transition-colors">
              Accessoires
            </Link>
          </motion.div>
        </div>
      </section>



      {/* Featured Products */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-serif mb-2 text-stone-900">Nouveautés</h2>
            <p className="text-stone-500">Découvrez nos créations exclusives</p>
          </div>
          <Link to="/collection/adulte" className="text-sm font-medium hover:text-emerald-700 hidden sm:block">
            Voir tout &rarr;
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuredProducts.length > 0 ? featuredProducts.slice(0, 4).map((product: any) => (
            <Link key={product.id} to={`/product/${product.id}`} className="group">
              <div className="aspect-[3/4] bg-stone-100 rounded-2xl overflow-hidden mb-4 relative">
                <img 
                  src={product.image_url || 'https://images.unsplash.com/photo-1590073242678-70ee3fc28e8e?auto=format&fit=crop&q=80'} 
                  alt={product.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
              </div>
              <h3 className="font-medium text-lg">{product.name}</h3>
              <p className="text-stone-500 text-sm mb-2">{product.category_name}</p>
              <p className="font-medium">{parseFloat(product.price).toFixed(2)} €</p>
            </Link>
          )) : (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] bg-stone-200 rounded-2xl mb-4"></div>
                <div className="h-5 bg-stone-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-stone-200 rounded w-1/2 mb-2"></div>
                <div className="h-5 bg-stone-200 rounded w-1/4"></div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Story Teaser */}
      <section className="bg-stone-900 text-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl font-serif mb-6 uppercase">NOTRE HISTOIRE, NOTRE IDENTITÉ</h2>
            <p className="text-stone-400 text-lg mb-8 leading-relaxed">
              DZCRAFTDESIGN imagine des créations modernes inspirées de la culture algérienne, entre héritage, identité et mémoire.
            </p>
            <Link to="/qui-suis-je" className="inline-flex items-center font-medium hover:text-emerald-400 transition-colors">
              Découvrir notre histoire <span className="ml-2">&rarr;</span>
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <img src="https://images.unsplash.com/photo-1590073242678-70ee3fc28e8e?auto=format&fit=crop&q=80" alt="Atelier" className="rounded-2xl w-full h-full object-cover" referrerPolicy="no-referrer" />
            <img src="https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&q=80" alt="Textile" className="rounded-2xl w-full h-full object-cover mt-8" referrerPolicy="no-referrer" />
          </div>
        </div>
      </section>
    </div>
  );
}
