import { create } from 'zustand';
import { CartItem, Producto } from '../types';

interface CartState {
  items: CartItem[];
  addItem: (producto: Producto, cantidad?: number) => void;
  removeItem: (productoId: string) => void;
  updateQuantity: (productoId: string, cantidad: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

const getSavedCart = (): CartItem[] => {
  try {
    const item = localStorage.getItem('cart_items');
    if (!item || item === 'undefined' || item === 'null') return [];
    return JSON.parse(item);
  } catch {
    return [];
  }
};

export const useCartStore = create<CartState>((set, get) => ({
  items: getSavedCart(),

  addItem: (producto, cantidad = 1) => {
    const current = get().items;
    const existingIndex = current.findIndex((i) => i.producto.id === producto.id);
    let updated: CartItem[];

    if (existingIndex > -1) {
      updated = [...current];
      updated[existingIndex].cantidad += cantidad;
    } else {
      updated = [...current, { producto, cantidad }];
    }

    localStorage.setItem('cart_items', JSON.stringify(updated));
    set({ items: updated });
  },

  removeItem: (productoId) => {
    const updated = get().items.filter((i) => i.producto.id !== productoId);
    localStorage.setItem('cart_items', JSON.stringify(updated));
    set({ items: updated });
  },

  updateQuantity: (productoId, cantidad) => {
    if (cantidad <= 0) {
      get().removeItem(productoId);
      return;
    }
    const updated = get().items.map((i) =>
      i.producto.id === productoId ? { ...i, cantidad } : i
    );
    localStorage.setItem('cart_items', JSON.stringify(updated));
    set({ items: updated });
  },

  clearCart: () => {
    localStorage.removeItem('cart_items');
    set({ items: [] });
  },

  getTotalItems: () => {
    return get().items.reduce((sum, item) => sum + item.cantidad, 0);
  },

  getTotalPrice: () => {
    return get().items.reduce(
      (sum, item) => sum + Number(item.producto.precio) * item.cantidad,
      0
    );
  },
}));
