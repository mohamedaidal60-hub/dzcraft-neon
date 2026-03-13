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
              <button onClick={() => setIsCartOpen(true)} className="p-2 hover:bg-stone-100 rounded-full transition-colors relative">
                <ShoppingBag className="w-5 h-5" />
                {cart.length > 0 && (
                  <span className="absolute top-0 right-0 bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full -mt-1 -mr-1">
                    {cart.reduce((total, item) => total + item.quantity, 0)}
                  </span>
                )}
              </button>
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

      {/* Enhanced Footer / Pre-Footer Features */}
      <div className="bg-stone-50 border-t border-stone-200 mt-24 py-12 relative z-10 w-full overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-white shadow-sm rounded-full flex items-center justify-center mb-4 text-emerald-600">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" /></svg>
            </div>
            <h4 className="font-medium font-serif mb-1">Qualité Garantie</h4>
            <p className="text-xs text-stone-500">Fabrication artisanale algérienne.</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-white shadow-sm rounded-full flex items-center justify-center mb-4 text-emerald-600">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h4 className="font-medium font-serif mb-1">Service Client 24/7</h4>
            <p className="text-xs text-stone-500">Toujours à votre écoute.</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-white shadow-sm rounded-full flex items-center justify-center mb-4 text-emerald-600">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
            </div>
            <h4 className="font-medium font-serif mb-1">Paiement Sécurisé</h4>
            <p className="text-xs text-stone-500">À la livraison ou en ligne.</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-white shadow-sm rounded-full flex items-center justify-center mb-4 text-emerald-600">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" /></svg>
            </div>
            <h4 className="font-medium font-serif mb-1">Livraison 58 Wilayas</h4>
            <p className="text-xs text-stone-500">Expédition rapide sur tout le pays.</p>
          </div>
        </div>
      </div>

      <footer className="bg-stone-900 border-t-4 border-emerald-600 py-16 relative z-10 w-full text-stone-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            <div>
              <div className="text-white mb-6">
                <Logo url={settings.logo_url} />
              </div>
              <p className="text-sm leading-relaxed mb-6">
                DZCRAFTDESIGN est le point de rencontre entre l'artisanat traditionnel algérien et la modernité. Nous créons des pièces uniques qui font voyager notre identité.
              </p>
              <div className="flex gap-4">
                {/* Social Icons Mockup */}
                <div className="w-10 h-10 bg-stone-800 rounded-full flex justify-center items-center hover:bg-emerald-600 cursor-pointer transition-colors"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg></div>
                <div className="w-10 h-10 bg-stone-800 rounded-full flex justify-center items-center hover:bg-emerald-600 cursor-pointer transition-colors"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg></div>
              </div>
            </div>
            
            <div>
              <h3 className="text-white font-medium mb-6 uppercase text-sm tracking-wider">Liens Rapides</h3>
              <ul className="space-y-4 text-sm">
                <li><Link to="/collection/adulte" className="hover:text-emerald-400 transition-colors flex items-center"><span className="mr-2">›</span> Boutique</Link></li>
                <li><Link to="/fitting-room" className="hover:text-emerald-400 transition-colors flex items-center text-emerald-500"><span className="mr-2">›</span> Essayage Virtuel</Link></li>
                <li><Link to="/qui-suis-je" className="hover:text-emerald-400 transition-colors flex items-center"><span className="mr-2">›</span> Notre Histoire</Link></li>
                <li><Link to="/contact" className="hover:text-emerald-400 transition-colors flex items-center"><span className="mr-2">›</span> Contactez-nous</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-medium mb-6 uppercase text-sm tracking-wider">Service Client</h3>
              <ul className="space-y-4 text-sm">
                <li><Link to="/faq" className="hover:text-emerald-400 transition-colors flex items-center"><span className="mr-2">›</span> FAQ - Questions Fréquentes</Link></li>
                <li><Link to="/livraison" className="hover:text-emerald-400 transition-colors flex items-center"><span className="mr-2">›</span> Politique de Livraison</Link></li>
                <li><Link to="/retours" className="hover:text-emerald-400 transition-colors flex items-center"><span className="mr-2">›</span> Retours et Remboursements</Link></li>
                <li><Link to="/cgv" className="hover:text-emerald-400 transition-colors flex items-center"><span className="mr-2">›</span> Conditions Générales (CGV)</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-medium mb-6 uppercase text-sm tracking-wider">Contact Direct</h3>
              <ul className="space-y-4 text-sm">
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  <span>123 Rue de l'Artisanat,<br/>Alger Centre, 16000<br/>Algérie</span>
                </li>
                <li className="flex items-center gap-3 mt-2">
                  <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  <span>+213 (0) 555 00 00 00</span>
                </li>
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  <span>contact@dzcraft.design</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mt-16 pt-8 border-t border-stone-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium tracking-wide">
            <p>&copy; {new Date().getFullYear()} DZCRAFTDESIGN. Tous droits réservés.</p>
            <div className="flex gap-4 opacity-50">
              <span className="bg-stone-800 px-3 py-1 rounded">CIB</span>
              <span className="bg-stone-800 px-3 py-1 rounded">EDAHABIA</span>
              <span className="bg-stone-800 px-3 py-1 rounded">CASH ON DELIVERY</span>
            </div>
          </div>
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
