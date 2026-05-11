import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { useStore } from '../store';
import { Filter, ChevronDown, Check, X, MessageCircle } from 'lucide-react';
import CustomizationSection from '../components/CustomizationSection';

const TARGET_GROUPS = ['Adulte', 'Enfant', 'Bébé', 'Accessoire'];

export default function Home() {
  const { settings } = useStore();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  
  // Local filters for the UI
  const [filters, setFilters] = useState({
    target_group: [] as string[]
  });

  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams();
    
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

  const toggleFilter = (type: 'target_group', value: string) => {
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
       <section className="relative h-[80vh] flex items-center justify-center overflow-hidden bg-stone-900">
         <div className="absolute inset-0">
           {/* Logo en filigrane discret au centre */}
           {settings.logo_url && (
             <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
               <img 
                 src={settings.logo_url} 
                 alt="Filigrane" 
                 className="w-[600px] h-[600px] object-contain invert grayscale" 
               />
             </div>
           )}
         </div>
         <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
           <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
             className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-sans font-semibold mb-2 tracking-tight uppercase"
           >
             {settings.hero_title || "La première boutique de cadeaux des Algériens"}
           </motion.h1>
           <motion.div
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ delay: 0.3 }}
             className="text-emerald-500 font-medium tracking-widest text-sm mb-6 uppercase"
           >
             Boutique Virtuelle
           </motion.div>
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
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex justify-between items-end mb-12"
        >
          <div>
            <h2 className="text-3xl font-serif mb-2 text-stone-900">Nouveautés</h2>
            <p className="text-stone-500">Découvrez nos créations exclusives</p>
          </div>
          <Link to="/collection/adulte" className="text-sm font-medium hover:text-emerald-700 hidden sm:block group">
            Voir tout <span className="inline-block group-hover:translate-x-1 transition-transform">&rarr;</span>
          </Link>
        </motion.div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuredProducts.length > 0 ? featuredProducts.slice(0, 4).map((product: any, idx: number) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
            >
              <Link to={`/product/${product.id}`} className="group block">
                <div className="aspect-[3/4] bg-stone-100 rounded-2xl overflow-hidden mb-4 relative shadow-sm hover:shadow-xl transition-shadow duration-500">
                  <img 
                    src={product.image_url || 'https://images.unsplash.com/photo-1590073242678-70ee3fc28e8e?auto=format&fit=crop&q=80'} 
                    alt={product.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-stone-900/0 group-hover:bg-stone-900/20 transition-colors duration-500" />
                  <div className="absolute bottom-4 left-4 right-4 translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                    <div className="bg-white/90 backdrop-blur text-stone-900 text-center py-3 rounded-xl text-xs font-bold uppercase tracking-widest">
                      Découvrir
                    </div>
                  </div>
                </div>
                <h3 className="font-medium text-lg group-hover:text-emerald-800 transition-colors">{product.name}</h3>
                <p className="text-stone-500 text-sm mb-2">{product.category_name}</p>
                <p className="font-medium text-emerald-600">{parseFloat(product.price).toFixed(2)} €</p>
              </Link>
            </motion.div>
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
      <section className="bg-stone-900 text-white py-24 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-emerald-600/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <motion.div 
              initial={{ width: 0 }}
              whileInView={{ width: "80px" }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.5 }}
              className="h-1 bg-emerald-500 mb-8"
            />
            <h2 className="text-4xl md:text-5xl font-serif mb-8 uppercase tracking-tight leading-tight">
              NOTRE HISTOIRE, <br/>
              <span className="text-emerald-500 relative inline-block">
                NOTRE IDENTITÉ
                <motion.svg 
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: 1 }}
                  className="absolute -bottom-2 left-0 w-full h-2 text-emerald-500/30" viewBox="0 0 100 10" preserveAspectRatio="none"
                >
                  <path d="M0 5 Q 25 0, 50 5 T 100 5" fill="none" stroke="currentColor" strokeWidth="2" />
                </motion.svg>
              </span>
            </h2>
            <p className="text-stone-400 text-lg mb-10 leading-relaxed max-w-md font-light">
              DZCRAFTDESIGN imagine des créations modernes inspirées de la culture algérienne, entre héritage, identité et mémoire. Chaque pièce est une invitation au voyage.
            </p>
            <Link to="/qui-suis-je" className="group inline-flex items-center gap-3 px-10 py-5 bg-white text-stone-900 rounded-full hover:bg-emerald-500 hover:text-white transition-all duration-500 font-medium">
              Découvrir notre histoire 
              <motion.span 
                animate={{ x: [0, 5, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                &rarr;
              </motion.span>
            </Link>
          </motion.div>
          <div className="grid grid-cols-2 gap-6 relative">
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.2 }}
              className="relative pt-12"
            >
              <div className="absolute inset-0 bg-emerald-600/20 blur-3xl rounded-full scale-75 -z-10" />
              <img 
                src={settings.about_image_url || "https://images.unsplash.com/photo-1590073242678-70ee3fc28e8e?auto=format&fit=crop&q=80"} 
                alt="Histoire 1" 
                className="rounded-[2.5rem] w-full aspect-[3/4] object-cover shadow-2xl border border-white/10" 
                referrerPolicy="no-referrer" 
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: -100 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.4 }}
            >
              <img 
                src={settings.hero_image_url || "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&q=80"} 
                alt="Histoire 2" 
                className="rounded-[2.5rem] w-full aspect-[3/4] object-cover shadow-2xl border border-white/10" 
                referrerPolicy="no-referrer" 
              />
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
