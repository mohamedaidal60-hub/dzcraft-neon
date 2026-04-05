import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Filter, ChevronDown, Check, X, ArrowRight } from 'lucide-react';

const ETHNICITIES = ['Arabe', 'Kabyle', 'Chaoui', 'Touareg', 'Mozabite', 'Chenoui', 'Chelhi', 'Sahraoui'];
const WILAYAS = [
  '01 - Adrar', '02 - Chlef', '03 - Laghouat', '04 - Oum El Bouaghi', '05 - Batna', '06 - Béjaïa', '07 - Biskra', '08 - Béchar', '09 - Blida', '10 - Bouira',
  '11 - Tamanrasset', '12 - Tébessa', '13 - Tlemcen', '14 - Tiaret', '15 - Tizi Ouzou', '16 - Alger', '17 - Djelfa', '18 - Jijel', '19 - Sétif', '20 - Saïda',
  '21 - Skikda', '22 - Sidi Bel Abbès', '23 - Annaba', '24 - Guelma', '25 - Constantine', '26 - Médéa', '27 - Mostaganem', '28 - M\'Sila', '29 - Mascara', '30 - Ouargla',
  '31 - Oran', '32 - El Bayadh', '33 - Illizi', '34 - Bordj Bou Arreridj', '35 - Boumerdès', '36 - El Tarf', '37 - Tindouf', '38 - Tissemsilt', '39 - El Oued', '40 - Khenchela',
  '41 - Souk Ahras', '42 - Tipaza', '43 - Mila', '44 - Aïn Defla', '45 - Naâma', '46 - Aïn Témouchent', '47 - Ghardaïa', '48 - Relizane'
];

export default function Collection() {
  const { category } = useParams<{ category: string }>();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [filters, setFilters] = useState({
    ethnicity: [] as string[],
    wilaya: [] as string[]
  });

  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    params.append('category', category || '');
    
    if (filters.ethnicity.length > 0) params.append('ethnicity', filters.ethnicity.join(','));
    if (filters.wilaya.length > 0) params.append('wilaya', filters.wilaya.join(','));

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

  const toggleFilter = (type: 'ethnicity' | 'wilaya', value: string) => {
    setFilters(prev => ({
      ...prev,
      [type]: prev[type].includes(value) 
        ? prev[type].filter(v => v !== value) 
        : [...prev[type], value]
    }));
  };

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
          Filtrer par ethnie ou wilaya pour trouver les pièces qui vous correspondent.
        </p>
      </motion.div>

      {/* Filter Bar */}
      <div className="flex flex-wrap gap-4 items-center bg-white p-2 rounded-2xl shadow-sm border border-stone-100 mb-12 relative z-20">
        <div className="flex items-center px-4 py-2 text-stone-400 border-r border-stone-100 mr-2">
          <Filter className="w-4 h-4 mr-2" />
          <span className="text-sm font-medium">Filtrer par :</span>
        </div>

        {/* Ethnie Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setActiveDropdown(activeDropdown === 'eth' ? null : 'eth')}
            className={`flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-colors ${filters.ethnicity.length > 0 ? 'bg-emerald-50 text-emerald-700' : 'hover:bg-stone-50 text-stone-700'}`}
          >
            Ethnie {filters.ethnicity.length > 0 && `(${filters.ethnicity.length})`}
            <ChevronDown className={`ml-2 w-4 h-4 transition-transform ${activeDropdown === 'eth' ? 'rotate-180' : ''}`} />
          </button>
          {activeDropdown === 'eth' && (
            <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-stone-100 p-2 grid grid-cols-1 gap-1 z-50">
              {ETHNICITIES.map(eth => (
                <button 
                  key={eth} 
                  onClick={() => toggleFilter('ethnicity', eth)}
                  className="flex items-center justify-between px-3 py-2 rounded-lg text-sm hover:bg-stone-50 transition-colors"
                >
                  {eth}
                  {filters.ethnicity.includes(eth) && <Check className="w-4 h-4 text-emerald-600" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Wilaya Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setActiveDropdown(activeDropdown === 'wil' ? null : 'wil')}
            className={`flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-colors ${filters.wilaya.length > 0 ? 'bg-blue-50 text-blue-700' : 'hover:bg-stone-50 text-stone-700'}`}
          >
            Wilaya {filters.wilaya.length > 0 && `(${filters.wilaya.length})`}
            <ChevronDown className={`ml-2 w-4 h-4 transition-transform ${activeDropdown === 'wil' ? 'rotate-180' : ''}`} />
          </button>
          {activeDropdown === 'wil' && (
            <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-stone-100 p-2 max-h-80 overflow-y-auto z-50">
              <div className="grid grid-cols-1 gap-1">
                {WILAYAS.map(w => (
                  <button 
                    key={w} 
                    onClick={() => toggleFilter('wilaya', w)}
                    className="flex items-center justify-between px-3 py-2 rounded-lg text-sm hover:bg-stone-50 transition-colors text-left"
                  >
                    {w}
                    {filters.wilaya.includes(w) && <Check className="w-4 h-4 text-blue-600" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {(filters.ethnicity.length > 0 || filters.wilaya.length > 0) && (
          <button 
            onClick={() => setFilters({ ethnicity: [], wilaya: [] })}
            className="ml-auto text-sm text-red-500 hover:text-red-600 flex items-center font-medium px-4"
          >
            <X className="w-4 h-4 mr-1" /> Réinitialiser
          </button>
        )}
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
              <p className="font-medium">{parseFloat(product.price).toFixed(2)} €</p>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 px-6 bg-white rounded-[3rem] border border-stone-100 shadow-sm max-w-2xl mx-auto">
          <h3 className="text-2xl font-serif text-stone-900 mb-4">Le client est roi</h3>
          <p className="text-stone-600 text-lg mb-8 leading-relaxed">
            Nous n'imposons aucune collection figée. Chez DZCRAFTDESIGN, nous travaillons selon vos demandes et vos racines.
          </p>
          <Link to="/bienvenue" className="inline-flex items-center gap-2 px-8 py-4 bg-stone-900 text-white rounded-full font-medium hover:bg-emerald-600 transition-all">
            Commander mon modèle personnalisé <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
