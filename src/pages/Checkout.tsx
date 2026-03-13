import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useStore } from '../store';

export default function Checkout() {
  const { cart, clearCart, settings } = useStore();
  const navigate = useNavigate();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (cart.length === 0 && !submitted) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <h2 className="text-3xl font-serif mb-4">Votre panier est vide</h2>
        <button onClick={() => navigate('/')} className="text-emerald-600 hover:underline">
          Retour à la boutique
        </button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone })
      });
      setSubmitted(true);
      clearCart();
      localStorage.setItem('lead_submitted', 'true');
    } catch (error) {
      console.error('Error submitting form', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-900 text-white flex flex-col items-center justify-center p-4 relative overflow-hidden py-24">
      {settings.watermark_url && (
        <div 
          className="absolute inset-0 opacity-5 pointer-events-none bg-center bg-no-repeat bg-contain"
          style={{ backgroundImage: `url(${settings.watermark_url})` }}
        />
      )}
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl w-full bg-stone-800 rounded-3xl shadow-2xl relative z-10 overflow-hidden flex flex-col md:flex-row"
      >
        {/* Left Side: Lead Form */}
        <div className="flex-1 p-8 md:p-12">
          <div className="text-center mb-8">
            {settings.logo_url ? (
              <img src={settings.logo_url} alt="DZCRAFTDESIGN" className="h-20 mx-auto mb-6 object-contain" />
            ) : (
              <h1 className="text-3xl font-serif tracking-widest mb-6">DZCRAFTDESIGN</h1>
            )}
            <h2 className="text-2xl font-serif mb-2">Pré-commande & Inscription</h2>
            <p className="text-stone-400 text-sm">
              Notre système de paiement en ligne est en cours de configuration. Laissez-nous vos coordonnées pour réserver votre panier et être recontacté en priorité dès l'ouverture officielle.
            </p>
          </div>

          {submitted ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-emerald-400 py-8"
            >
              <div className="w-16 h-16 bg-emerald-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <p className="text-xl font-medium mb-2">Demande enregistrée avec succès !</p>
              <p className="text-sm text-stone-400 mb-8">Nous avons bien pris en compte votre sélection. Nous vous contacterons très prochainement.</p>
              <button 
                onClick={() => navigate('/')}
                className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-colors"
              >
                Retour à la boutique
              </button>
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
                disabled={loading}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-colors mt-6 disabled:opacity-50"
              >
                {loading ? 'Enregistrement...' : 'Confirmer ma pré-commande'}
              </button>
            </form>
          )}
        </div>

        {/* Right Side: Order Summary */}
        {!submitted && (
          <div className="flex-1 bg-stone-900 p-8 md:p-12 border-t md:border-t-0 md:border-l border-stone-700">
            <h3 className="text-xl font-serif mb-6 text-white">Votre sélection</h3>
            <div className="space-y-4 mb-6 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
              {cart.map((item, index) => (
                <div key={`${item.id}-${index}`} className="flex gap-4 items-center">
                  <img src={item.image_url} alt={item.name} className="w-16 h-20 object-cover rounded-lg border border-stone-700" />
                  <div className="flex-1">
                    <h4 className="font-medium text-sm text-stone-200">{item.name}</h4>
                    <p className="text-xs text-stone-400">Qte: {item.quantity} {item.size ? `| ${item.size}` : ''}</p>
                    <p className="font-medium mt-1 text-emerald-400">{(item.price * item.quantity).toFixed(2)} €</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-stone-700 pt-4 space-y-2">
              <div className="flex justify-between text-stone-400">
                <span>Sous-total</span>
                <span>{total.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between font-medium text-lg pt-2 border-t border-stone-700 text-white">
                <span>Total estimé</span>
                <span>{total.toFixed(2)} €</span>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
