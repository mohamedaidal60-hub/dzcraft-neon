import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useStore } from '../store';
import { ShieldCheck, Truck, Clock, CreditCard, Sparkles, CheckCircle2, MapPin, Loader2 } from 'lucide-react';
import MondialRelayPicker from '../components/MondialRelayPicker';

const RELAY_SHIPPING = 4.99;

function parsePrice(p: any): number {
  if (typeof p === 'number') return p;
  if (typeof p === 'string') return parseFloat(p.replace(',', '.')) || 0;
  return 0;
}

export default function Checkout() {
  // ─── ALL HOOKS MUST BE HERE, BEFORE ANY EARLY RETURN ────────────────────────
  const { cart, clearCart } = useStore();
  const navigate = useNavigate();

  const [name, setName]             = useState('');
  const [email, setEmail]           = useState('');
  const [phone, setPhone]           = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [selectedRelay, setSelectedRelay] = useState<any>(null);
  const [submitted, setSubmitted]   = useState(false);
  const [loading, setLoading]       = useState(false);
  const [formError, setFormError]   = useState<string | null>(null);
  const [hydrated, setHydrated]     = useState(false);

  useEffect(() => {
    // Wait for zustand to hydrate from localStorage (handles slow/cached loads)
    const timer = setTimeout(() => setHydrated(true), 200);
    const params = new URLSearchParams(window.location.search);
    if (params.get('success')) {
      setSubmitted(true);
      try { clearCart(); } catch(e) { console.error(e); }
    }
    return () => clearTimeout(timer);
  }, []); // eslint-disable-line

  // ─── DERIVED VALUES ──────────────────────────────────────────────────────────
  const subtotal  = cart.reduce((sum, item) => sum + parsePrice(item.price) * item.quantity, 0);
  const shipping  = RELAY_SHIPPING;
  const total     = subtotal + shipping;

  // ─── SUBMIT ──────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRelay) {
      setFormError('Veuillez saisir et confirmer un point relais avant de continuer.');
      return;
    }
    setFormError(null);
    setLoading(true);

    try {
      // 1. Enregistrement client
      await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone }),
      });

      // 2. Enregistrement commande
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          total_amount: total,
          shipping_address: selectedRelay.Adresse1 || 'N/A',
          shipping_city: selectedRelay.Ville || 'N/A',
          shipping_postal_code: selectedRelay.CP || postalCode || '00000',
          shipping_country: selectedRelay.Pays || 'FR',
          delivery_method: 'relay',
          relay_id: selectedRelay.ID,
          items: cart,
        }),
      });

      if (!orderRes.ok) {
        const errJson = await orderRes.json().catch(() => ({}));
        throw new Error(errJson.error || 'Erreur création commande');
      }

      const { orderId } = await orderRes.json();

      // 3. Session Stripe
      const stripeRes = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cart, email, orderId }),
      });

      const stripeJson = await stripeRes.json();

      if (stripeJson.url) {
        window.location.href = stripeJson.url;
        return;
      }

      // 4. Fallback WhatsApp si Stripe non configuré
      const lines = cart
        .map((i) => `- ${i.name} x${i.quantity} = ${(parsePrice(i.price) * i.quantity).toFixed(2)}€`)
        .join('\n');
      const msg = [
        `🛍️ Nouvelle commande DZCRAFTDESIGN`,
        ``,
        `Client : ${name}`,
        `Email  : ${email}`,
        `Tél    : ${phone}`,
        ``,
        `Produits :`,
        lines,
        ``,
        `📦 Point Relais : ${selectedRelay.Nom}`,
        `Adresse : ${selectedRelay.Adresse1}, ${selectedRelay.CP} ${selectedRelay.Ville}`,
        ``,
        `Sous-total : ${subtotal.toFixed(2)}€`,
        `Livraison  : ${shipping.toFixed(2)}€`,
        `TOTAL      : ${total.toFixed(2)}€`,
      ].join('\n');
      window.open(`https://wa.me/33767099115?text=${encodeURIComponent(msg)}`, '_blank');
      setSubmitted(true);
      clearCart();
    } catch (err: any) {
      console.error('Checkout error:', err);
      setFormError(`Erreur : ${err.message || 'Veuillez réessayer ou contacter le support.'}`);
    } finally {
      setLoading(false);
    }
  };

  // ─── EMPTY CART ───────────────────────────────────────────────────────────────
  // Show spinner while zustand hydrates from localStorage
  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="flex flex-col items-center gap-4 text-stone-400">
          <Loader2 className="w-10 h-10 animate-spin" />
          <p className="text-sm">Chargement de votre panier…</p>
        </div>
      </div>
    );
  }

  if (cart.length === 0 && !submitted) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center min-h-[60vh] flex flex-col justify-center items-center">
        <h2 className="text-3xl font-serif mb-4">Votre panier est vide</h2>
        <p className="text-stone-500 mb-8">Découvrez nos collections pour trouver la pièce parfaite.</p>
        <button
          onClick={() => navigate('/')}
          className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-full transition-colors"
        >
          Retour à la boutique
        </button>
      </div>
    );
  }

  // ─── RENDER ───────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 pb-24">
      {/* Hero */}
      <div className="bg-stone-900 text-white py-12 px-4 shadow-xl">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-5xl font-serif mb-4 tracking-tight">Finalisez votre commande</h1>
          <p className="text-stone-400 max-w-2xl text-lg">
            Paiement sécurisé · Livraison Point Relais incluse
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row border border-stone-100"
        >
          {/* ── Left: Form ── */}
          <div className="flex-1 p-8 md:p-12">
            {submitted ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                </div>
                <h2 className="text-3xl font-serif mb-4">Commande Confirmée !</h2>
                <p className="text-stone-600 mb-8 max-w-md mx-auto text-lg">
                  Merci {name}. Vous allez recevoir un email de confirmation. Notre équipe vous contactera pour organiser la livraison.
                </p>
                <button
                  onClick={() => navigate('/')}
                  className="px-8 py-4 bg-stone-900 hover:bg-stone-800 text-white font-medium rounded-full transition-colors"
                >
                  Continuer mes achats
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <h2 className="text-2xl font-serif mb-1 text-stone-900">Vos Informations</h2>
                  <p className="text-stone-500 text-sm">Remplissez vos coordonnées pour la livraison.</p>
                </div>

                {/* Name + Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">Nom & Prénom *</label>
                    <input
                      type="text" required value={name} onChange={e => setName(e.target.value)}
                      className="w-full px-5 py-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                      placeholder="Amine Benali"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">Email *</label>
                    <input
                      type="email" required value={email} onChange={e => setEmail(e.target.value)}
                      className="w-full px-5 py-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                      placeholder="amine@email.com"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">Téléphone *</label>
                  <input
                    type="tel" required value={phone} onChange={e => setPhone(e.target.value)}
                    className="w-full px-5 py-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                    placeholder="06 12 34 56 78"
                  />
                </div>

                {/* Relay Picker */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">Point Relais *</label>
                    <p className="text-xs text-stone-400 mb-3">Saisissez l'adresse du Point Relais Mondial Relay le plus proche de chez vous.</p>
                  </div>
                  <MondialRelayPicker
                    zipCode={postalCode}
                    onSelect={(relay) => { setSelectedRelay(relay); setFormError(null); }}
                  />
                  {selectedRelay && (
                    <div className="text-xs text-emerald-700 flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3" />
                      Point sélectionné : <strong>{selectedRelay.Nom}</strong>
                    </div>
                  )}
                </div>

                {/* Payment info */}
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-start gap-4">
                  <div className="p-2 bg-emerald-100 rounded-full text-emerald-600 shrink-0">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-medium text-emerald-900 text-sm">Paiement Sécurisé par Stripe</h4>
                    <p className="text-emerald-700 text-xs mt-1">Carte bancaire, Apple Pay, Google Pay. Vos données sont chiffrées.</p>
                  </div>
                </div>

                {/* Error */}
                {formError && (
                  <div className="bg-red-50 text-red-700 p-4 rounded-2xl text-sm border border-red-200 flex items-start gap-2">
                    <span className="font-bold mt-0.5">⚠️</span>
                    <span>{formError}</span>
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading || !selectedRelay}
                  className="w-full py-5 bg-emerald-600 text-white font-bold rounded-3xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      Traitement en cours…
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-6 h-6" />
                      {!selectedRelay
                        ? 'Veuillez choisir un point relais'
                        : `Payer ${total.toFixed(2)} € en sécurité`}
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* ── Right: Summary ── */}
          {!submitted && (
            <div className="lg:w-1/3 bg-stone-50 p-8 md:p-12 border-t lg:border-t-0 lg:border-l border-stone-200">
              <h3 className="text-xl font-serif mb-6 text-stone-900">Résumé</h3>
              <div className="space-y-5 mb-8 max-h-[40vh] overflow-y-auto pr-2">
                {cart.map((item, i) => (
                  <div key={`${item.id}-${i}`} className="flex gap-4">
                    <img src={item.image_url} alt={item.name} className="w-20 h-24 object-cover rounded-xl shadow-sm" />
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div>
                        <h4 className="font-medium text-sm text-stone-900 line-clamp-2">{item.name}</h4>
                        <p className="text-xs text-stone-500 mt-1">
                          Qté : {item.quantity}{item.size ? ` | Taille : ${item.size}` : ''}
                        </p>
                      </div>
                      <p className="font-semibold text-emerald-600">
                        {(parsePrice(item.price) * item.quantity).toFixed(2)} €
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-stone-200 pt-6 space-y-3">
                <div className="flex justify-between text-stone-600 text-sm">
                  <span>Sous-total</span>
                  <span>{subtotal.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between text-stone-600 text-sm">
                  <span>Livraison Point Relais</span>
                  <span className="text-emerald-600 font-medium">{shipping.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between font-bold text-xl pt-4 border-t border-stone-200 text-stone-900">
                  <span>Total</span>
                  <span>{total.toFixed(2)} €</span>
                </div>
              </div>

              <div className="mt-6 text-xs text-stone-400 text-center space-y-1">
                <p>🔒 Paiement 100% sécurisé par Stripe</p>
                <p>📦 Livraison via Mondial Relay – {shipping.toFixed(2)} €</p>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Reassurance */}
      {!submitted && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-stone-100 text-center">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Truck className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-serif mb-3">Livraison en Europe</h3>
              <p className="text-stone-500 text-sm leading-relaxed">Via Mondial Relay dans toute l'Europe — rapide et économique.</p>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-stone-100 text-center">
              <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-serif mb-3">Qualité Premium</h3>
              <p className="text-stone-500 text-sm leading-relaxed">Artisanat algérien de haute qualité, pièces uniques et soignées.</p>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-stone-100 text-center">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-serif mb-3">Support 7j/7</h3>
              <p className="text-stone-500 text-sm leading-relaxed">Notre équipe est disponible tous les jours pour vous aider.</p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
