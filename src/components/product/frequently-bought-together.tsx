"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart-store";
import { formatPrice } from "@/lib/utils";
import type { ProductDetail, ProductListItem } from "@/lib/data/products";

export function FrequentlyBoughtTogether({
  product,
  bundled,
}: {
  product: ProductDetail;
  bundled: ProductListItem[];
}) {
  const addItem = useCartStore((s) => s.addItem);
  const [selected, setSelected] = useState<Set<string>>(new Set(bundled.map((p) => p.id)));

  const items = [
    { id: product.id, name: product.name, slug: product.slug, brand: product.brand, price: product.discountPrice ?? product.price, image: product.images[0]?.url ?? null, variants: product.variants, stock: product.stock },
    ...bundled.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      brand: p.brand,
      price: p.discountPrice ?? p.price,
      image: p.images[0]?.url ?? null,
      variants: p.variants,
      stock: p.stock,
    })),
  ];

  const total = items
    .filter((i) => i.id === product.id || selected.has(i.id))
    .reduce((sum, i) => sum + i.price, 0);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function addAllToCart() {
    for (const item of items) {
      if (item.id !== product.id && !selected.has(item.id)) continue;
      addItem(
        {
          productId: item.id,
          variantId: item.variants[0]?.id ?? null,
          name: item.name,
          slug: item.slug,
          brand: item.brand.name,
          image: item.image,
          price: item.variants[0]?.priceOverride ?? item.price,
          compareAtPrice: null,
          variantName: item.variants[0]?.name ?? null,
          maxStock: item.variants[0]?.stock ?? item.stock,
          quantity: 1,
        },
        false
      );
    }
  }

  if (!bundled.length) return null;

  return (
    <div>
      <h2 className="font-serif text-3xl text-ink mb-8">Frequently Bought Together</h2>
      <div className="flex flex-col lg:flex-row gap-8 items-start bg-ivory rounded-3xl p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-4">
          {items.map((item, i) => (
            <div key={item.id} className="flex items-center gap-4">
              <label className="flex flex-col items-center gap-2 cursor-pointer w-28">
                <div className="relative h-28 w-24 rounded-xl overflow-hidden bg-warm-white">
                  {item.image && <Image src={item.image} alt={item.name} fill className="object-cover" sizes="100px" />}
                </div>
                <div className="flex items-center gap-1.5">
                  {item.id === product.id ? (
                    <Checkbox checked disabled />
                  ) : (
                    <Checkbox checked={selected.has(item.id)} onCheckedChange={() => toggle(item.id)} />
                  )}
                  <Link href={`/product/${item.slug}`} className="text-xs text-ink text-center hover:underline line-clamp-2">
                    {item.name}
                  </Link>
                </div>
                <span className="text-xs text-ink-mute">{formatPrice(item.price)}</span>
              </label>
              {i < items.length - 1 && <Plus size={16} className="text-ink-mute shrink-0" />}
            </div>
          ))}
        </div>

        <div className="lg:ml-auto flex flex-col items-start lg:items-end gap-3 shrink-0">
          <p className="text-sm text-ink-soft">
            Total for {selected.size + 1} items: <span className="font-medium text-ink">{formatPrice(total)}</span>
          </p>
          <Button onClick={addAllToCart}>Add Selected to Cart</Button>
        </div>
      </div>
    </div>
  );
}
