import React from 'react';
import { motion } from 'motion/react';
import { useStore } from '../store';

export default function About() {
  const settings = useStore(state => state.settings);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
      <div className="grid md:grid-cols-2 gap-16 items-center">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="text-sm font-medium text-stone-500 uppercase tracking-widest mb-4">
            Qui suis-je
          </div>
          <h1 className="text-4xl md:text-5xl font-serif mb-8 leading-tight">
            L'histoire derrière DZCRAFTDESIGN
          </h1>
          <div className="prose prose-stone text-stone-600 text-lg leading-relaxed space-y-6 whitespace-pre-line">
            {settings.about_text || 'Chargement...'}
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative"
        >
          <div className="aspect-[4/5] bg-stone-100 rounded-3xl overflow-hidden shadow-2xl">
            <img 
              src={settings.about_image_url || "https://picsum.photos/seed/dz_about/800/1000"} 
              alt="Portrait" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="absolute -bottom-8 -left-8 bg-white p-8 rounded-2xl shadow-xl max-w-xs hidden md:block">
            <p className="font-serif text-xl italic text-stone-800">
              "Valoriser le savoir-faire algérien à travers chaque création."
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
