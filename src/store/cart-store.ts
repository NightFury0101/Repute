"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartLine {
  key: string; // productId + variantId
  productId: string;
  variantId: string | null;
  name: string;
  slug: string;
  brand: string;
  image: string | null;
  price: number;
  compareAtPrice: number | null;
  variantName: string | null;
  quantity: number;
  maxStock: number;
}

interface CartState {
  items: CartLine[];
  saved: CartLine[];
  isOpen: boolean;
  lastAdded: string | null;
  promoCode: string | null;
  discountAmount: number;
  hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
  setOpen: (open: boolean) => void;
  addItem: (item: Omit<CartLine, "key">, openDrawer?: boolean) => void;
  updateQuantity: (key: string, quantity: number) => void;
  removeItem: (key: string) => void;
  saveForLater: (key: string) => void;
  moveToCart: (key: string) => void;
  removeSaved: (key: string) => void;
  clear: () => void;
  subtotal: () => number;
  count: () => number;
  applyPromo: (code: string, amount: number) => void;
  clearPromo: () => void;
}

function makeKey(productId: string, variantId: string | null) {
  return variantId ? `${productId}::${variantId}` : productId;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      saved: [],
      isOpen: false,
      lastAdded: null,
      promoCode: null,
      discountAmount: 0,
      hasHydrated: false,

      setHasHydrated: (value) => set({ hasHydrated: value }),
      setOpen: (open) => set({ isOpen: open }),

      addItem: (item, openDrawer = true) => {
        const key = makeKey(item.productId, item.variantId);
        set((state) => {
          const existing = state.items.find((i) => i.key === key);
          if (existing) {
            const nextQty = Math.min(existing.quantity + item.quantity, item.maxStock || 99);
            return {
              items: state.items.map((i) => (i.key === key ? { ...i, quantity: nextQty } : i)),
              isOpen: openDrawer ? true : state.isOpen,
              lastAdded: key,
            };
          }
          return {
            items: [...state.items, { ...item, key }],
            isOpen: openDrawer ? true : state.isOpen,
            lastAdded: key,
          };
        });
      },

      updateQuantity: (key, quantity) =>
        set((state) => ({
          items: state.items
            .map((i) => (i.key === key ? { ...i, quantity: Math.max(1, Math.min(quantity, i.maxStock || 99)) } : i))
            .filter((i) => i.quantity > 0),
        })),

      removeItem: (key) => set((state) => ({ items: state.items.filter((i) => i.key !== key) })),

      saveForLater: (key) =>
        set((state) => {
          const item = state.items.find((i) => i.key === key);
          if (!item) return state;
          return {
            items: state.items.filter((i) => i.key !== key),
            saved: [...state.saved.filter((i) => i.key !== key), item],
          };
        }),

      moveToCart: (key) =>
        set((state) => {
          const item = state.saved.find((i) => i.key === key);
          if (!item) return state;
          const existing = state.items.find((i) => i.key === key);
          return {
            saved: state.saved.filter((i) => i.key !== key),
            items: existing
              ? state.items.map((i) => (i.key === key ? { ...i, quantity: i.quantity + item.quantity } : i))
              : [...state.items, item],
          };
        }),

      removeSaved: (key) => set((state) => ({ saved: state.saved.filter((i) => i.key !== key) })),

      clear: () => set({ items: [], promoCode: null, discountAmount: 0 }),

      subtotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      count: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      applyPromo: (code, amount) => set({ promoCode: code, discountAmount: amount }),
      clearPromo: () => set({ promoCode: null, discountAmount: 0 }),
    }),
    {
      name: "repute-cart",
      partialize: (state) => ({
        items: state.items,
        saved: state.saved,
        promoCode: state.promoCode,
        discountAmount: state.discountAmount,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
