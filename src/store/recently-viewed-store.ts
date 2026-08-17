"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface RecentlyViewedState {
  ids: string[];
  track: (id: string) => void;
}

export const useRecentlyViewedStore = create<RecentlyViewedState>()(
  persist(
    (set, get) => ({
      ids: [],
      track: (id) => {
        const current = get().ids.filter((i) => i !== id);
        set({ ids: [id, ...current].slice(0, 16) });
      },
    }),
    { name: "maldibay-recently-viewed" }
  )
);
