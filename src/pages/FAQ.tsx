import React from 'react';
import { motion } from 'motion/react';
import { HelpCircle, ChevronDown } from 'lucide-react';

const faqs = [
  {
    q: "Où sont fabriqués vos vêtements ?",
    a: "Tous nos vêtements sont fabriqués fièrement en Algérie. Nous travaillons avec des ateliers locaux pour valoriser le savoir-faire national, du textile à la confection."
  },
  {
    q: "Quels sont les délais de livraison ?",
    a: "Pour l'Algérie, comptez entre 2 et 5 jours ouvrés selon votre wilaya. Pour la France via Mondial Relay, le délai est généralement de 3 à 6 jours ouvrés."
  },
  {
    q: "Puis-je essayer les vêtements avant d'acheter ?",
    a: "Absolument ! Utilisez notre 'Cabine d'Essayage Virtuelle' alimentée par l'IA Antigravity pour voir comment le vêtement vous va directement sur votre photo."
  },
  {
    q: "Comment suivre ma commande ?",
    a: "Dès que votre commande est traitée, vous recevez un message de confirmation. Pour les livraisons en point relais, un numéro de suivi Mondial Relay vous sera communiqué."
  },
  {
    q: "Proposez-vous le paiement à la livraison ?",
    a: "Oui, le paiement à la livraison est disponible pour toutes les commandes en Algérie."
  }
];

export default function FAQ() {
  return (
    <div className="min-h-screen bg-stone-50 py-24 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto"
      >
        <div className="text-center mb-16">
          <HelpCircle className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
          <h1 className="text-4xl font-serif text-stone-900">Questions Fréquentes (FAQ)</h1>
          <p className="text-stone-500 mt-4">Tout ce que vous devez savoir sur DZCRAFTDESIGN.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.details 
              key={index}
              className="group bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm hover:border-emerald-200 transition-all"
            >
              <summary className="flex justify-between items-center p-6 cursor-pointer list-none">
                <span className="font-medium text-stone-900">{faq.q}</span>
                <ChevronDown className="w-5 h-5 text-stone-400 group-open:rotate-180 transition-transform" />
              </summary>
              <div className="px-6 pb-6 text-stone-600 text-sm leading-relaxed border-t border-stone-50 pt-4">
                {faq.a}
              </div>
            </motion.details>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
