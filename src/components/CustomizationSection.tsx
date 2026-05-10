import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronDown, Check, MessageCircle } from 'lucide-react';

const SLOGANS = [
  'Je suis...',
  'Je n\'ai peur de rien mon père est...',
  'Je n\'ai peur de rien ma mère est...'
];

const ORIGINS = ['Algérien', 'Algérienne', 'Kouloughli'];

export default function CustomizationSection() {
  const [slogan, setSlogan] = useState(SLOGANS[1]);
  const [origin, setOrigin] = useState(ORIGINS[0]);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const phoneNumber = '33767099115';
  
  const handleOrder = () => {
    const text = slogan.replace('...', '') + ' ' + origin;
    const message = `Bonjour DZCRAFTDESIGN, je souhaite commander un body personnalisé :\n\nTexte choisi : ${text}\n\nMerci !`;
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="order-2 lg:order-1"
          >
            <div className="text-emerald-600 font-semibold uppercase tracking-widest mb-4">Votre Création, Votre Identité</div>
            <h2 className="text-4xl md:text-5xl font-serif text-stone-900 mb-6 leading-tight">
              Le client est roi : <br />
              <span className="text-stone-500 italic">Vous demandez, nous satisfaisons votre demande.</span>
            </h2>
            <div className="prose prose-stone text-lg text-stone-600 mb-10 leading-relaxed">
              <p>
                Chez DZCRAFTDESIGN, nous croyons en la liberté totale de création. C'est pourquoi nous ne vous imposons <strong>aucun modèle figé</strong>. 
              </p>
              <p>
                Chaque pièce est une réponse directe à votre envie personnelle. Nous n'avons pas de catalogue classique car nous préférons nous adapter à vos besoins, à votre histoire et à vos racines. 
              </p>
              <p className="font-medium text-stone-900 italic">
                C’est pour cela que nous n’avons pas de modèles à mettre dans la galerie : chaque réalisation est unique et appartient à son propriétaire.
              </p>
            </div>

            {/* Simu-Dropdowns */}
            <div className="space-y-6 bg-stone-50 p-8 rounded-3xl border border-stone-100 mb-10">
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="relative">
                  <label className="block text-sm font-medium text-stone-500 mb-2">Choisir le slogan</label>
                  <button 
                    onClick={() => setActiveDropdown(activeDropdown === 'slogan' ? null : 'slogan')}
                    className="w-full flex items-center justify-between px-4 py-3 bg-white border border-stone-200 rounded-xl text-sm font-medium shadow-sm hover:border-emerald-300 transition-colors"
                  >
                    {slogan}
                    <ChevronDown className={`w-4 h-4 transition-transform ${activeDropdown === 'slogan' ? 'rotate-180' : ''}`} />
                  </button>
                  {activeDropdown === 'slogan' && (
                    <div className="absolute top-full left-0 mt-2 w-full bg-white rounded-xl shadow-xl border border-stone-100 p-2 z-30">
                      {SLOGANS.map(s => (
                        <button 
                          key={s} 
                          onClick={() => { setSlogan(s); setActiveDropdown(null); }}
                          className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm hover:bg-stone-50 transition-colors"
                        >
                          {s}
                          {slogan === s && <Check className="w-4 h-4 text-emerald-600" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="relative">
                  <label className="block text-sm font-medium text-stone-500 mb-2">Choisir l'identité</label>
                  <button 
                    onClick={() => setActiveDropdown(activeDropdown === 'origin' ? null : 'origin')}
                    className="w-full flex items-center justify-between px-4 py-3 bg-white border border-stone-200 rounded-xl text-sm font-medium shadow-sm hover:border-emerald-300 transition-colors"
                  >
                    {origin}
                    <ChevronDown className={`w-4 h-4 transition-transform ${activeDropdown === 'origin' ? 'rotate-180' : ''}`} />
                  </button>
                  {activeDropdown === 'origin' && (
                    <div className="absolute top-full left-0 mt-2 w-full bg-white rounded-xl shadow-xl border border-stone-100 p-2 z-30">
                      {ORIGINS.map(o => (
                        <button 
                          key={o} 
                          onClick={() => { setOrigin(o); setActiveDropdown(null); }}
                          className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm hover:bg-stone-50 transition-colors"
                        >
                          {o}
                          {origin === o && <Check className="w-4 h-4 text-emerald-600" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4">
                <div className="bg-white p-6 rounded-2xl border-2 border-dashed border-stone-200 text-center">
                  <span className="text-xl font-serif text-stone-800 italic">
                    "{slogan.replace('...', '')} <span className="text-emerald-600 font-bold font-sans not-italic">{origin}</span>"
                  </span>
                </div>
              </div>

              <button 
                onClick={handleOrder}
                className="w-full py-4 bg-stone-900 text-white rounded-xl font-medium hover:bg-stone-800 transition-all flex items-center justify-center gap-2 group"
              >
                <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Commander mon modèle via WhatsApp
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="order-1 lg:order-2 relative"
          >
            <div className="aspect-[3/4] rounded-[40px] overflow-hidden shadow-3xl bg-stone-100 border-8 border-white">
              <img 
                src="/images/bebe_algerien.jpg" 
                alt="Modèle bébé algérien" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "https://picsum.photos/seed/dz_bb/800/1000";
                }}
              />
            </div>
            {/* Decoration */}
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-emerald-100 rounded-full blur-3xl opacity-60"></div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
