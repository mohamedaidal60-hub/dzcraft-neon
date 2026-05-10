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
          <div className="prose prose-stone text-stone-600 text-lg leading-relaxed space-y-6">
            <p>Je suis franco-algérienne, née à Marseille… donc presque en Algérie 😉</p>
            <p>Comme beaucoup d’entre nous, j’ai grandi entre deux rives, avec un attachement parfois encore plus fort pour un pays où je ne vivais pas. Mais au fond, on ne lutte pas contre son ADN.</p>
            <p>J’ai eu la chance de recevoir de ma mère une éducation riche en culture et en traditions. Mon père, lui, m’a transmis l’histoire de l’Algérie. Le combat de nos aînés, leur résilience, leur courage, leur profond attachement à leur pays et leur foi en Dieu ont façonné mon caractère et ma manière de voir la vie.</p>
            <p>Toutes ces influences m’ont construite, guidée et accompagnée dans mon parcours, bien au-delà de ce que j’imaginais.</p>
            <p>Tout cela, j’ai commencé à l’exprimer à travers des objets, des vêtements, des créations inspirées de l’Algérie et, petit à petit, c’est devenu une évidence je devais me rapprocher de l’Algérie. Aujourd’hui, je suis fière, avec cette marque, de participer à l’économie algérienne, même si je n’y vis pas « pour l’instant ».</p>
            <p>Aujourd’hui, c’est avec une grande fierté que je peux dire que cette marque est le reflet de mon identité et de mon attachement à l’Algérie. À travers chaque création, je partage avec vous cette histoire, cette identité et cet attachement qui nous animent tous en tant qu’Algériens.</p>
            <p>Mon ambition est simple faire de ce site celui où l’on trouve le cadeau parfait à offrir à un Algérien ou une Algérienne, ou simplement à soi-même.</p>
            <p>Je vous souhaite une excellente visite sur mon site. N’hésitez pas à m’écrire pour me faire part de vos idées, ce sera avec grand plaisir que nous échangerons.</p>
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
