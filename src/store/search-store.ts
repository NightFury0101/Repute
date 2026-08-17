"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SearchState {
  recent: string[];
  addRecent: (q: string) => void;
  clearRecent: () => void;
}

export const useSearchStore = create<SearchState>()(
  persist(
    (set, get) => ({
      recent: [],
      addRecent: (q) => {
        const trimmed = q.trim();
        if (!trimmed) return;
        const next = [trimmed, ...get().recent.filter((r) => r.toLowerCase() !== trimmed.toLowerCase())].slice(0, 6);
        set({ recent: next });
      },
      clearRecent: () => set({ recent: [] }),
    }),
    { name: "repute-recent-searches" }
  )
);
