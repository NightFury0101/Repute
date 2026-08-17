"use client";

import { create } from "zustand";

interface WishlistState {
  ids: Set<string>;
  hydrated: boolean;
  isAuthed: boolean;
  hydrate: (ids: string[], isAuthed: boolean) => void;
  set: (id: string, inWishlist: boolean) => void;
}

export const useWishlistStore = create<WishlistState>((set) => ({
  ids: new Set(),
  hydrated: false,
  isAuthed: false,
  hydrate: (ids, isAuthed) => set({ ids: new Set(ids), hydrated: true, isAuthed }),
  set: (id, inWishlist) =>
    set((state) => {
      const next = new Set(state.ids);
      if (inWishlist) next.add(id);
      else next.delete(id);
      return { ids: next };
    }),
}));
