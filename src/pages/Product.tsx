import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useStore } from '../store';
import { ShoppingBag, ChevronLeft, Check } from 'lucide-react';

export default function Product() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
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
          const sizes = [...new Set(data.variants.map((v: any) => v.size).filter(Boolean))];
          const colors = [...new Set(data.variants.map((v: any) => v.color).filter(Boolean))];
          if (sizes.length > 0) setSelectedSize(sizes[0] as string);
          if (colors.length > 0) setSelectedColor(colors[0] as string);
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
      size: selectedSize || undefined,
      color: selectedColor || undefined,
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

  const sizes = product.variants ? [...new Set(product.variants.map((v: any) => v.size).filter(Boolean))] : [];
  const colors = product.variants ? [...new Set(product.variants.map((v: any) => v.color).filter(Boolean))] : [];

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
          <div className="text-2xl font-medium mb-8">{product.price.toFixed(2)} €</div>
          
          <div className="prose prose-stone mb-12 text-stone-600">
            <p>{product.description}</p>
          </div>

          {sizes.length > 0 && (
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <span className="font-medium">Taille</span>
                <span className="text-sm text-stone-500 underline cursor-pointer hover:text-stone-900">Guide des tailles</span>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {sizes.map((size: any) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`py-3 border rounded-xl font-medium transition-all ${
                      selectedSize === size 
                        ? 'border-stone-900 bg-stone-900 text-white' 
                        : 'border-stone-200 hover:border-stone-900 text-stone-900'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {colors.length > 0 && (
            <div className="mb-12">
              <span className="font-medium block mb-4">Couleur</span>
              <div className="flex gap-3">
                {colors.map((color: any) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-6 py-3 border rounded-xl font-medium transition-all ${
                      selectedColor === color 
                        ? 'border-stone-900 bg-stone-900 text-white' 
                        : 'border-stone-200 hover:border-stone-900 text-stone-900'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            disabled
            className="w-full py-5 rounded-2xl font-medium text-lg flex items-center justify-center transition-all bg-stone-200 text-stone-500 cursor-not-allowed"
          >
            Achat bientôt disponible
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
