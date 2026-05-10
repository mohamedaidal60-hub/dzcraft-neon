/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { useStore } from './store';
import Layout from './Layout';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import Collection from './pages/Collection';
import Product from './pages/Product';
import About from './pages/About';
import History from './pages/History';
import Login from './pages/Login';
import Register from './pages/Register';
import Admin from './pages/Admin';
import FittingRoom from './pages/FittingRoom';
import Checkout from './pages/Checkout';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import FAQ from './pages/FAQ';
import ShippingPolicy from './pages/ShippingPolicy';

// import Selection from './pages/Selection';

function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="collection/:category" element={<Collection />} />
          <Route path="product/:id" element={<Product />} />
          <Route path="qui-suis-je" element={<About />} />
          <Route path="le-saviez-vous" element={<History />} />
          <Route path="fitting-room" element={<FittingRoom />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="admin" element={<Admin />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="politique-de-confidentialite" element={<PrivacyPolicy />} />
          <Route path="cgu" element={<TermsOfService />} />
          <Route path="faq" element={<FAQ />} />
          <Route path="livraison" element={<ShippingPolicy />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  const setSettings = useStore(state => state.setSettings);
  const setProducts = useStore(state => state.setProducts);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [settingsRes, productsRes] = await Promise.all([
          fetch('/api/settings'),
          fetch('/api/products')
        ]);

        if (settingsRes.ok) {
          const settingsData = await settingsRes.json();
          setSettings(settingsData || {});
        }

        if (productsRes.ok) {
          const productsData = await productsRes.json();
          setProducts(Array.isArray(productsData) ? productsData : []);
        }
      } catch (err) {
        console.error('Network error while loading initial data:', err);
      }
    };

    loadData();
  }, [setSettings, setProducts]);

  return (
    <Router>
      <ScrollToTop />
      <AnimatedRoutes />
    </Router>
  );
}
