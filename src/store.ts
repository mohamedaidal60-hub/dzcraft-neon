import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: number;
  phone: string;
  role: string;
}

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
  image_url: string;
}

interface AppState {
  user: User | null;
  setUser: (user: User | null) => void;
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: number) => void;
  clearCart: () => void;
  settings: Record<string, string>;
  setSettings: (settings: Record<string, string>) => void;
  products: any[];
  setProducts: (products: any[]) => void;
  userSelections: {
    country: string;
    ethnicity: string;
    wilaya: string;
    target_group: string;
  } | null;
  setUserSelections: (selections: AppState['userSelections']) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      settings: {},
      setSettings: (settings) => set({ settings }),
      products: [],
      setProducts: (products) => set({ products }),
      userSelections: null,
      setUserSelections: (userSelections) => set({ userSelections }),
      cart: [],
      addToCart: (item) =>
        set((state) => {
          const existingItem = state.cart.find(
            (i) => i.id === item.id && i.size === item.size && i.color === item.color
          );
          if (existingItem) {
            return {
              cart: state.cart.map((i) =>
                i === existingItem ? { ...i, quantity: i.quantity + item.quantity } : i
              ),
            };
          }
          return { cart: [...state.cart, item] };
        }),
      removeFromCart: (id) =>
        set((state) => ({ cart: state.cart.filter((i) => i.id !== id) })),
      clearCart: () => set({ cart: [] }),
    }),
    {
      name: 'dzcraft-settings',
    }
  )
);
