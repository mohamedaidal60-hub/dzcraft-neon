import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { motion } from 'motion/react';
import { MapPin, Users, User, ChevronRight, Check } from 'lucide-react';

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

export default function Selection() {
  const navigate = useNavigate();
  const setUserSelections = useStore(state => state.setUserSelections);
  
  const [step, setStep] = useState(1);
  const [selections, setSelections] = useState({
    country: 'Algérie',
    ethnicity: 'Arabe',
    wilaya: '16 - Alger',
    target_group: 'Adulte'
  });

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
    else {
      setUserSelections(selections);
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-xl w-full bg-white rounded-[2.5rem] shadow-xl border border-stone-100 p-8 md:p-12 relative overflow-hidden">
        
        {/* Progress Bar */}
        <div className="flex gap-2 mb-12">
          {[1, 2, 3, 4].map(s => (
            <div key={s} className={`h-1.5 flex-grow rounded-full transition-all duration-500 ${step >= s ? 'bg-emerald-600' : 'bg-stone-100'}`} />
          ))}
        </div>

        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-8"
        >
          {step === 1 && (
            <div className="space-y-6">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                <MapPin className="w-8 h-8" />
              </div>
              <h1 className="text-3xl font-serif text-stone-900">Bienvenue en Algérie</h1>
              <p className="text-stone-500">L'Algérie est sélectionnée par défaut pour vous offrir le meilleur de notre patrimoine.</p>
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between">
                <span className="font-medium">Pays</span>
                <span className="text-emerald-600 font-bold flex items-center gap-2">
                  <Check className="w-4 h-4" /> Algérie
                </span>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-serif text-stone-900">Quelle est votre ethnie ?</h2>
              <p className="text-stone-500 italic">Choisissez celle qui vous définit le mieux pour des produits personnalisés.</p>
              <div className="grid grid-cols-2 gap-3">
                {ETHNICITIES.map(eth => (
                  <button
                    key={eth}
                    onClick={() => setSelections({...selections, ethnicity: eth})}
                    className={`px-4 py-4 rounded-2xl border-2 transition-all font-medium ${selections.ethnicity === eth ? 'border-emerald-600 bg-emerald-50 text-emerald-700' : 'border-stone-100 hover:border-stone-200 text-stone-600'}`}
                  >
                    {eth}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-serif text-stone-900">De quelle Wilaya êtes-vous ?</h2>
              <p className="text-stone-500">Sélectionnez votre région pour des créations locales.</p>
              <div className="relative">
                <select 
                  value={selections.wilaya} 
                  onChange={e => setSelections({...selections, wilaya: e.target.value})}
                  className="w-full appearance-none px-6 py-5 rounded-2xl border-2 border-stone-100 focus:border-emerald-500 transition-all text-stone-700 font-medium bg-stone-50"
                >
                  {WILAYAS.map(w => <option key={w} value={w}>{w}</option>)}
                </select>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400">
                  <ChevronRight className="w-5 h-5 rotate-90" />
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-serif text-stone-900">Pour qui cherchez-vous ?</h2>
              <p className="text-stone-500">Adaptons notre collection à vos besoins.</p>
              <div className="space-y-3">
                {TARGET_GROUPS.map(tg => (
                  <button
                    key={tg}
                    onClick={() => setSelections({...selections, target_group: tg})}
                    className={`w-full px-6 py-5 rounded-2xl border-2 flex items-center justify-between transition-all font-medium ${selections.target_group === tg ? 'border-emerald-600 bg-emerald-50 text-emerald-700' : 'border-stone-100 hover:border-stone-200 text-stone-600'}`}
                  >
                    <span>{tg}</span>
                    {selections.target_group === tg && <Check className="w-5 h-5 text-emerald-600" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={handleNext}
            className="w-full py-5 bg-stone-900 text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-stone-800 transition-all hover:gap-5"
          >
            {step === 4 ? 'Découvrir ma collection' : 'Suivant'} <ChevronRight className="w-5 h-5" />
          </button>
        </motion.div>

        {/* Decorative element */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-50 rounded-full blur-3xl opacity-50" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-stone-100 rounded-full blur-3xl opacity-50" />
      </div>
    </div>
  );
}
