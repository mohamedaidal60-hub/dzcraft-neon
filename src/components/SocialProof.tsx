import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, Eye, Heart } from 'lucide-react';
import { useStore } from '../store';

const firstNames = ['Sarah', 'Amine', 'Yanis', 'Lina', 'Inès', 'Mehdi', 'Sofia', 'Rayane', 'Kenza', 'Walid', 'Nour'];
const cities = ['Paris', 'Lyon', 'Marseille', 'Alger', 'Oran', 'Toulouse', 'Lille', 'Bordeaux', 'Strasbourg', 'Nantes'];
const actions = [
  { text: 'vient d\'acheter', icon: ShoppingBag, color: 'text-emerald-600', bg: 'bg-emerald-100' },
  { text: 'a ajouté à son panier', icon: ShoppingBag, color: 'text-emerald-600', bg: 'bg-emerald-100' },
  { text: 'regarde actuellement', icon: Eye, color: 'text-blue-600', bg: 'bg-blue-100' },
  { text: 'a mis en favori', icon: Heart, color: 'text-rose-600', bg: 'bg-rose-100' }
];

export default function SocialProof() {
  const [notification, setNotification] = useState<{name: string, city: string, action: any, item: string} | null>(null);
  const products = useStore(state => state.products);

  useEffect(() => {
    if (!products || products.length === 0) return;

    const interval = setInterval(() => {
      // 30% chance to show a notification every 15 seconds
      if (Math.random() > 0.7) {
        const name = firstNames[Math.floor(Math.random() * firstNames.length)];
        const city = cities[Math.floor(Math.random() * cities.length)];
        const action = actions[Math.floor(Math.random() * actions.length)];
        const item = products[Math.floor(Math.random() * products.length)]?.name;

        if (item) {
          setNotification({ name, city, action, item });
          // Hide after 5 seconds
          setTimeout(() => setNotification(null), 5000);
        }
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [products]);

  return (
    <AnimatePresence>
      {notification && (
        <motion.div
          initial={{ opacity: 0, y: 50, x: -20 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          className="fixed bottom-24 left-4 md:bottom-8 md:left-8 bg-white p-4 rounded-xl shadow-2xl border border-stone-100 z-40 flex items-center gap-4 max-w-sm pointer-events-none"
        >
          <div className={`${notification.action.bg} p-2 rounded-full ${notification.action.color}`}>
            <notification.action.icon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm text-stone-600">
              <span className="font-medium text-stone-900">{notification.name}</span> de {notification.city}
            </p>
            <p className="text-xs text-stone-500">
              {notification.action.text} <span className="font-medium text-stone-700">{notification.item}</span>
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
