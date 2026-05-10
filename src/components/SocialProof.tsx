import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Eye } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export default function SocialProof() {
  const [visible, setVisible] = useState(false);
  const [count, setCount] = useState(3);
  const location = useLocation();

  useEffect(() => {
    const interval = setInterval(() => {
      // 30% chance to show notification
      if (Math.random() > 0.6) {
        setCount(Math.floor(Math.random() * 3) + 2); // 2 to 4 people
        setVisible(true);
        setTimeout(() => setVisible(false), 5000);
      }
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const isProductPage = location.pathname.includes('/product/');

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 50, x: -20 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          className="fixed bottom-24 left-4 md:bottom-8 md:left-8 bg-white p-4 rounded-xl shadow-2xl border border-stone-100 z-40 flex items-center gap-4 max-w-sm pointer-events-none"
        >
          <div className="bg-blue-100 p-2 rounded-full text-blue-600">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm text-stone-600">
              <span className="font-medium text-stone-900">{count} personnes</span>
            </p>
            <p className="text-xs text-stone-500">
              {isProductPage ? 'regardent le même produit que vous' : 'explorent actuellement la boutique'}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
