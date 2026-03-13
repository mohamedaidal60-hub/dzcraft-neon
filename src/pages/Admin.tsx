import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { motion } from 'motion/react';
import { Plus, Package, LogOut, Settings, Users, BookOpen, Trash2, Upload, Image as ImageIcon, Sparkles } from 'lucide-react';

const ETHNICITIES = ['Arabe', 'Kabyle', 'Chaoui', 'Touareg', 'Mozabite', 'Chenoui', 'Chelhi', 'Sahraoui'];
const TARGET_GROUPS = ['Adulte', 'Enfant', 'Bébé', 'Accessoire'];
const WILAYAS = [
  '01 - Adrar', '02 - Chlef', '03 - Laghouat', '04 - Oum El Bouaghi', '05 - Batna', '06 - Béjaïa', '07 - Biskra', '08 - Béchar', '09 - Blida', '10 - Bouira',
  '11 - Tamanrasset', '12 - Tébessa', '13 - Tlemcen', '14 - Tiaret', '15 - Tizi Ouzou', '16 - Alger', '17 - Djelfa', '18 - Jijel', '19 - Sétif', '20 - Saïda',
  '21 - Skikda', '22 - Sidi Bel Abbès', '23 - Annaba', '24 - Guelma', '25 - Constantine', '26 - Médéa', '27 - Mostaganem', '28 - M\'Sila', '29 - Mascara', '30 - Ouargla',
  '31 - Oran', '32 - El Bayadh', '33 - Illizi', '34 - Bordj Bou Arreridj', '35 - Boumerdès', '36 - El Tarf', '37 - Tindouf', '38 - Tissemsilt', '39 - El Oued', '40 - Khenchela',
  '41 - Souk Ahras', '42 - Tipaza', '43 - Mila', '44 - Aïn Defla', '45 - Naâma', '46 - Aïn Témouchent', '47 - Ghardaïa', '48 - Relizane', '49 - El M\'Ghair', '50 - El Meniaa',
  '51 - Ouled Djellal', '52 - Bordj Badji Mokhtar', '53 - Béni Abbès', '54 - Timimoun', '55 - Touggourt', '56 - Djanet', '57 - In Salah', '58 - In Guezzam'
];

export default function Admin() {
  const user = useStore(state => state.user);
  const setUser = useStore(state => state.setUser);
  const settings = useStore(state => state.settings);
  const setSettings = useStore(state => state.setSettings);
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('products');
  const [categories, setCategories] = useState([]);
  const [clients, setClients] = useState([]);
  const [historyPosts, setHistoryPosts] = useState([]);
  const [message, setMessage] = useState('');

  const [productForm, setProductForm] = useState({
    name: '', slug: '', description: '', price: '', category_id: '', image_url: '',
    ethnicity: 'Arabe', wilaya: '16 - Alger', target_group: 'Adulte'
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
    const [catRes, cliRes, histRes] = await Promise.all([
      fetch('/api/categories'),
      fetch('/api/admin/clients'),
      fetch('/api/history')
    ]);
    
    const catData = await catRes.json();
    setCategories(catData);
    if (catData.length > 0 && !productForm.category_id) {
      setProductForm(prev => ({ ...prev, category_id: catData[0].id.toString() }));
    }

    setClients(await cliRes.json());
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
        setProductForm({ 
          name: '', slug: '', description: '', price: '', 
          category_id: categories[0]?.id.toString() || '', image_url: '',
          ethnicity: 'Arabe', wilaya: '16 - Alger', target_group: 'Adulte'
        });
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
                    <input type="text" required value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value, slug: e.target.value.toLowerCase().replace(/ /g, '-')})} className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-emerald-500 focus:border-emerald-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">Prix (€)</label>
                    <input type="number" step="0.01" required value={productForm.price} onChange={e => setProductForm({...productForm, price: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-emerald-500 focus:border-emerald-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">Catégorie</label>
                  <select required value={productForm.category_id} onChange={e => setProductForm({...productForm, category_id: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-emerald-500 focus:border-emerald-500">
                    {categories.map((cat: any) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">Ethnie</label>
                    <select value={productForm.ethnicity} onChange={e => setProductForm({...productForm, ethnicity: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-emerald-500 focus:border-emerald-500 bg-white">
                      {ETHNICITIES.map(eth => <option key={eth} value={eth}>{eth}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">Wilaya</label>
                    <select value={productForm.wilaya} onChange={e => setProductForm({...productForm, wilaya: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-emerald-500 focus:border-emerald-500 bg-white">
                      {WILAYAS.map(w => <option key={w} value={w}>{w}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">Public cible</label>
                    <select value={productForm.target_group} onChange={e => setProductForm({...productForm, target_group: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-emerald-500 focus:border-emerald-500 bg-white">
                      {TARGET_GROUPS.map(tg => <option key={tg} value={tg}>{tg}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-stone-700">Description</label>
                    <button type="button" onClick={async () => {
                      if (!productForm.name) return showMessage('Mettez un nom de produit d\'abord');
                      setUploading(true);
                      try {
                        const res = await fetch('/api/admin/ai-generate', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ name: productForm.name, ethnicity: productForm.ethnicity, wilaya: productForm.wilaya })
                        });
                        const data = await res.json();
                        if (data.description) {
                          setProductForm({ ...productForm, description: data.description });
                          showMessage('Description générée !');
                        }
                      } catch (err) {
                        showMessage('Erreur IA');
                      } finally {
                        setUploading(false);
                      }
                    }} className="flex items-center text-xs font-medium text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg transition-colors">
                      <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Générer avec l'IA
                    </button>
                  </div>
                  <textarea required rows={4} value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-emerald-500 focus:border-emerald-500" />
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
                  <input type="text" required value={historyForm.title} onChange={e => setHistoryForm({...historyForm, title: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-emerald-500 focus:border-emerald-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">Contenu</label>
                  <textarea required rows={6} value={historyForm.content} onChange={e => setHistoryForm({...historyForm, content: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-emerald-500 focus:border-emerald-500" />
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
                  <textarea rows={8} value={settingsForm.about_text} onChange={e => setSettingsForm({...settingsForm, about_text: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-emerald-500 focus:border-emerald-500" />
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
