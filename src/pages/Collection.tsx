import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Filter, ChevronDown, Check, X, ArrowRight } from 'lucide-react';

// Filters removed as per user request to simplify and focus on Europe/Product categories


export default function Collection() {
  const { category } = useParams<{ category: string }>();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [filters, setFilters] = useState({});

  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    params.append('category', category || '');
    
    // Filters removed to focus on category only


    fetch(`/api/products?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setProducts(data);
        } else {
          setProducts([]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching products:', err);
        setProducts([]);
        setLoading(false);
      });
  }, [category, filters]);

  const toggleFilter = () => {}; // Disabled

  const categoryTitles: Record<string, string> = {
    adulte: 'Collection Adulte',
    participant: 'Participants',
    enfant: 'Collection Enfant',
    bebe: 'Collection Bébé',
    accessoire: 'Accessoires',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <h1 className="text-4xl md:text-5xl font-serif mb-4 capitalize">
          {categoryTitles[category || ''] || 'Collection'}
        </h1>
        <p className="text-stone-500 text-lg max-w-2xl">
          Découvrez nos créations exclusives inspirées de la culture algérienne.
        </p>
      </motion.div>

      {/* Filter Bar Removed */}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[3/4] bg-stone-200 rounded-2xl mb-4"></div>
              <div className="h-5 bg-stone-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-stone-200 rounded w-1/2 mb-2"></div>
              <div className="h-5 bg-stone-200 rounded w-1/4"></div>
            </div>
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product: any, idx: number) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.05 }}
            >
              <Link to={`/product/${product.id}`} className="group block">
                <div className="aspect-[3/4] bg-stone-100 rounded-2xl overflow-hidden mb-4 relative shadow-sm group-hover:shadow-xl transition-all duration-500">
                  <img 
                    src={product.image_url || 'https://picsum.photos/seed/dz/400/600'} 
                    alt={product.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500" />
                  <div className="absolute bottom-4 left-4 right-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                    <div className="bg-white/90 backdrop-blur text-stone-900 text-center py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest">
                      Voir le produit
                    </div>
                  </div>
                </div>
                <h3 className="font-medium text-lg group-hover:text-emerald-700 transition-colors">{product.name}</h3>
                <p className="text-stone-500 text-sm mb-2">{product.category_name}</p>
                <p className="font-medium text-lg">{parseFloat(product.price).toFixed(2)} €</p>
              </Link>
            </motion.div>
          ))}
        </div>
      ) : category === 'adulte' ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl mx-auto"
        >
          <div className="bg-white p-4 rounded-[2.5rem] shadow-xl border border-stone-100 overflow-hidden">
            <img 
              src="/coming-soon-adulte.jpg" 
              alt="Coming Soon Adulte" 
              className="w-full h-auto rounded-[2rem]"
            />
          </div>
          <div className="text-center mt-8">
            <p className="text-stone-500 italic">"Sbor chouiya... Je vous prépare haja le top !"</p>
          </div>
        </motion.div>
      ) : (
        <div className="text-center py-24 px-6 bg-white rounded-[3rem] border border-stone-100 shadow-sm max-w-2xl mx-auto">
          <h3 className="text-2xl font-serif text-stone-900 mb-4">Aucun produit</h3>
          <p className="text-stone-600 text-lg mb-8 leading-relaxed">
            Aucun produit ne correspond à vos critères pour le moment.
          </p>
        </div>
      )}
    </div>
  );
}
