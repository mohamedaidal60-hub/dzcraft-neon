import React from 'react';
import { MessageCircle } from 'lucide-react';
import { motion } from 'motion/react';

export default function WhatsAppButton() {
  const phoneNumber = '33767099115';
  const message = 'Bonjour DZCRAFTDESIGN, je souhaiterais avoir plus d\'informations.';

  const handleWhatsAppClick = () => {
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={handleWhatsAppClick}
      className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-2xl flex items-center justify-center hover:bg-[#20ba5a] transition-colors focus:outline-none focus:ring-4 focus:ring-[#25D366]/50"
      aria-label="Contacter sur WhatsApp"
    >
      <MessageCircle className="w-8 h-8 fill-white/20" />
      <span className="absolute -top-2 -right-2 flex h-4 w-4">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
      </span>
    </motion.button>
  );
}
