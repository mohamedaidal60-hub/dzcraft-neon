import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useStore } from '../store';
import { ShoppingBag, ChevronLeft, Check, ChevronDown } from 'lucide-react';

export default function Product() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [added, setAdded] = useState(false);
  const addToCart = useStore(state => state.addToCart);

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Product not found');
        return res.json();
      })
      .then(data => {
        setProduct(data);
        setLoading(false);
        if (data.variants && data.variants.length > 0) {
          const initialVariants: Record<string, string> = {};
          const types = [...new Set(data.variants.map((v: any) => v.type))];
          types.forEach((type: any) => {
            const firstVal = data.variants.find((v: any) => v.type === type)?.value;
            if (firstVal) initialVariants[type] = firstVal;
          });
          setSelectedVariants(initialVariants);
        }
      })
      .catch(() => {
        navigate('/collection/adulte');
      });
  }, [id, navigate]);

  const handleAddToCart = () => {
    if (!product) return;
    
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      variant_details: selectedVariants,
      image_url: product.image_url
    });
    
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid md:grid-cols-2 gap-16">
        <div className="aspect-[3/4] bg-stone-200 rounded-3xl animate-pulse"></div>
        <div className="space-y-8 py-8">
          <div className="h-10 bg-stone-200 rounded w-3/4 animate-pulse"></div>
          <div className="h-6 bg-stone-200 rounded w-1/4 animate-pulse"></div>
          <div className="h-32 bg-stone-200 rounded w-full animate-pulse"></div>
          <div className="h-16 bg-stone-200 rounded w-full animate-pulse"></div>
        </div>
      </div>
    );
  }

  const variantGroups = product.variants ? product.variants.reduce((acc: any, v: any) => {
    if (!acc[v.type]) acc[v.type] = [];
    acc[v.type].push(v.value);
    return acc;
  }, {}) : {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-24">
      <button onClick={() => navigate(-1)} className="flex items-center text-stone-500 hover:text-stone-900 mb-8 transition-colors">
        <ChevronLeft className="w-5 h-5 mr-1" /> Retour
      </button>
      
      <div className="grid md:grid-cols-2 gap-16 items-start">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="aspect-[3/4] bg-stone-100 rounded-3xl overflow-hidden sticky top-24"
        >
          <img 
            src={product.image_url || 'https://picsum.photos/seed/dz/800/1200'} 
            alt={product.name} 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="py-8"
        >
          <div className="mb-2 text-sm font-medium text-stone-500 uppercase tracking-widest">
            {product.category_name}
          </div>
          <h1 className="text-4xl md:text-5xl font-serif mb-4">{product.name}</h1>
          <div className="text-2xl font-medium mb-8">{Number(product.price).toFixed(2)} €</div>
          
          <div className="prose prose-stone mb-12 text-stone-600">
            <p>{product.description}</p>
          </div>

          {Object.entries(variantGroups).map(([type, values]: [string, any]) => (
            <div key={type} className="mb-8">
              <label className="block text-sm font-medium text-stone-700 mb-3">
                Choisir {type}
              </label>
              <div className="relative">
                <select
                  value={selectedVariants[type]}
                  onChange={(e) => setSelectedVariants(prev => ({ ...prev, [type]: e.target.value }))}
                  className="w-full pl-4 pr-10 py-4 bg-white border border-stone-200 rounded-2xl appearance-none focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent transition-all cursor-pointer"
                >
                  {values.map((val: string) => (
                    <option key={val} value={val}>{val}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <ChevronDown className="w-5 h-5 text-stone-400" />
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={handleAddToCart}
            disabled={added}
            className={`w-full py-5 rounded-2xl font-semibold text-lg flex items-center justify-center gap-3 transition-all transform active:scale-[0.98] ${
              added 
                ? 'bg-emerald-500 text-white' 
                : 'bg-stone-900 text-white hover:bg-stone-800 shadow-xl hover:shadow-2xl'
            }`}
          >
            {added ? (
              <>
                <Check className="w-6 h-6" /> Ajouté au panier
              </>
            ) : (
              <>
                <ShoppingBag className="w-6 h-6" /> Ajouter au panier
              </>
            )}
          </button>



          <div className="mt-12 pt-8 border-t border-stone-200 grid grid-cols-2 gap-8 text-sm text-stone-500">
            <div>
              <span className="block font-medium text-stone-900 mb-1">Livraison</span>
              Expédition sous 48h. Livraison gratuite dès 100€ d'achat.
            </div>
            <div>
              <span className="block font-medium text-stone-900 mb-1">Retours</span>
              Retours gratuits sous 30 jours.
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
