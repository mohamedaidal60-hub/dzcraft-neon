import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { motion } from 'motion/react';
import { Plus, Package, LogOut, Settings, Users, BookOpen, Trash2, Upload, Image as ImageIcon, ShoppingCart } from 'lucide-react';

export default function Admin() {
  const user = useStore(state => state.user);
  const setUser = useStore(state => state.setUser);
  const settings = useStore(state => state.settings);
  const setSettings = useStore(state => state.setSettings);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('products');
  const [categories, setCategories] = useState([]);
  const [clients, setClients] = useState([]);
  const [orders, setOrders] = useState([]);
  const [historyPosts, setHistoryPosts] = useState([]);
  const [message, setMessage] = useState('');

  const [productForm, setProductForm] = useState({
    name: '', slug: '', description: '', price: '', category_id: '', image_url: ''
  });

  const [settingsForm, setSettingsForm] = useState({
    logo_url: '', watermark_url: '', about_text: '', about_image_url: ''
  });

  const [historyForm, setHistoryForm] = useState({
    title: '', content: '', image_url: '', bg_image_url: ''
  });

  const [productFile, setProductFile] = useState<File | null>(null);
  const [historyFile, setHistoryFile] = useState<File | null>(null);
  const [historyBgFile, setHistoryBgFile] = useState<File | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [watermarkFile, setWatermarkFile] = useState<File | null>(null);
  const [aboutImageFile, setAboutImageFile] = useState<File | null>(null);

  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
    } else {
      fetchData();
      setSettingsForm({
        logo_url: settings.logo_url || '',
        watermark_url: settings.watermark_url || '',
        about_text: settings.about_text || '',
        about_image_url: settings.about_image_url || ''
      });
    }
  }, [user, navigate, settings]);

  const fetchData = async () => {
    const [catRes, cliRes, ordRes, histRes] = await Promise.all([
      fetch('/api/categories'),
      fetch('/api/admin/clients'),
      fetch('/api/admin/orders'),
      fetch('/api/history')
    ]);

    const catData = await catRes.json();
    setCategories(catData);
    if (catData.length > 0 && !productForm.category_id) {
      setProductForm(prev => ({ ...prev, category_id: catData[0].id.toString() }));
    }

    setClients(await cliRes.json());
    setOrders(await ordRes.json());
    setHistoryPosts(await histRes.json());
  };

  const handleLogout = () => {
    setUser(null);
    navigate('/');
  };

  const showMessage = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  const uploadImage = async (file: File | null): Promise<string | null> => {
    if (!file) return null;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      return data.success ? data.url : null;
    } catch (error) {
      console.error('Upload error:', error);
      return null;
    }
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    try {
      let finalImageUrl = productForm.image_url;
      if (productFile) {
        const url = await uploadImage(productFile);
        if (url) finalImageUrl = url;
      }

      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...productForm,
          image_url: finalImageUrl,
          price: parseFloat(productForm.price),
          category_id: parseInt(productForm.category_id)
        })
      });
      const data = await res.json();
      if (data.success) {
        showMessage('Produit ajouté avec succès !');
        setProductForm({ name: '', slug: '', description: '', price: '', category_id: categories[0]?.id.toString() || '', image_url: '' });
        setProductFile(null);
      } else {
        showMessage('Erreur lors de l\'ajout du produit.');
      }
    } catch (err) {
      showMessage('Erreur de connexion.');
    } finally {
      setUploading(false);
    }
  };

  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    try {
      const newSettings = { ...settingsForm };

      if (logoFile) {
        const url = await uploadImage(logoFile);
        if (url) newSettings.logo_url = url;
      }
      if (watermarkFile) {
        const url = await uploadImage(watermarkFile);
        if (url) newSettings.watermark_url = url;
      }
      if (aboutImageFile) {
        const url = await uploadImage(aboutImageFile);
        if (url) newSettings.about_image_url = url;
      }

      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings)
      });
      const data = await res.json();
      if (data.success) {
        showMessage('Paramètres mis à jour !');
        setSettings(newSettings);
        setSettingsForm(newSettings);
        setLogoFile(null);
        setWatermarkFile(null);
        setAboutImageFile(null);
      } else {
        showMessage('Erreur lors de la mise à jour.');
      }
    } catch (err) {
      showMessage('Erreur de connexion.');
    } finally {
      setUploading(false);
    }
  };

  const handleHistorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    try {
      let finalImageUrl = historyForm.image_url;
      let finalBgUrl = historyForm.bg_image_url;

      if (historyFile) {
        const url = await uploadImage(historyFile);
        if (url) finalImageUrl = url;
      }
      if (historyBgFile) {
        const url = await uploadImage(historyBgFile);
        if (url) finalBgUrl = url;
      }

      const res = await fetch('/api/admin/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...historyForm,
          image_url: finalImageUrl,
          bg_image_url: finalBgUrl
        })
      });
      const data = await res.json();
      if (data.success) {
        showMessage('Article ajouté avec succès !');
        setHistoryForm({ title: '', content: '', image_url: '', bg_image_url: '' });
        setHistoryFile(null);
        setHistoryBgFile(null);
        fetchData();
      } else {
        showMessage('Erreur lors de l\'ajout de l\'article.');
      }
    } catch (err) {
      showMessage('Erreur de connexion.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteHistory = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) return;
    try {
      const res = await fetch(`/api/admin/history/${id}`, { method: 'DELETE' });
      if ((await res.json()).success) {
        fetchData();
        showMessage('Article supprimé.');
      }
    } catch (err) {
      showMessage('Erreur lors de la suppression.');
    }
  };

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-24">
      <div className="flex justify-between items-center mb-12 border-b border-stone-200 pb-6">
        <div>
          <h1 className="text-3xl font-serif text-stone-900">Tableau de bord</h1>
          <p className="text-stone-500 mt-1">Gestion de la boutique DZCRAFTDESIGN</p>
        </div>
        <button onClick={handleLogout} className="flex items-center px-4 py-2 bg-stone-100 text-stone-600 rounded-lg hover:bg-stone-200 transition-colors font-medium text-sm">
          <LogOut className="w-4 h-4 mr-2" /> Déconnexion
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-xl mb-8 text-sm font-medium ${message.includes('succès') || message.includes('mis à jour') || message.includes('supprimé') ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
          {message}
        </div>
      )}

      {/* Upload Section Removed - Now integrated directly into forms */}

      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-64 flex-shrink-0 space-y-2">
          <button onClick={() => setActiveTab('products')} className={`w-full flex items-center px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'products' ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-stone-100'}`}>
            <Package className="w-5 h-5 mr-3" /> Produits
          </button>
          <button onClick={() => setActiveTab('history')} className={`w-full flex items-center px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'history' ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-stone-100'}`}>
            <BookOpen className="w-5 h-5 mr-3" /> Le saviez-vous
          </button>
          <button onClick={() => setActiveTab('clients')} className={`w-full flex items-center px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'clients' ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-stone-100'}`}>
            <Users className="w-5 h-5 mr-3" /> Clients
          </button>
          <button onClick={() => setActiveTab('orders')} className={`w-full flex items-center px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'orders' ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-stone-100'}`}>
            <ShoppingCart className="w-5 h-5 mr-3" /> Commandes
          </button>
          <button onClick={() => setActiveTab('settings')} className={`w-full flex items-center px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'settings' ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-stone-100'}`}>
            <Settings className="w-5 h-5 mr-3" /> Paramètres
          </button>
        </div>

        <div className="flex-grow bg-white p-8 rounded-3xl shadow-sm border border-stone-100">

          {activeTab === 'products' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 className="text-2xl font-serif mb-6">Ajouter un produit</h2>
              <form onSubmit={handleProductSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">Nom du produit</label>
                    <input type="text" required value={productForm.name} onChange={e => setProductForm({ ...productForm, name: e.target.value, slug: e.target.value.toLowerCase().replace(/ /g, '-') })} className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-emerald-500 focus:border-emerald-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">Prix (€)</label>
                    <input type="number" step="0.01" required value={productForm.price} onChange={e => setProductForm({ ...productForm, price: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-emerald-500 focus:border-emerald-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">Catégorie</label>
                  <select required value={productForm.category_id} onChange={e => setProductForm({ ...productForm, category_id: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-emerald-500 focus:border-emerald-500">
                    {categories.map((cat: any) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">Description</label>
                  <textarea required rows={4} value={productForm.description} onChange={e => setProductForm({ ...productForm, description: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-emerald-500 focus:border-emerald-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">Image du produit</label>
                  <input type="file" accept="image/*" onChange={e => setProductFile(e.target.files?.[0] || null)} className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-emerald-500 focus:border-emerald-500 bg-white" />
                  {productForm.image_url && !productFile && <p className="text-xs text-stone-500 mt-2">Image actuelle : {productForm.image_url}</p>}
                </div>
                <button type="submit" disabled={uploading} className="w-full py-4 bg-stone-900 text-white font-medium rounded-xl hover:bg-stone-800 transition-colors disabled:opacity-50">
                  {uploading ? 'Enregistrement...' : 'Ajouter le produit'}
                </button>
              </form>
            </motion.div>
          )}

          {activeTab === 'history' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 className="text-2xl font-serif mb-6">Ajouter un article "Le saviez-vous"</h2>
              <form onSubmit={handleHistorySubmit} className="space-y-6 mb-12">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">Titre</label>
                  <input type="text" required value={historyForm.title} onChange={e => setHistoryForm({ ...historyForm, title: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-emerald-500 focus:border-emerald-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">Contenu</label>
                  <textarea required rows={6} value={historyForm.content} onChange={e => setHistoryForm({ ...historyForm, content: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-emerald-500 focus:border-emerald-500" />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">Image principale</label>
                    <input type="file" accept="image/*" onChange={e => setHistoryFile(e.target.files?.[0] || null)} className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-emerald-500 focus:border-emerald-500 bg-white" />
                    {historyForm.image_url && !historyFile && <p className="text-xs text-stone-500 mt-2">Image actuelle : {historyForm.image_url}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">Image de fond (transparente)</label>
                    <input type="file" accept="image/*" onChange={e => setHistoryBgFile(e.target.files?.[0] || null)} className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-emerald-500 focus:border-emerald-500 bg-white" />
                    {historyForm.bg_image_url && !historyBgFile && <p className="text-xs text-stone-500 mt-2">Image actuelle : {historyForm.bg_image_url}</p>}
                  </div>
                </div>
                <button type="submit" disabled={uploading} className="w-full py-4 bg-stone-900 text-white font-medium rounded-xl hover:bg-stone-800 transition-colors disabled:opacity-50">
                  {uploading ? 'Enregistrement...' : 'Publier l\'article'}
                </button>
              </form>

              <h3 className="text-xl font-serif mb-4">Articles publiés</h3>
              <div className="space-y-4">
                {historyPosts.map((post: any) => (
                  <div key={post.id} className="flex items-center justify-between p-4 border border-stone-200 rounded-xl">
                    <div>
                      <h4 className="font-medium">{post.title}</h4>
                      <p className="text-sm text-stone-500">{new Date(post.created_at).toLocaleDateString()}</p>
                    </div>
                    <button onClick={() => handleDeleteHistory(post.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'clients' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 className="text-2xl font-serif mb-6">Base de données clients</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-stone-200 text-sm text-stone-500">
                      <th className="py-4 font-medium">Nom</th>
                      <th className="py-4 font-medium">Email</th>
                      <th className="py-4 font-medium">Téléphone</th>
                      <th className="py-4 font-medium">Date d'inscription</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clients.map((client: any) => (
                      <tr key={client.id} className="border-b border-stone-100">
                        <td className="py-4">{client.name}</td>
                        <td className="py-4">{client.email}</td>
                        <td className="py-4">{client.phone}</td>
                        <td className="py-4 text-stone-500">{new Date(client.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === 'orders' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 className="text-2xl font-serif mb-6">Gestion des commandes</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-stone-200 text-sm text-stone-500">
                      <th className="py-4 font-medium">ID</th>
                      <th className="py-4 font-medium">Client</th>
                      <th className="py-4 font-medium">Total</th>
                      <th className="py-4 font-medium">Livraison</th>
                      <th className="py-4 font-medium">Date</th>
                      <th className="py-4 font-medium">Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order: any) => (
                      <tr key={order.id} className="border-b border-stone-100 text-sm">
                        <td className="py-4 font-mono text-xs">#{order.id.toString().slice(0, 8)}</td>
                        <td className="py-4">
                          <p className="font-medium">{order.first_name} {order.last_name}</p>
                          <p className="text-xs text-stone-500">{order.email}</p>
                        </td>
                        <td className="py-4 font-bold text-emerald-600">{order.total_amount} €</td>
                        <td className="py-4">
                          <div className="flex flex-col">
                            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full w-fit mb-1 ${order.delivery_method === 'relay' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                              {order.delivery_method === 'relay' ? 'Point Relais' : 'Domicile'}
                            </span>
                            <span className="text-xs text-stone-600 line-clamp-1">{order.shipping_address}</span>
                            <span className="text-xs text-stone-400">{order.shipping_postal_code} {order.shipping_city}</span>
                          </div>
                        </td>
                        <td className="py-4 text-stone-500">{new Date(order.created_at).toLocaleDateString()}</td>
                        <td className="py-4">
                          <span className="bg-stone-100 text-stone-600 px-3 py-1 rounded-full text-xs font-medium">
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
          {activeTab === 'settings' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 className="text-2xl font-serif mb-6">Paramètres du site</h2>
              <form onSubmit={handleSettingsSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">Logo du site</label>
                  <input type="file" accept="image/*" onChange={e => setLogoFile(e.target.files?.[0] || null)} className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-emerald-500 focus:border-emerald-500 bg-white" />
                  {settingsForm.logo_url && !logoFile && <p className="text-xs text-stone-500 mt-2">Image actuelle : {settingsForm.logo_url}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">Filigrane (Watermark)</label>
                  <input type="file" accept="image/*" onChange={e => setWatermarkFile(e.target.files?.[0] || null)} className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-emerald-500 focus:border-emerald-500 bg-white" />
                  {settingsForm.watermark_url && !watermarkFile && <p className="text-xs text-stone-500 mt-2">Image actuelle : {settingsForm.watermark_url}</p>}
                </div>
                <hr className="border-stone-200" />
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">Texte "Qui suis-je"</label>
                  <textarea rows={8} value={settingsForm.about_text} onChange={e => setSettingsForm({ ...settingsForm, about_text: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-emerald-500 focus:border-emerald-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">Image "Qui suis-je"</label>
                  <input type="file" accept="image/*" onChange={e => setAboutImageFile(e.target.files?.[0] || null)} className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-emerald-500 focus:border-emerald-500 bg-white" />
                  {settingsForm.about_image_url && !aboutImageFile && <p className="text-xs text-stone-500 mt-2">Image actuelle : {settingsForm.about_image_url}</p>}
                </div>
                <button type="submit" disabled={uploading} className="w-full py-4 bg-stone-900 text-white font-medium rounded-xl hover:bg-stone-800 transition-colors disabled:opacity-50">
                  {uploading ? 'Enregistrement...' : 'Enregistrer les paramètres'}
                </button>
              </form>
            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
}
