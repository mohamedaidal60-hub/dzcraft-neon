import React, { useState, useRef } from 'react';
import { Upload, Camera, Sparkles, Loader2, ArrowRight, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../store';
import { GoogleGenAI } from '@google/genai';

// Initialize Gemini API
const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyCr4War0s1xR_-eCU9k_P8zqBZzK2LPzjg' });

export default function FittingRoom() {
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const products = useStore((state) => state.products);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserPhoto(reader.result as string);
        setResultImage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const userSelections = useStore(state => state.userSelections);

  const processFitting = async () => {
    if (!userPhoto || !selectedProduct) return;

    setIsProcessing(true);
    setError(null);

    const eth = userSelections?.ethnicity || 'Algérienne';
    const wil = userSelections?.wilaya || 'Algérie';

    try {
      // Convert base64 to parts for Gemini
      const userPhotoBase64 = userPhoto.split(',')[1];
      
      // Fetch product image and convert to base64
      const productRes = await fetch(selectedProduct.image_url || 'https://picsum.photos/seed/dz/400/600');
      const productBlob = await productRes.blob();
      const productBase64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(productBlob);
      });

      const isAccessory = selectedProduct.target_group === 'Accessoire' || selectedProduct.name.toLowerCase().includes('mug');
      
      const customText = `Je suis ${eth} de ${wil} qui aime la vie...`;

      const prompt = isAccessory 
        ? `Ceci est une cabine d'essayage virtuelle pour un accessoire (ex: Mug). 
           Prends la personne dans la première image et fais-lui tenir l'accessoire de la deuxième image. 
           SURTOUT : Ajoute de manière très réaliste le texte suivant sur l'objet : "${customText}". 
           Le résultat doit être une photo de style lifestyle, ultra-réaliste.`
        : `Ceci est une cabine d'essayage virtuelle. Prends la personne dans la première image et fais-lui porter le vêtement de la deuxième image. 
           Le vêtement est un produit DZCRAFTDESIGN. 
           Garde les traits du visage de la personne intacts. 
           Le vêtement doit refléter l'identité ${eth} de ${wil}.
           Le résultat doit être réaliste et professionnel.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash-exp', // Using a newer model if available or fallback
        contents: {
          parts: [
            {
              inlineData: {
                data: userPhotoBase64,
                mimeType: 'image/jpeg',
              },
            },
            {
              inlineData: {
                data: productBase64,
                mimeType: 'image/jpeg',
              },
            },
            {
              text: prompt,
            },
          ],
        },
      });

      let foundImage = false;
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          setResultImage(`data:image/png;base64,${part.inlineData.data}`);
          foundImage = true;
          break;
        }
      }

      if (!foundImage) {
        throw new Error("L'IA n'a pas pu générer l'image. Veuillez réessayer avec une autre photo.");
      }
    } catch (err: any) {
      console.error('Fitting room error:', err);
      setError(err.message || "Une erreur est survenue lors de l'essayage virtuel.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-serif mb-4">Cabine d'Essayage Virtuelle</h1>
        <p className="text-stone-600 max-w-2xl mx-auto">
          Découvrez comment nos créations vous vont avant de commander. Téléchargez votre photo et choisissez un article.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Step 1: User Photo */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold">1</div>
            <h2 className="text-xl font-medium">Votre Photo</h2>
          </div>
          
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`aspect-[3/4] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden relative group ${
              userPhoto ? 'border-emerald-500' : 'border-stone-300 hover:border-emerald-400 bg-stone-50'
            }`}
          >
            {userPhoto ? (
              <>
                <img src={userPhoto} alt="User" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <p className="text-white text-sm font-medium">Changer de photo</p>
                </div>
              </>
            ) : (
              <>
                <div className="p-4 bg-white rounded-full shadow-sm mb-4">
                  <Camera className="w-8 h-8 text-stone-400" />
                </div>
                <p className="text-stone-500 text-sm">Cliquez pour télécharger</p>
                <p className="text-stone-400 text-xs mt-2">Face, bonne luminosité</p>
              </>
            )}
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handlePhotoUpload} 
            accept="image/*" 
            className="hidden" 
          />
        </div>

        {/* Step 2: Product Selection */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold">2</div>
            <h2 className="text-xl font-medium">Choisir un Article</h2>
          </div>

          <div className="grid grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {products.map((product) => (
              <div 
                key={product.id}
                onClick={() => setSelectedProduct(product)}
                className={`p-2 rounded-xl border-2 transition-all cursor-pointer ${
                  selectedProduct?.id === product.id ? 'border-emerald-500 bg-emerald-50' : 'border-stone-200 hover:border-stone-300 bg-white'
                }`}
              >
                <div className="aspect-square rounded-lg overflow-hidden mb-2">
                  <img src={product.image_url || 'https://picsum.photos/seed/dz/200/200'} alt={product.name} className="w-full h-full object-cover" />
                </div>
                <p className="text-xs font-medium truncate">{product.name}</p>
                <p className="text-xs text-stone-500">{product.price} €</p>
              </div>
            ))}
          </div>
        </div>

        {/* Step 3: Result */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold">3</div>
            <h2 className="text-xl font-medium">Résultat</h2>
          </div>

          <div className="aspect-[3/4] rounded-2xl bg-stone-900 flex flex-col items-center justify-center overflow-hidden relative">
            <AnimatePresence mode="wait">
              {isProcessing ? (
                <motion.div 
                  key="processing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center text-white"
                >
                  <Loader2 className="w-12 h-12 animate-spin mb-4 text-emerald-400" />
                  <p className="text-sm font-medium">L'IA prépare votre tenue...</p>
                  <p className="text-xs text-stone-400 mt-2">Cela peut prendre quelques secondes</p>
                </motion.div>
              ) : resultImage ? (
                <motion.img 
                  key="result"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  src={resultImage} 
                  alt="Result" 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <div className="text-center p-8">
                  <Sparkles className="w-12 h-12 text-stone-700 mx-auto mb-4" />
                  <p className="text-stone-500 text-sm">Prêt pour l'essayage ?</p>
                </div>
              )}
            </AnimatePresence>

            {error && (
              <div className="absolute bottom-4 left-4 right-4 p-3 bg-red-500/90 text-white text-xs rounded-lg backdrop-blur-sm">
                {error}
              </div>
            )}
          </div>

          <button
            onClick={processFitting}
            disabled={!userPhoto || !selectedProduct || isProcessing}
            className={`w-full py-4 rounded-full font-medium flex items-center justify-center gap-2 transition-all shadow-lg ${
              !userPhoto || !selectedProduct || isProcessing
                ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-600/20'
            }`}
          >
            {isProcessing ? 'Traitement en cours...' : (
              <>
                Essayer maintenant <Sparkles className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Guide Section */}
      <div className="mt-24 bg-white rounded-3xl p-8 md:p-12 border border-stone-200 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-serif mb-6">Comment ça marche ?</h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-stone-600">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-medium mb-1">Téléchargez votre photo</h4>
                  <p className="text-sm text-stone-500 text-balance">Pour un meilleur résultat, utilisez une photo de face avec un éclairage uniforme et un fond simple.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-stone-600">
                  <ArrowRight className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-medium mb-1">Sélectionnez un article</h4>
                  <p className="text-sm text-stone-500 text-balance">Choisissez parmi nos t-shirts, hoodies et accessoires inspirés de l'Algérie.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-stone-600">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-medium mb-1">Magie de l'IA</h4>
                  <p className="text-sm text-stone-500 text-balance">Notre technologie d'intelligence artificielle génère instantanément un aperçu réaliste de vous portant l'article.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl rotate-3">
              <img src="https://picsum.photos/seed/fitting/800/800" alt="Fitting Guide" className="w-full h-full object-cover" />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-emerald-600 text-white p-6 rounded-2xl shadow-xl -rotate-3 hidden md:block">
              <p className="text-lg font-serif">"Incroyablement réaliste !"</p>
              <p className="text-xs text-emerald-100 mt-1">- Client satisfait</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
