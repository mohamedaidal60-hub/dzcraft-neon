import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';

export default function Collection() {
  const { category } = useParams<{ category: string }>();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/products?category=${category}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setProducts(data);
        } else {
          console.error('Expected array for products, got:', data);
          setProducts([]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching products:', err);
        setProducts([]);
        setLoading(false);
      });
  }, [category]);

  const categoryTitles: Record<string, string> = {
    adulte: 'Collection Adulte',
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
          Découvrez notre sélection exclusive de produits fabriqués en Algérie. 
          Des pièces uniques alliant confort, style et identité.
        </p>
      </motion.div>

      {/* Filters (Mockup for UI) */}
      <div className="flex justify-between items-center mb-8 border-b border-stone-200 pb-4">
        <div className="flex gap-4">
          <select className="bg-transparent border-none text-sm font-medium focus:ring-0 cursor-pointer">
            <option>Taille</option>
            <option>S</option>
            <option>M</option>
            <option>L</option>
            <option>XL</option>
          </select>
          <select className="bg-transparent border-none text-sm font-medium focus:ring-0 cursor-pointer">
            <option>Couleur</option>
            <option>Noir</option>
            <option>Blanc</option>
            <option>Vert</option>
          </select>
        </div>
        <div className="text-sm text-stone-500">
          {products.length} produit{products.length > 1 ? 's' : ''}
        </div>
      </div>

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
          {products.map((product: any) => (
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
          ))}
        </div>
      ) : (
        <div className="text-center py-24 text-stone-500">
          <p className="text-xl mb-4">Aucun produit trouvé dans cette collection.</p>
          <Link to="/" className="text-emerald-600 hover:underline">Retour à l'accueil</Link>
        </div>
      )}
    </div>
  );
}
