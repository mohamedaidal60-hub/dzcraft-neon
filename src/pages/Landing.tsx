import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronDown, Check, MessageCircle, ArrowRight, ShoppingBag } from 'lucide-react';
import { useStore } from '../store';

const SLOGANS = [
  'Je suis...',
  'Je n\'ai peur de rien mon père est...',
  'Je n\'ai peur de rien ma mère est...'
];

const ORIGINS = ['Algérien', 'Kabyle', 'Arabe', 'Chaoui', 'Touareg', 'Mozabite', 'Chenoui', 'Chelhi', 'Sahraoui'];

const WILAYAS = [
  'Adrar', 'Chlef', 'Laghouat', 'Oum El Bouaghi', 'Batna', 'Béjaïa', 'Biskra', 'Béchar', 'Blida', 'Bouira',
  'Tamanrasset', 'Tébessa', 'Tlemcen', 'Tiaret', 'Tizi Ouzou', 'Alger', 'Djelfa', 'Jijel', 'Sétif', 'Saïda',
  'Skikda', 'Sidi Bel Abbès', 'Annaba', 'Guelma', 'Constantine', 'Médéa', 'Mostaganem', 'M\'Sila', 'Mascara', 'Ouargla',
  'Oran', 'El Bayadh', 'Illizi', 'Bordj Bou Arreridj', 'Boumerdès', 'El Tarf', 'Tindouf', 'Tissemsilt', 'El Oued', 'Khenchela',
  'Souk Ahras', 'Tipaza', 'Mila', 'Aïn Defla', 'Naâma', 'Aïn Témouchent', 'Ghardaïa', 'Relizane'
];

