import React, { useState } from 'react';
import { MapPin, Info } from 'lucide-react';

interface RelayPoint {
  ID: string;
  Nom: string;
  Adresse1: string;
  CP: string;
  Ville: string;
  Pays: string;
}

interface MondialRelayPickerProps {
  onSelect: (relay: RelayPoint) => void;
  zipCode?: string;
}

export default function MondialRelayPicker({ onSelect, zipCode }: MondialRelayPickerProps) {
  const [address, setAddress] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) return;

    const relay = {
      ID: 'MANUAL',
      Nom: 'Point Relais Choisi',
      Adresse1: address,
      CP: zipCode || '',
      Ville: '',
      Pays: 'FR'
    };
    onSelect(relay);
    setSaved(true);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
        <div className="p-4 bg-stone-50 border-b border-stone-200 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-emerald-600" />
          <h3 className="font-medium text-stone-900">Choix du Point Relais</h3>
        </div>
        
        <div className="p-6">
          {!saved ? (
            <div className="space-y-4">
              <div className="bg-stone-50 p-4 rounded-xl border border-stone-100 flex gap-3 mb-2">
                <Info className="w-5 h-5 text-stone-400 shrink-0 mt-0.5" />
                <p className="text-xs text-stone-600 leading-relaxed">
                  Veuillez indiquer le nom et l'adresse du <strong>Point Relais</strong> où vous souhaitez être livré. 
                  Vous pouvez trouver le plus proche sur le site de Mondial Relay si besoin.
                </p>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2 ml-1">
                  Adresse du Point Relais
                </label>
                <textarea 
                  required
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className="w-full px-5 py-4 bg-stone-50 border border-stone-200 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-sm"
                  placeholder="Ex: Tabac de la Place, 12 rue de la Paix, 75002 Paris"
                  rows={3}
                />
              </div>

              <button 
                type="button"
                onClick={handleSubmit}
                className="w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20"
              >
                Confirmer ce point relais
              </button>
            </div>
          ) : (
            <div className="flex items-start gap-4 bg-emerald-50 p-5 rounded-2xl border border-emerald-100 animate-in fade-in zoom-in-95">
              <div className="p-3 bg-emerald-100 rounded-xl text-emerald-600 shadow-sm">
                <MapPin className="w-6 h-6" />
              </div>
              <div className="flex-1 text-sm">
                <h4 className="font-bold text-emerald-900">Point Relais Sélectionné</h4>
                <p className="text-emerald-800 mt-1 leading-relaxed">{address}</p>
                <button 
                  type="button" 
                  onClick={() => setSaved(false)} 
                  className="mt-4 text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1"
                >
                  Modifier l'adresse
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
