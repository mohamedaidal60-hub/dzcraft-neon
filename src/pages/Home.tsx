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
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-stone-900">
          <img 
            src="https://picsum.photos/seed/algeria/1920/1080" 
            alt="Hero background" 
            className="w-full h-full object-cover opacity-50 mix-blend-overlay"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl font-serif mb-6 tracking-tight"
          >
            L'Élégance Algérienne
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg md:text-xl font-light mb-10 text-stone-200"
          >
            Découvrez nos collections exclusives fabriquées en Algérie. Un savoir-faire unique, une histoire à porter.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to="/collection/adulte" className="px-8 py-4 bg-white text-stone-900 font-medium rounded-full hover:bg-stone-100 transition-colors">
              Collection Adulte
            </Link>
            <Link to="/collection/enfant" className="px-8 py-4 bg-transparent border border-white text-white font-medium rounded-full hover:bg-white/10 transition-colors">
              Collection Enfant
            </Link>
          </motion.div>
        </div>
      </section>

      <CustomizationSection />

      {/* Story Teaser */}
      <section className="bg-stone-900 text-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl font-serif mb-6">Notre Histoire, Votre Style</h2>
            <p className="text-stone-400 text-lg mb-8 leading-relaxed">
              DZCRAFTDESIGN est né d'une passion pour le patrimoine algérien. Chaque pièce est pensée et fabriquée en Algérie, valorisant le secteur du textile, de l'imprimerie et de l'emballage local.
            </p>
            <Link to="/qui-suis-je" className="inline-flex items-center font-medium hover:text-emerald-400 transition-colors">
              Découvrir notre histoire <span className="ml-2">&rarr;</span>
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <img src="https://picsum.photos/seed/dz1/400/500" alt="Atelier" className="rounded-2xl w-full h-full object-cover" referrerPolicy="no-referrer" />
            <img src="https://picsum.photos/seed/dz2/400/500" alt="Textile" className="rounded-2xl w-full h-full object-cover mt-8" referrerPolicy="no-referrer" />
          </div>
        </div>
      </section>
    </div>
  );
}
