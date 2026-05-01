import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useStore } from '../store';
import { ShieldCheck, Truck, Clock, CreditCard, Sparkles, CheckCircle2, MapPin } from 'lucide-react';
import MondialRelayPicker from '../components/MondialRelayPicker';

export default function Checkout() {
  const { cart, clearCart, settings } = useStore();
  const navigate = useNavigate();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<'home' | 'relay'>('home');
  const [selectedRelay, setSelectedRelay] = useState<any>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (cart.length === 0 && !submitted) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center min-h-[60vh] flex flex-col justify-center items-center">
        <h2 className="text-3xl font-serif mb-4">Votre panier est vide</h2>
        <p className="text-stone-500 mb-8">Découvrez nos collections pour trouver la pièce parfaite.</p>
        <button onClick={() => navigate('/')} className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-full transition-colors">
          Retour à la boutique
        </button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Register as a client (so it appears in Admin > Clients)
      await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone })
      });
      
      // Also register as a real order if we want it to be in Admin > Orders
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          total_amount: total,
          shipping_address: deliveryMethod === 'relay' ? selectedRelay.Adresse1 : (address || 'N/A'),
          shipping_city: deliveryMethod === 'relay' ? selectedRelay.Ville : (city || 'N/A'),
          shipping_postal_code: deliveryMethod === 'relay' ? selectedRelay.CP : (postalCode || '00000'),
          delivery_method: deliveryMethod,
          relay_id: deliveryMethod === 'relay' ? selectedRelay.ID : null,
          items: cart 
        })
      });

      setSubmitted(true);
      clearCart();
    } catch (error) {
      console.error('Error submitting form', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 pb-24">
      {/* Checkout Hero */}
      <div className="bg-stone-900 text-white py-12 px-4 shadow-xl">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-5xl font-serif mb-4 tracking-tight">Finalisez votre commande</h1>
          <p className="text-stone-400 max-w-2xl text-lg">
            Rejoignez des centaines de clients satisfaits. Profitez d'une livraison rapide et d'un paiement sécurisé à la livraison.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row border border-stone-100"
        >
          {/* Left Side: Order Form */}
          <div className="flex-1 p-8 md:p-12">
            {submitted ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                </div>
                <h2 className="text-3xl font-serif mb-4 text-stone-900">Commande Confirmée !</h2>
                <p className="text-stone-600 mb-8 max-w-md mx-auto text-lg">
                  Merci pour votre confiance {name}. Nous avons bien reçu votre commande. Notre équipe vous contactera très vite pour organiser la livraison.
                </p>
                <button 
                  onClick={() => navigate('/')}
                  className="px-8 py-4 bg-stone-900 hover:bg-stone-800 text-white font-medium rounded-full transition-colors"
                >
                  Continuer mes achats
                </button>
              </motion.div>
            ) : (
              <>
                <div className="mb-8">
                  <h2 className="text-2xl font-serif mb-2 text-stone-900">Vos Informations</h2>
                  <p className="text-stone-500 text-sm">Veuillez remplir vos coordonnées pour la livraison.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-2">Nom & Prénom</label>
                      <input 
                        type="text" 
                        required
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="w-full px-5 py-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                        placeholder="Ex: Amine Benali"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-2">Email</label>
                      <input 
                        type="email" 
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full px-5 py-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                        placeholder="amine@email.com"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">Téléphone</label>
                    <input 
                      type="tel" 
                      required
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className="w-full px-5 py-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                      placeholder="05 55 00 00 00"
                    />
                  </div>

                  <div className="bg-stone-100 p-1 rounded-2xl flex mb-8">
                    <button 
                      type="button"
                      onClick={() => setDeliveryMethod('home')}
                      className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all ${deliveryMethod === 'home' ? 'bg-white shadow-sm text-stone-900' : 'text-stone-500'}`}
                    >
                      Livraison à domicile
                    </button>
                    <button 
                      type="button"
                      onClick={() => setDeliveryMethod('relay')}
                      className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all ${deliveryMethod === 'relay' ? 'bg-white shadow-sm text-stone-900' : 'text-stone-500'}`}
                    >
                      Point Relais
                    </button>
                  </div>

                  {deliveryMethod === 'home' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-stone-700 mb-2">Adresse de livraison</label>
                        <input 
                          type="text" 
                          required
                          value={address}
                          onChange={e => setAddress(e.target.value)}
                          className="w-full px-5 py-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                          placeholder="Numéro et nom de rue, quartier..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-2">Wilaya / Ville</label>
                        <input 
                          type="text" 
                          required
                          value={city}
                          onChange={e => setCity(e.target.value)}
                          className="w-full px-5 py-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                          placeholder="Alger, Oran..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-2">Code Postal</label>
                        <input 
                          type="text" 
                          required
                          value={postalCode}
                          onChange={e => setPostalCode(e.target.value)}
                          className="w-full px-5 py-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                          placeholder="Ex: 75001"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-2">Code Postal pour la recherche</label>
                        <input 
                          type="text" 
                          value={postalCode}
                          onChange={e => setPostalCode(e.target.value)}
                          className="w-full px-5 py-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all mb-4"
                          placeholder="Ex: 75001"
                        />
                        <MondialRelayPicker 
                          zipCode={postalCode} 
                          onSelect={(relay) => setSelectedRelay(relay)} 
                        />
                      </div>
                      {selectedRelay && (
                        <div className="text-xs text-stone-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> Point sélectionné: {selectedRelay.Nom} ({selectedRelay.ID})
                        </div>
                      )}
                    </div>
                  )}

                  {/* Payment Reassurance */}
                  <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-start gap-4">
                    <div className="p-2 bg-emerald-100 rounded-full text-emerald-600 shrink-0">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-medium text-emerald-900 text-sm">Paiement à la livraison</h4>
                      <p className="text-emerald-700 text-xs mt-1">Vous ne payez que lors de la réception de votre colis. 100% sécurisé.</p>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full py-5 bg-stone-900 hover:bg-stone-800 text-white font-medium text-lg rounded-2xl transition-all shadow-xl shadow-stone-900/20 disabled:opacity-50 flex justify-center items-center gap-2"
                  >
                    {loading ? 'Traitement...' : 'Confirmer la commande'}
                  </button>
                  <p className="text-center text-xs text-stone-500 mt-4 flex items-center justify-center gap-1">
                    <ShieldCheck className="w-4 h-4" /> Vos informations sont cryptées et sécurisées.
                  </p>
                </form>
              </>
            )}
          </div>

          {/* Right Side: Order Summary */}
          {!submitted && (
            <div className="lg:w-1/3 bg-stone-50 p-8 md:p-12 border-t lg:border-t-0 lg:border-l border-stone-200">
              <h3 className="text-xl font-serif mb-6 text-stone-900">Résumé du Panier</h3>
              <div className="space-y-6 mb-8 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                {cart.map((item, index) => (
                  <div key={`${item.id}-${index}`} className="flex gap-4">
                    <img src={item.image_url} alt={item.name} className="w-20 h-24 object-cover rounded-xl shadow-sm" />
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div>
                        <h4 className="font-medium text-sm text-stone-900 line-clamp-1">{item.name}</h4>
                        <p className="text-xs text-stone-500 mt-1">
                          Qté: {item.quantity} {item.size ? `| Taille: ${item.size}` : ''}
                        </p>
                      </div>
                      <p className="font-semibold text-emerald-600">{(item.price * item.quantity).toFixed(2)} €</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="border-t border-stone-200 pt-6 space-y-4">
                <div className="flex justify-between text-stone-600 text-sm">
                  <span>Sous-total</span>
                  <span>{total.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between text-stone-600 text-sm">
                  <span>Frais de livraison</span>
                  <span className="text-emerald-600 font-medium">Calculés à l'étape suivante</span>
                </div>
                <div className="flex justify-between font-bold text-xl pt-4 border-t border-stone-200 text-stone-900">
                  <span>Total</span>
                  <span>{total.toFixed(2)} €</span>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Landing Page Reassurance Sections */}
      {!submitted && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-stone-100 text-center">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Truck className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-serif mb-3">Livraison sur 58 Wilayas</h3>
              <p className="text-stone-500 text-sm leading-relaxed">
                Où que vous soyez en Algérie, nous expédions nos produits jusqu'à votre porte avec nos partenaires logistiques fiables.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-stone-100 text-center">
              <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-serif mb-3">Qualité Premium</h3>
              <p className="text-stone-500 text-sm leading-relaxed">
                Nos produits sont conçus avec des matériaux de haute qualité, valorisant l'artisanat et le savoir-faire algérien local.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-stone-100 text-center">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-serif mb-3">Support Client 7/7</h3>
              <p className="text-stone-500 text-sm leading-relaxed">
                Une question ? Notre équipe est à votre disposition tous les jours pour vous assister dans votre commande.
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
