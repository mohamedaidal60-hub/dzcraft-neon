import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useStore } from '../store';

export default function Landing() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();
  const settings = useStore(state => state.settings);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone })
      });
      setSubmitted(true);
      localStorage.setItem('lead_submitted', 'true');
      setTimeout(() => navigate('/'), 2000);
    } catch (error) {
      console.error('Error submitting form', error);
    }
  };

  return (
    <div className="min-h-screen bg-stone-900 text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {settings.watermark_url && (
        <div 
          className="absolute inset-0 opacity-5 pointer-events-none bg-center bg-no-repeat bg-contain"
          style={{ backgroundImage: `url(${settings.watermark_url})` }}
        />
      )}
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-stone-800 p-8 rounded-3xl shadow-2xl relative z-10"
      >
        <div className="text-center mb-8">
          {settings.logo_url ? (
            <img src={settings.logo_url} alt="DZCRAFTDESIGN" className="h-24 mx-auto mb-6 object-contain" />
          ) : (
            <h1 className="text-3xl font-serif tracking-widest mb-6">DZCRAFTDESIGN</h1>
          )}
          <p className="text-stone-400">Inscrivez-vous pour découvrir notre collection exclusive et accéder à la boutique.</p>
        </div>

        {submitted ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-emerald-400 py-8"
          >
            <p className="text-xl font-medium mb-2">Merci pour votre inscription !</p>
            <p className="text-sm text-stone-400">Redirection vers la boutique...</p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-300 mb-1">Nom complet</label>
              <input 
                type="text" 
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-4 py-3 bg-stone-900 border border-stone-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-white"
                placeholder="Votre nom"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-300 mb-1">Email</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-stone-900 border border-stone-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-white"
                placeholder="votre@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-300 mb-1">Téléphone</label>
              <input 
                type="tel" 
                required
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full px-4 py-3 bg-stone-900 border border-stone-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-white"
                placeholder="+33 6 00 00 00 00"
              />
            </div>
            <button 
              type="submit"
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-colors mt-6"
            >
              Accéder à la boutique
            </button>
          </form>
        )}
        
        {!submitted && (
          <div className="mt-6 text-center">
            <button 
              onClick={() => {
                localStorage.setItem('lead_submitted', 'true');
                navigate('/');
              }}
              className="text-sm text-stone-500 hover:text-stone-300 transition-colors"
            >
              Passer cette étape
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
