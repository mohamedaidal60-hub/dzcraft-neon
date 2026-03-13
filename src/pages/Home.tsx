import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { useStore } from '../store';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const userSelections = useStore(state => state.userSelections);

  useEffect(() => {
    const params = new URLSearchParams();
    if (userSelections) {
      if (userSelections.ethnicity) params.append('ethnicity', userSelections.ethnicity);
      if (userSelections.wilaya) params.append('wilaya', userSelections.wilaya);
      if (userSelections.target_group) params.append('target_group', userSelections.target_group);
    }

    fetch(`/api/products?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setFeaturedProducts(data.slice(0, 8)); // Show more since they are filtered
        } else {
          console.error('Expected array for products, got:', data);
          setFeaturedProducts([]);
        }
      })
      .catch(err => {
        console.error('Error fetching products:', err);
        setFeaturedProducts([]);
      });
  }, [userSelections]);

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

      {/* Featured Products */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-serif mb-2">Nouveautés</h2>
            <p className="text-stone-500">Les dernières créations DZCRAFTDESIGN</p>
          </div>
          <Link to="/collection/adulte" className="text-sm font-medium hover:text-emerald-700 hidden sm:block">
            Voir tout &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuredProducts.length > 0 ? featuredProducts.map((product: any) => (
            <Link key={product.id} to={`/product/${product.id}`} className="group">
              <div className="aspect-[3/4] bg-stone-100 rounded-2xl overflow-hidden mb-4 relative">
                <img 
                  src={product.image_url || 'https://picsum.photos/seed/dz/400/600'} 
                  alt={product.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
              </div>
              <h3 className="font-medium text-lg">{product.name}</h3>
              <p className="text-stone-500 text-sm mb-2">{product.category_name}</p>
              <p className="font-medium">{product.price.toFixed(2)} €</p>
            </Link>
          )) : (
            // Skeleton loading
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
