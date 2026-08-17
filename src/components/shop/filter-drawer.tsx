"use client";

import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Sheet, SheetTrigger, SheetContent, SheetCloseButton } from "@/components/ui/sheet";
import { FiltersPanel, type Facets } from "@/components/shop/filters-panel";
import type { Category } from "@/generated/prisma/client";

export function FilterDrawer({
  categories,
  facets,
  hideCategoryFilter,
  resultCount,
}: {
  categories: Category[];
  facets: Facets;
  hideCategoryFilter?: boolean;
  resultCount: number;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="lg:hidden inline-flex items-center gap-2 h-11 px-4 rounded-full border border-ink/70 text-sm font-medium cursor-pointer">
        <SlidersHorizontal size={15} /> Filters
      </SheetTrigger>
      <SheetContent side="bottom" title="Filters" className="max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-5 border-b border-line shrink-0">
          <span className="font-serif text-xl">Filters</span>
          <SheetCloseButton />
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <FiltersPanel
            categories={categories}
            facets={facets}
            hideCategoryFilter={hideCategoryFilter}
            onNavigate={() => setOpen(false)}
            hideTitle
          />
        </div>
        <div className="px-6 py-4 border-t border-line shrink-0">
          <button
            onClick={() => setOpen(false)}
            className="w-full h-12 rounded-full bg-ink text-warm-white text-sm font-medium cursor-pointer"
          >
            Show {resultCount} Results
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
