import React, { useEffect, useState } from 'react';
import { MapPin, Search, Loader2 } from 'lucide-react';

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

declare global {
  interface Window {
    $: any;
  }
}

export default function MondialRelayPicker({ onSelect, zipCode }: MondialRelayPickerProps) {
  const [loading, setLoading] = useState(false);
  const [selectedRelay, setSelectedRelay] = useState<RelayPoint | null>(null);

  useEffect(() => {
    // Load jQuery and Mondial Relay Widget script
    const loadScripts = async () => {
      if (!window.$) {
        const jQueryScript = document.createElement('script');
        jQueryScript.src = 'https://code.jquery.com/jquery-3.6.0.min.js';
        document.head.appendChild(jQueryScript);
        await new Promise((resolve) => (jQueryScript.onload = resolve));
      }

      if (!document.getElementById('mr-widget-script')) {
        const mrScript = document.createElement('script');
        mrScript.id = 'mr-widget-script';
        mrScript.src = 'https://widget.mondialrelay.com/parcelshop-picker/jquery.mondialrelay.parcelshoppicker.min.js';
        document.head.appendChild(mrScript);
        await new Promise((resolve) => (mrScript.onload = resolve));
      }

      initWidget();
    };

    const initWidget = () => {
      const enseigne = import.meta.env.VITE_MONDIAL_RELAY_ENSEIGNE || 'CC23WO9L';
      
      window.$("#Zone_Widget").MR_ParcelShopPicker({
        Target: "#Target_Widget",
        Brand: enseigne,
        Country: "FR",
        PostCode: zipCode || "75001",
        ColLivMod: "24R",
        NbParcelShop: 5,
        OnParcelShopSelected: (data: any) => {
          const relay = {
            ID: data.ID,
            Nom: data.Nom,
            Adresse1: data.Adresse1,
            CP: data.CP,
            Ville: data.Ville,
            Pays: data.Pays
          };
          setSelectedRelay(relay);
          onSelect(relay);
        }
      });
    };

    loadScripts();
  }, [zipCode, onSelect]);

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
        <div className="p-4 bg-stone-50 border-b border-stone-200 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-emerald-600" />
          <h3 className="font-medium text-stone-900">Choisir un point relais</h3>
        </div>
        
        <div className="p-6">
          {!selectedRelay ? (
            <div className="text-center py-8">
              <Search className="w-12 h-12 text-stone-300 mx-auto mb-4" />
              <p className="text-stone-500 text-sm mb-6">Recherchez le point relais le plus proche de chez vous.</p>
              <div id="Zone_Widget" className="w-full min-h-[400px]"></div>
              <input type="hidden" id="Target_Widget" />
            </div>
          ) : (
            <div className="flex items-start gap-4 bg-emerald-50 p-4 rounded-xl border border-emerald-100">
              <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-emerald-900">{selectedRelay.Nom}</h4>
                <p className="text-sm text-emerald-800 mt-1">
                  {selectedRelay.Adresse1}<br />
                  {selectedRelay.CP} {selectedRelay.Ville}
                </p>
                <button 
                  onClick={() => setSelectedRelay(null)}
                  className="mt-4 text-xs font-medium text-emerald-600 hover:underline"
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
