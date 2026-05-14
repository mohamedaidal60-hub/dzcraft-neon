import React, { useState, useEffect, useRef } from 'react';
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
  const [saved, setSaved] = useState(false);
  const [selectedRelay, setSelectedRelay] = useState<RelayPoint | null>(null);
  const widgetRef = useRef<boolean>(false);

  useEffect(() => {
    if (!saved && !widgetRef.current && (window as any).$) {
      const $ = (window as any).$;
      $("#Zone_Widget").MR_ParcelShopPicker({
        Target: "#Target_Widget",
        Brand: "BDTEST  ", // Identifiant test fourni
        Country: "FR",
        PostCode: zipCode || "75000",
        Responsive: true,
        OnParcelShopSelected: (shop: any) => {
          const relay = {
            ID: shop.ID,
            Nom: shop.Nom,
            Adresse1: shop.Adresse1,
            CP: shop.CP,
            Ville: shop.Ville,
            Pays: 'FR'
          };
          setSelectedRelay(relay);
          onSelect(relay);
          setSaved(true);
        }
      });
      widgetRef.current = true;
    }
  }, [saved, zipCode, onSelect]);

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
                  Veuillez utiliser la carte ci-dessous pour choisir votre Point Relais.
                </p>
              </div>
              
              <div id="Zone_Widget" className="rounded-xl overflow-hidden border border-border min-h-[400px]"></div>
              <input type="hidden" id="Target_Widget" />
            </div>
          ) : (
            <div className="flex items-start gap-4 bg-emerald-50 p-5 rounded-2xl border border-emerald-100 animate-in fade-in zoom-in-95">
              <div className="p-3 bg-emerald-100 rounded-xl text-emerald-600 shadow-sm">
                <MapPin className="w-6 h-6" />
              </div>
              <div className="flex-1 text-sm">
                <h4 className="font-bold text-emerald-900">Point Relais Sélectionné</h4>
                {selectedRelay && (
                  <>
                    <p className="text-emerald-800 mt-1 leading-relaxed font-semibold">{selectedRelay.Nom}</p>
                    <p className="text-emerald-700 leading-relaxed">{selectedRelay.Adresse1}</p>
                    <p className="text-emerald-700 leading-relaxed">{selectedRelay.CP} {selectedRelay.Ville}</p>
                  </>
                )}
                <button 
                  type="button" 
                  onClick={() => {
                    setSaved(false);
                    widgetRef.current = false;
                  }} 
                  className="mt-4 text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1"
                >
                  Modifier le point relais
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