export default function Landing() {
  const [slogan, setSlogan] = useState(SLOGANS[1]);
  const [origin, setOrigin] = useState(ORIGINS[0]);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const settings = useStore(state => state.settings);

  const phoneNumber = '33767099115';
  
  const handleOrder = () => {
    const text = slogan.replace('...', '') + ' ' + origin;
    const message = `Bonjour DZCRAFTDESIGN, je souhaite commander un article personnalisé :\n\nTexte : ${text}\n\nMerci de me recontacter pour finaliser la commande.`;
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none overflow-hidden">
         <svg width="400" height="400" viewBox="0 0 100 100" fill="currentColor" className="absolute -top-20 -left-20">
            <path d="M50 10 L30 80 L20 80 L40 10 Z" />
            <path d="M50 10 L70 80 L80 80 L60 10 Z" />
         </svg>
         <svg width="400" height="400" viewBox="0 0 100 100" fill="currentColor" className="absolute -bottom-20 -right-20">
            <path d="M50 10 L30 80 L20 80 L40 10 Z" />
            <path d="M50 10 L70 80 L80 80 L60 10 Z" />
         </svg>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-4xl w-full bg-white rounded-[2.5rem] shadow-2xl overflow-hidden relative z-10 border border-stone-100 flex flex-col md:flex-row"
      >
        <div className="flex-1 p-8 md:p-12 border-b md:border-b-0 md:border-r border-stone-100 bg-stone-50/50">
          <div className="mb-10 text-center md:text-left">
            {settings.logo_url ? (
              <img src={settings.logo_url} alt="Logo" className="h-20 mx-auto md:mx-0 mb-8 object-contain" />
            ) : (
              <h1 className="text-2xl font-serif tracking-widest mb-8">DZCRAFTDESIGN</h1>
            )}
            <h2 className="text-3xl md:text-4xl font-serif text-stone-900 mb-4 leading-tight">
              Le client est roi : <br />
              <span className="text-emerald-600 italic">Vous demandez, nous réalisons.</span>
            </h2>
            <p className="text-stone-500 text-lg">
              Chez DZCRAFTDESIGN, nous n'imposons aucun modèle. Votre article est créé sur mesure selon vos envies et vos racines.
            </p>
          </div>

          <div className="space-y-6">
            {/* Slogan Dropdown */}
            <div className="relative">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-2 ml-1">1. Choisir le format</label>
              <button 
                onClick={() => setActiveDropdown(activeDropdown === 'slogan' ? null : 'slogan')}
                className="w-full flex items-center justify-between px-5 py-4 bg-white border border-stone-200 rounded-2xl text-sm font-medium shadow-sm hover:border-emerald-300 transition-colors"
              >
                {slogan}
                <ChevronDown className={`w-4 h-4 text-stone-400 transition-transform ${activeDropdown === 'slogan' ? 'rotate-180' : ''}`} />
              </button>
              {activeDropdown === 'slogan' && (
                <div className="absolute top-full left-0 mt-2 w-full bg-white rounded-2xl shadow-2xl border border-stone-100 p-2 z-50">
                  {SLOGANS.map(s => (
                    <button 
                      key={s} 
                      onClick={() => { setSlogan(s); setActiveDropdown(null); }}
                      className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm hover:bg-stone-50 transition-colors"
                    >
                      {s}
                      {slogan === s && <Check className="w-4 h-4 text-emerald-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Origin Dropdown */}
            <div className="relative">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-2 ml-1">2. Choisir l'ethnie ou la wilaya</label>
              <button 
                onClick={() => setActiveDropdown(activeDropdown === 'origin' ? null : 'origin')}
                className="w-full flex items-center justify-between px-5 py-4 bg-white border border-stone-200 rounded-2xl text-sm font-medium shadow-sm hover:border-emerald-300 transition-colors"
              >
                {origin}
                <ChevronDown className={`w-4 h-4 text-stone-400 transition-transform ${activeDropdown === 'origin' ? 'rotate-180' : ''}`} />
              </button>
              {activeDropdown === 'origin' && (
                <div className="absolute top-full left-0 mt-2 w-full bg-white rounded-2xl shadow-2xl border border-stone-100 p-2 z-50 max-h-72 overflow-y-auto">
                  <div className="px-4 py-2 text-[10px] font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 rounded-lg mb-2">Ethnies d'Algérie</div>
                  {ORIGINS.map(o => (
                    <button 
                      key={o} 
                      onClick={() => { setOrigin(o); setActiveDropdown(null); }}
                      className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm hover:bg-stone-50 transition-colors"
                    >
                      {o}
                      {origin === o && <Check className="w-4 h-4 text-emerald-600" />}
                    </button>
                  ))}
                  <div className="px-4 py-2 text-[10px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 rounded-lg mt-4 mb-2">Les 58 Wilayas</div>
                  {WILAYAS.map((w, idx) => (
                    <button 
                      key={w} 
                      onClick={() => { setOrigin(w); setActiveDropdown(null); }}
                      className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm hover:bg-stone-50 transition-colors"
                    >
                      <span className="flex items-center">
                        <span className="w-6 text-[10px] font-mono text-stone-400">{(idx + 1).toString().padStart(2, '0')}</span>
                        {w}
                      </span>
                      {origin === w && <Check className="w-4 h-4 text-emerald-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 p-8 md:p-12 flex flex-col justify-center items-center text-center bg-white">
          <div className="w-full max-w-sm">
            <div className="relative mb-8 group">
               <div className="aspect-[4/5] bg-stone-100 rounded-3xl overflow-hidden shadow-inner border border-stone-100 relative">
                  <img 
                    src="/images/bebe_algerien.jpg" 
                    alt="Aperçu" 
                    className="w-full h-full object-cover p-4 opacity-30 mix-blend-multiply" 
                    onError={(e) => {
                      e.currentTarget.src = "https://picsum.photos/seed/dz_preview/400/500";
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center p-8">
                     <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl transform group-hover:scale-105 transition-transform duration-500">
                        <p className="text-xs font-bold text-stone-400 mb-2 uppercase tracking-tighter">Aperçu du texte :</p>
                        <p className="text-2xl md:text-3xl font-serif text-stone-800 leading-tight">
                          {slogan.replace('...', '')} <br />
                          <span className="text-emerald-700 font-bold font-sans uppercase tracking-tight">{origin}</span>
                        </p>
                     </div>
                  </div>
               </div>
            </div>

            <button 
              onClick={handleOrder}
              className="w-full py-5 bg-stone-900 text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-emerald-600 transition-all shadow-xl shadow-stone-900/10 group"
            >
              <MessageCircle className="w-6 h-6" />
              Commander via WhatsApp
            </button>
            <p className="mt-6 text-stone-400 text-xs flex items-center justify-center gap-1">
              <Check className="w-3 h-3" /> Fait main en Algérie • Expédition rapide
            </p>
            
            <div className="mt-10 pt-8 border-t border-stone-50 flex justify-center gap-6">
              <div className="text-center">
                <div className="w-10 h-10 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-2 text-stone-400">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Bodies</span>
              </div>
              <div className="text-center opacity-40">
                <div className="w-10 h-10 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-2 text-stone-400">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Accessoires</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
      
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={() => window.location.href = '/'}
        className="mt-8 text-stone-400 hover:text-stone-600 text-sm font-medium flex items-center gap-2"
      >
        Visiter la boutique classique <ArrowRight className="w-4 h-4" />
      </motion.button>
    </div>
  );
}
