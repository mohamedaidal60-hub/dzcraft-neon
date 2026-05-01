/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store';
import Layout from './Layout';
import Landing from './pages/Landing';
import Home from './pages/Home';
import Collection from './pages/Collection';
import Product from './pages/Product';
import About from './pages/About';
import History from './pages/History';
import Login from './pages/Login';
import Admin from './pages/Admin';
import FittingRoom from './pages/FittingRoom';
import Checkout from './pages/Checkout';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';

// import Selection from './pages/Selection';

export default function App() {
  const setSettings = useStore(state => state.setSettings);
  const setProducts = useStore(state => state.setProducts);
  const userSelections = useStore(state => state.userSelections);

  useEffect(() => {
    const loadData = async () => {
      console.log('Initialisation de l\'application...');
      try {
        const [settingsRes, productsRes] = await Promise.all([
          fetch('/api/settings'),
          fetch('/api/products')
        ]);

        console.log('Réponse settings:', settingsRes.status);
        console.log('Réponse products:', productsRes.status);

        if (settingsRes.ok) {
          const settingsData = await settingsRes.json();
          console.log('Données settings chargées:', settingsData);
          setSettings(settingsData || {});
        } else {
          console.error('Failed to load settings:', settingsRes.status);
        }

        if (productsRes.ok) {
          const productsData = await productsRes.json();
          console.log('Nombre de produits chargés:', Array.isArray(productsData) ? productsData.length : 0);
          setProducts(Array.isArray(productsData) ? productsData : []);
        } else {
          console.error('Failed to load products:', productsRes.status);
        }
      } catch (err) {
        console.error('Network error while loading initial data:', err);
      }
    };

    loadData();
  }, [setSettings, setProducts]);

  return (
    <Router>
      <Routes>
        <Route path="/bienvenue" element={<Landing />} />
        {/* <Route path="/selection" element={<Selection />} /> */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="collection/:category" element={<Collection />} />
          <Route path="product/:id" element={<Product />} />
          <Route path="qui-suis-je" element={<About />} />
          <Route path="le-saviez-vous" element={<History />} />
          <Route path="fitting-room" element={<FittingRoom />} />
          <Route path="login" element={<Login />} />
          <Route path="admin" element={<Admin />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="politique-de-confidentialite" element={<PrivacyPolicy />} />
          <Route path="cgu" element={<TermsOfService />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
