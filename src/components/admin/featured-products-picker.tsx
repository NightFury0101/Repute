"use client";

import { useMemo, useState, useTransition } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Search } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { setFeaturedProducts } from "@/lib/actions/admin-settings";
import type { ProductListItem } from "@/lib/data/products";

export function FeaturedProductsPicker({ products }: { products: ProductListItem[] }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set(products.filter((p) => p.isFeatured).map((p) => p.id)));
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(
    () => products.filter((p) => p.name.toLowerCase().includes(query.toLowerCase())),
    [products, query]
  );

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleSave() {
    startTransition(async () => {
      await setFeaturedProducts(Array.from(selected));
      toast.success("Featured products updated");
    });
  }

  return (
    <section className="rounded-2xl border border-line bg-warm-white p-6 sm:p-8 flex flex-col gap-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h3 className="font-serif text-xl text-ink">Featured Products</h3>
        <Button size="sm" onClick={handleSave} disabled={isPending}>
          {isPending ? "Saving…" : `Save (${selected.size} selected)`}
        </Button>
      </div>
      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-mute" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products…"
          className="h-10 w-full rounded-full border border-line pl-10 pr-4 text-sm focus:outline-none focus:border-rose-gold"
        />
      </div>
      <div className="max-h-96 overflow-y-auto flex flex-col gap-1 scrollbar-thin">
        {filtered.map((p) => (
          <label key={p.id} className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-ivory cursor-pointer">
            <Checkbox checked={selected.has(p.id)} onCheckedChange={() => toggle(p.id)} />
            <div className="relative h-10 w-9 rounded-md overflow-hidden bg-cream shrink-0">
              {p.images[0] && <Image src={p.images[0].url} alt={p.name} fill className="object-cover" sizes="36px" />}
            </div>
            <span className="text-sm text-ink flex-1">{p.name}</span>
            <span className="text-xs text-ink-mute">{p.brand.name}</span>
          </label>
        ))}
      </div>
    </section>
  );
}
