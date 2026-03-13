import React, { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, Menu, X, User, Sparkles } from 'lucide-react';
import { useStore } from './store';
import { motion, AnimatePresence } from 'motion/react';
import Chatbot from './components/Chatbot';
import SocialProof from './components/SocialProof';

const Logo = ({ url }: { url?: string }) => (
  <div className="flex flex-col items-center">
    {url ? (
      <img src={url} alt="DZCRAFTDESIGN" className="h-24 md:h-32 object-contain" />
    ) : (
      <>
        <svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M50 10 L30 80 L20 80 L40 10 Z" fill="currentColor" />
          <path d="M50 10 L70 80 L80 80 L60 10 Z" fill="currentColor" />
          <path d="M48 20 L52 20 L52 80 L48 80 Z" fill="currentColor" />
          <path d="M10 80 L90 80 L90 85 L10 85 Z" fill="currentColor" />
        </svg>
        <span className="font-serif text-xs tracking-widest mt-1">DZCRAFTDESIGN</span>
      </>
    )}
  </div>
);

export default function Layout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const cart = useStore((state) => state.cart);
  const products = useStore((state) => state.products);
  const user = useStore((state) => state.user);
  const settings = useStore((state) => state.settings);
  const navigate = useNavigate();
  const location = useLocation();

  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  // Cross-selling logic
  const crossSellProducts = (products || []).filter(p => !cart.some(c => c.id === p.id)).slice(0, 2);

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 relative">
      {/* Watermark Logo */}
      <div className="fixed inset-0 pointer-events-none flex items-center justify-center opacity-[0.03] z-0 overflow-hidden">
        {settings.watermark_url ? (
          <img src={settings.watermark_url} alt="Watermark" className="w-[800px] h-[800px] object-contain opacity-50" />
        ) : (
          <svg width="800" height="800" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M50 10 L30 80 L20 80 L40 10 Z" fill="currentColor" />
            <path d="M50 10 L70 80 L80 80 L60 10 Z" fill="currentColor" />
            <path d="M48 20 L52 20 L52 80 L48 80 Z" fill="currentColor" />
            <path d="M10 80 L90 80 L90 85 L10 85 Z" fill="currentColor" />
          </svg>
        )}
      </div>

      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <button onClick={() => setIsMenuOpen(true)} className="p-2 -ml-2 mr-2 md:hidden">
                <Menu className="w-6 h-6" />
              </button>
              <Link to="/" className="flex items-center">
                <Logo url={settings.logo_url} />
              </Link>
            </div>

            <nav className="hidden md:flex space-x-8">
              <div className="relative group">
                <button className="text-sm font-medium hover:text-emerald-700 py-8">Collection</button>
                <div className="absolute top-full left-0 w-48 bg-white shadow-lg border border-stone-100 rounded-b-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <Link to="/collection/adulte" className="block px-4 py-3 text-sm hover:bg-stone-50">Adulte</Link>
                  <Link to="/collection/enfant" className="block px-4 py-3 text-sm hover:bg-stone-50">Enfant</Link>
                  <Link to="/collection/bebe" className="block px-4 py-3 text-sm hover:bg-stone-50">Bébé</Link>
                  <Link to="/collection/accessoire" className="block px-4 py-3 text-sm hover:bg-stone-50">Accessoire</Link>
                </div>
              </div>
              <Link to="/qui-suis-je" className="text-sm font-medium hover:text-emerald-700 py-8">Qui suis-je</Link>
              <Link to="/le-saviez-vous" className="text-sm font-medium hover:text-emerald-700 py-8">Le saviez-vous</Link>
              <Link to="/fitting-room" className="text-sm font-medium text-emerald-600 hover:text-emerald-700 py-8 flex items-center gap-1">
                <Sparkles className="w-4 h-4" /> Essayage Virtuel
              </Link>
            </nav>

            <div className="flex items-center space-x-4">
              <Link to={user?.role === 'admin' ? '/admin' : '/login'} className="p-2 hover:bg-stone-100 rounded-full transition-colors">
                <User className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow relative z-10">
        <Outlet />
      </main>

      {/* Newsletter / Lead Capture Section */}
      <section className="bg-stone-100 py-16 relative z-10 border-t border-stone-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-serif mb-4">Rejoignez le club DZCRAFTDESIGN</h2>
          <p className="text-stone-600 mb-8 max-w-2xl mx-auto">
            Inscrivez-vous pour être informé(e) en avant-première de nos nouvelles collections, de l'ouverture officielle de la boutique et de nos offres exclusives.
          </p>
          <form 
            onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              try {
                await fetch('/api/clients', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    name: formData.get('name'),
                    email: formData.get('email'),
                    phone: formData.get('phone') || ''
                  })
                });
                alert('Merci pour votre inscription !');
                e.currentTarget.reset();
              } catch (error) {
                console.error('Error:', error);
              }
            }}
            className="flex flex-col sm:flex-row gap-4 justify-center max-w-3xl mx-auto"
          >
            <input 
              type="text" 
              name="name"
              required
              placeholder="Votre nom" 
              className="px-6 py-4 rounded-full border border-stone-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none flex-1"
            />
            <input 
              type="email" 
              name="email"
              required
              placeholder="Votre email" 
              className="px-6 py-4 rounded-full border border-stone-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none flex-1"
            />
            <button 
              type="submit" 
              className="px-8 py-4 bg-stone-900 text-white font-medium rounded-full hover:bg-stone-800 transition-colors whitespace-nowrap"
            >
              S'inscrire
            </button>
          </form>
        </div>
      </section>

      <footer className="bg-stone-900 text-stone-400 py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="text-white mb-4"><Logo url={settings.logo_url} /></div>
            <p className="text-sm">Produits exclusifs faisant référence à l'Algérie. Fabriqués en Algérie, pour valoriser le savoir-faire local.</p>
          </div>
          <div>
            <h3 className="text-white font-medium mb-4 uppercase text-sm tracking-wider">Boutique</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/collection/adulte" className="hover:text-white transition-colors">Adulte</Link></li>
              <li><Link to="/collection/enfant" className="hover:text-white transition-colors">Enfant</Link></li>
              <li><Link to="/collection/bebe" className="hover:text-white transition-colors">Bébé</Link></li>
              <li><Link to="/collection/accessoire" className="hover:text-white transition-colors">Accessoire</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-medium mb-4 uppercase text-sm tracking-wider">À propos</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/qui-suis-je" className="hover:text-white transition-colors">Qui suis-je</Link></li>
              <li><Link to="/le-saviez-vous" className="hover:text-white transition-colors">Le saviez-vous</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-medium mb-4 uppercase text-sm tracking-wider">Légal</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/cgv" className="hover:text-white transition-colors">CGV</Link></li>
              <li><Link to="/mentions-legales" className="hover:text-white transition-colors">Mentions légales</Link></li>
              <li><Link to="/confidentialite" className="hover:text-white transition-colors">Politique de confidentialité</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-stone-800 text-sm text-center">
          &copy; {new Date().getFullYear()} DZCRAFTDESIGN. Tous droits réservés.
        </div>
      </footer>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/50 z-50"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-4/5 max-w-sm bg-white z-50 shadow-2xl flex flex-col"
            >
              <div className="p-4 border-b border-stone-100 flex justify-between items-center">
                <Logo />
                <button onClick={() => setIsMenuOpen(false)} className="p-2 hover:bg-stone-100 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 flex-grow overflow-y-auto">
                <div className="space-y-1">
                  <div className="font-medium text-stone-400 uppercase text-xs tracking-wider mb-2 mt-4">Collections</div>
                  <Link onClick={() => setIsMenuOpen(false)} to="/collection/adulte" className="block py-3 text-lg font-medium border-b border-stone-50">Adulte</Link>
                  <Link onClick={() => setIsMenuOpen(false)} to="/collection/enfant" className="block py-3 text-lg font-medium border-b border-stone-50">Enfant</Link>
                  <Link onClick={() => setIsMenuOpen(false)} to="/collection/bebe" className="block py-3 text-lg font-medium border-b border-stone-50">Bébé</Link>
                  <Link onClick={() => setIsMenuOpen(false)} to="/collection/accessoire" className="block py-3 text-lg font-medium border-b border-stone-50">Accessoire</Link>
                  
                  <div className="font-medium text-stone-400 uppercase text-xs tracking-wider mb-2 mt-8">Découvrir</div>
                  <Link onClick={() => setIsMenuOpen(false)} to="/qui-suis-je" className="block py-3 text-lg font-medium border-b border-stone-50">Qui suis-je</Link>
                  <Link onClick={() => setIsMenuOpen(false)} to="/le-saviez-vous" className="block py-3 text-lg font-medium border-b border-stone-50">Le saviez-vous</Link>
                  <Link onClick={() => setIsMenuOpen(false)} to="/fitting-room" className="block py-3 text-lg font-medium border-b border-stone-50 text-emerald-600 flex items-center gap-2">
                    <Sparkles className="w-5 h-5" /> Essayage Virtuel
                  </Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-black/50 z-50"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-full max-w-md bg-white z-50 shadow-2xl flex flex-col"
            >
              <div className="p-4 border-b border-stone-100 flex justify-between items-center">
                <h2 className="text-lg font-medium">Votre Panier</h2>
                <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-stone-100 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex-grow overflow-y-auto p-4">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-stone-400 space-y-4">
                    <ShoppingBag className="w-12 h-12 opacity-20" />
                    <p>Votre panier est vide</p>
                    <button 
                      onClick={() => setIsCartOpen(false)}
                      className="px-6 py-2 bg-stone-900 text-white rounded-full text-sm font-medium hover:bg-stone-800 transition-colors"
                    >
                      Continuer mes achats
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {cart.map((item, idx) => (
                      <div key={idx} className="flex gap-4">
                        <div className="w-20 h-24 bg-stone-100 rounded-md overflow-hidden flex-shrink-0">
                          <img src={item.image_url || 'https://picsum.photos/seed/dz/200/300'} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-grow flex flex-col justify-between">
                          <div>
                            <h3 className="font-medium text-sm">{item.name}</h3>
                            <p className="text-xs text-stone-500 mt-1">
                              {item.size && `Taille: ${item.size}`}
                              {item.size && item.color && ' | '}
                              {item.color && `Couleur: ${item.color}`}
                            </p>
                          </div>
                          <div className="flex justify-between items-center mt-2">
                            <div className="text-sm font-medium">{item.price.toFixed(2)} €</div>
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-stone-500">Qté: {item.quantity}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Cross-selling */}
                    {crossSellProducts.length > 0 && (
                      <div className="mt-8 pt-6 border-t border-stone-100">
                        <h4 className="text-sm font-medium text-stone-900 mb-4 uppercase tracking-wider">Vous aimerez aussi...</h4>
                        <div className="space-y-4">
                          {crossSellProducts.map((p) => (
                            <div key={`cross-${p.id}`} className="flex gap-4 items-center bg-stone-50 p-3 rounded-xl border border-stone-100">
                              <img src={p.image_url || 'https://picsum.photos/seed/dz/100/100'} alt={p.name} className="w-12 h-12 object-cover rounded-md" />
                              <div className="flex-1">
                                <h5 className="text-xs font-medium">{p.name}</h5>
                                <p className="text-xs text-emerald-600 font-medium">{p.price.toFixed(2)} €</p>
                              </div>
                              <button 
                                onClick={() => {
                                  setIsCartOpen(false);
                                  navigate(`/product/${p.id}`);
                                }}
                                className="text-xs px-3 py-1.5 bg-stone-900 text-white rounded-full hover:bg-stone-800 transition-colors"
                              >
                                Voir
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-4 border-t border-stone-100 bg-stone-50">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-medium">Total</span>
                    <span className="font-bold text-lg">{cartTotal.toFixed(2)} €</span>
                  </div>
                  <button onClick={() => { setIsCartOpen(false); navigate('/checkout'); }} className="w-full py-4 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20">
                    Valider la commande
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
      <Chatbot />
      <SocialProof />
    </div>
  );
}
