import React from 'react';
import { motion } from 'motion/react';
import { Truck, MapPin, ShieldCheck, CreditCard } from 'lucide-react';

export default function ShippingPolicy() {
  return (
    <div className="min-h-screen bg-stone-50 py-24 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-stone-100"
      >
        <h1 className="text-4xl font-serif mb-8 text-stone-900 border-b border-stone-100 pb-4">Politique de Livraison & Paiement</h1>
        
        <div className="prose prose-stone max-w-none space-y-12 text-stone-700 leading-relaxed">
          
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-2xl font-serif text-stone-900 mb-4 flex items-center gap-2">
                <MapPin className="w-6 h-6 text-emerald-600" /> Livraison en Europe
              </h2>
              <p>Nous livrons partout en Europe via les meilleurs réseaux de transport.</p>
              <ul className="list-disc pl-6 mt-4 space-y-2 text-sm">
                <li><strong>France & Belgique</strong> : 3 à 5 jours ouvrés via Mondial Relay ou Domicile.</li>
                <li><strong>Reste de l'Europe</strong> : 5 à 8 jours ouvrés selon la destination.</li>
                <li><strong>Suivi</strong> : Un numéro de suivi vous est communiqué dès l'expédition.</li>
              </ul>
            </div>
            <div className="bg-stone-50 p-6 rounded-2xl border border-stone-100">
              <h3 className="font-bold text-stone-900 mb-2">Modes de livraison</h3>
              <p className="text-sm">Nous proposons la livraison en Point Relais (Mondial Relay) ou directement à votre domicile via Lettre Suivie ou Colis privé.</p>
            </div>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center pt-8 border-t border-stone-100">
            <div>
              <h2 className="text-2xl font-serif text-stone-900 mb-4 flex items-center gap-2">
                <CreditCard className="w-6 h-6 text-stone-700" /> Paiement à la Commande
              </h2>
              <p>Conformément aux standards du commerce en ligne, toutes les commandes sont payables au moment de la validation.</p>
              <ul className="list-disc pl-6 mt-4 space-y-2 text-sm">
                <li>Paiement 100% sécurisé.</li>
                <li>Validation immédiate de votre commande.</li>
                <li>Expédition prioritaire après réception du paiement.</li>
              </ul>
            </div>
            <div className="bg-stone-900 text-white p-6 rounded-2xl shadow-xl">
              <h3 className="font-bold mb-2">Pourquoi payer à la commande ?</h3>
              <p className="text-sm text-stone-300">Cela nous permet de lancer immédiatement la préparation de votre pièce unique et de vous garantir les meilleurs délais de livraison.</p>
            </div>
          </section>

          <div className="bg-emerald-50 p-8 rounded-3xl border border-emerald-100 mt-12 text-center">
            <Truck className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
            <h3 className="text-xl font-serif text-emerald-900 mb-2">Un détail qui fait la différence</h3>
            <p className="text-sm text-emerald-800 max-w-lg mx-auto">
              Créé par une Algérienne pour les Algériens.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
