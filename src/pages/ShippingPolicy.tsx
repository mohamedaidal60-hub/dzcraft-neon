import React from 'react';
import { motion } from 'motion/react';
import { Truck, MapPin, ShieldCheck } from 'lucide-react';

export default function ShippingPolicy() {
  return (
    <div className="min-h-screen bg-stone-50 py-24 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-stone-100"
      >
        <h1 className="text-4xl font-serif mb-8 text-stone-900 border-b border-stone-100 pb-4">Politique de Livraison</h1>
        
        <div className="prose prose-stone max-w-none space-y-12 text-stone-700 leading-relaxed">
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-2xl font-serif text-stone-900 mb-4 flex items-center gap-2">
                <Truck className="w-6 h-6 text-emerald-600" /> Livraison à Domicile
              </h2>
              <p>Nous livrons dans les 58 wilayas d'Algérie directement à votre porte.</p>
              <ul className="list-disc pl-6 mt-4 space-y-2 text-sm">
                <li><strong>Alger</strong> : 24h à 48h</li>
                <li><strong>Grandes villes</strong> : 2 à 4 jours</li>
                <li><strong>Zones reculées</strong> : 5 à 7 jours</li>
              </ul>
            </div>
            <div className="bg-stone-50 p-6 rounded-2xl border border-stone-100">
              <h3 className="font-bold text-stone-900 mb-2">Tarifs Algérie</h3>
              <p className="text-sm">Les frais varient selon la wilaya et sont affichés lors de la validation du panier. Le paiement s'effectue à la livraison.</p>
            </div>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center pt-8 border-t border-stone-100">
            <div>
              <h2 className="text-2xl font-serif text-stone-900 mb-4 flex items-center gap-2">
                <MapPin className="w-6 h-6 text-blue-600" /> Points Relais (Mondial Relay)
              </h2>
              <p>Pour nos clients en France et en Europe, nous utilisons le réseau Mondial Relay.</p>
              <ul className="list-disc pl-6 mt-4 space-y-2 text-sm">
                <li>Plus de 12 000 points de retrait en France.</li>
                <li>Délai moyen de 3 à 6 jours ouvrés.</li>
                <li>Suivi en temps réel de votre colis.</li>
              </ul>
            </div>
            <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
              <h3 className="font-bold text-blue-900 mb-2">Comment ça marche ?</h3>
              <p className="text-sm text-blue-800">Choisissez l'option "Point Relais" lors du checkout, sélectionnez votre point sur la carte, et récupérez votre colis avec une pièce d'identité.</p>
            </div>
          </section>

          <section className="bg-emerald-50 p-8 rounded-3xl border border-emerald-100 mt-12 text-center">
            <ShieldCheck className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
            <h3 className="text-xl font-serif text-emerald-900 mb-2">Emballage Éco-responsable</h3>
            <p className="text-sm text-emerald-800 max-w-lg mx-auto">
              Chez DZCRAFTDESIGN, nous valorisons l'industrie locale. Votre commande est emballée dans des boîtes conçues et produites en Algérie, limitant notre empreinte carbone.
            </p>
          </section>
        </div>
      </motion.div>
    </div>
  );
}
