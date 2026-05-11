import React from 'react';
import { motion } from 'motion/react';
import { HelpCircle, ChevronDown } from 'lucide-react';

const faqs = [
  {
    q: "Où sont fabriqués vos vêtements ?",
    a: "Toutes nos créations sont imaginées en France et fabriquées avec passion, valorisant le savoir-faire artisanal et l'héritage culturel algérien."
  },
  {
    q: "Quels sont les délais de livraison ?",
    a: "Pour la France et la Belgique, comptez entre 3 et 5 jours ouvrés via Mondial Relay ou à domicile. Pour le reste de l'Europe, les délais varient entre 5 et 8 jours ouvrés."
  },
  {
    q: "Puis-je essayer les vêtements avant d'acheter ?",
    a: "Nous sommes une boutique exclusivement en ligne. Toutefois, nous fournissons des guides de tailles détaillés pour chaque produit afin de vous aider à faire le meilleur choix."
  },
  {
    q: "Comment suivre ma commande ?",
    a: "Dès que votre commande est expédiée, vous recevez un email avec un numéro de suivi (Mondial Relay, Colis Privé ou Lettre Suivie) vous permettant de suivre votre colis en temps réel."
  },

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
