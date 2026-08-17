"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useTransition } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Rating } from "@/components/ui/rating";
import { Button } from "@/components/ui/button";
import { SKIN_TYPES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Category } from "@/generated/prisma/client";

export interface Facets {
  brands: { name: string; slug: string; count: number }[];
  productTypes: { name: string; count: number }[];
  maxPrice: number;
}

export function FiltersPanel({
  categories,
  facets,
  hideCategoryFilter,
  onNavigate,
  hideTitle,
}: {
  categories: Category[];
  facets: Facets;
  hideCategoryFilter?: boolean;
  onNavigate?: () => void;
  hideTitle?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const [minPrice, setMinPrice] = useState(searchParams.get("min") ?? "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("max") ?? "");

  const selectedCats = (searchParams.get("cat") ?? "").split(",").filter(Boolean);
  const selectedBrands = (searchParams.get("brand") ?? "").split(",").filter(Boolean);
  const selectedTypes = (searchParams.get("type") ?? "").split(",").filter(Boolean);
  const selectedSkin = (searchParams.get("skin") ?? "").split(",").filter(Boolean);
  const selectedRating = searchParams.get("rating") ?? "";
  const inStock = searchParams.get("stock") === "1";
  const onSale = searchParams.get("sale") === "1";

  function update(mutator: (params: URLSearchParams) => void) {
    const params = new URLSearchParams(searchParams.toString());
    mutator(params);
    params.delete("page");
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    });
    onNavigate?.();
  }

  function toggleListParam(key: string, value: string, current: string[]) {
    update((params) => {
      const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
      if (next.length) params.set(key, next.join(","));
      else params.delete(key);
    });
  }

  function applyPriceRange() {
    update((params) => {
      if (minPrice) params.set("min", minPrice);
      else params.delete("min");
      if (maxPrice) params.set("max", maxPrice);
      else params.delete("max");
    });
  }

  function clearAll() {
    setMinPrice("");
    setMaxPrice("");
    startTransition(() => {
      router.replace(pathname, { scroll: false });
    });
    onNavigate?.();
  }

  const hasActiveFilters =
    selectedCats.length > 0 ||
    selectedBrands.length > 0 ||
    selectedTypes.length > 0 ||
    selectedSkin.length > 0 ||
    !!selectedRating ||
    inStock ||
    onSale ||
    !!minPrice ||
    !!maxPrice;

  return (
    <div className="flex flex-col gap-8">
      {!hideTitle ? (
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-xl">Filters</h3>
          {hasActiveFilters && (
            <button onClick={clearAll} className="text-xs text-rose-gold-dark hover:underline cursor-pointer">
              Clear all
            </button>
          )}
        </div>
      ) : (
        hasActiveFilters && (
          <button onClick={clearAll} className="text-xs text-rose-gold-dark hover:underline cursor-pointer self-end -mb-4">
            Clear all
          </button>
        )
      )}

      {!hideCategoryFilter && (
        <FilterGroup title="Category">
          {categories.map((c) => (
            <FilterCheckboxRow
              key={c.id}
              label={c.name}
              checked={selectedCats.includes(c.slug)}
              onChange={() => toggleListParam("cat", c.slug, selectedCats)}
            />
          ))}
        </FilterGroup>
      )}

      <FilterGroup title="Price Range">
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            onBlur={applyPriceRange}
            className="h-10 w-full rounded-lg border border-line px-3 text-sm focus:outline-none focus:border-rose-gold"
          />
          <span className="text-ink-mute">–</span>
          <input
            type="number"
            min={0}
            placeholder={`Max ${Math.ceil(facets.maxPrice)}`}
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            onBlur={applyPriceRange}
            className="h-10 w-full rounded-lg border border-line px-3 text-sm focus:outline-none focus:border-rose-gold"
          />
        </div>
      </FilterGroup>

      <FilterGroup title="Rating">
        {[4, 3, 2].map((r) => (
          <button
            key={r}
            onClick={() =>
              update((params) => {
                if (selectedRating === String(r)) params.delete("rating");
                else params.set("rating", String(r));
              })
            }
            className={cn(
              "flex items-center gap-2 py-1 cursor-pointer text-sm",
              selectedRating === String(r) ? "text-ink font-medium" : "text-ink-soft"
            )}
          >
            <Rating value={r} size={13} /> &amp; up
          </button>
        ))}
      </FilterGroup>

      <FilterGroup title="Availability">
        <FilterCheckboxRow
          label="In Stock Only"
          checked={inStock}
          onChange={() =>
            update((params) => {
              if (inStock) params.delete("stock");
              else params.set("stock", "1");
            })
          }
        />
        <FilterCheckboxRow
          label="On Sale"
          checked={onSale}
          onChange={() =>
            update((params) => {
              if (onSale) params.delete("sale");
              else params.set("sale", "1");
            })
          }
        />
      </FilterGroup>

      {facets.brands.length > 0 && (
        <FilterGroup title="Brand">
          {facets.brands.map((b) => (
            <FilterCheckboxRow
              key={b.slug}
              label={`${b.name} (${b.count})`}
              checked={selectedBrands.includes(b.slug)}
              onChange={() => toggleListParam("brand", b.slug, selectedBrands)}
            />
          ))}
        </FilterGroup>
      )}

      {facets.productTypes.length > 0 && (
        <FilterGroup title="Product Type">
          {facets.productTypes.map((t) => (
            <FilterCheckboxRow
              key={t.name}
              label={`${t.name} (${t.count})`}
              checked={selectedTypes.includes(t.name)}
              onChange={() => toggleListParam("type", t.name, selectedTypes)}
            />
          ))}
        </FilterGroup>
      )}

      <FilterGroup title="Skin Type">
        {SKIN_TYPES.map((s) => (
          <FilterCheckboxRow
            key={s}
            label={s}
            checked={selectedSkin.includes(s)}
            onChange={() => toggleListParam("skin", s, selectedSkin)}
          />
        ))}
      </FilterGroup>

      <Button variant="secondary" className="lg:hidden" onClick={onNavigate}>
        Show Results
      </Button>
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 pb-7 border-b border-line last:border-0">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-ink">{title}</h4>
      <div className="flex flex-col gap-2.5">{children}</div>
    </div>
  );
}

function FilterCheckboxRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer text-sm text-ink-soft hover:text-ink transition-colors">
      <Checkbox checked={checked} onCheckedChange={onChange} />
      {label}
    </label>
  );
}
