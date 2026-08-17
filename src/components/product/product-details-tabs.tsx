"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Check } from "lucide-react";
import { fromJsonArray } from "@/lib/json";
import type { ProductDetail } from "@/lib/data/products";

export function ProductDetailsTabs({ product }: { product: ProductDetail }) {
  const benefits = fromJsonArray(product.benefits);
  const skinType = fromJsonArray(product.skinType);

  return (
    <Tabs defaultValue="description">
      <TabsList>
        <TabsTrigger value="description">Description</TabsTrigger>
        {benefits.length > 0 && <TabsTrigger value="benefits">Benefits</TabsTrigger>}
        {product.ingredients && <TabsTrigger value="ingredients">Ingredients</TabsTrigger>}
        {product.howToUse && <TabsTrigger value="how-to-use">How to Use</TabsTrigger>}
      </TabsList>

      <TabsContent value="description">
        <div className="max-w-2xl flex flex-col gap-4">
          <p className="text-ink-soft leading-relaxed">{product.description}</p>
          {skinType.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold uppercase tracking-wider text-ink">Best for:</span>
              {skinType.map((s) => (
                <span key={s} className="text-xs bg-ivory rounded-full px-3 py-1 text-ink-soft">
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>
      </TabsContent>

      {benefits.length > 0 && (
        <TabsContent value="benefits">
          <ul className="max-w-2xl flex flex-col gap-3">
            {benefits.map((b) => (
              <li key={b} className="flex items-start gap-3 text-ink-soft">
                <Check size={16} className="text-rose-gold-dark shrink-0 mt-0.5" />
                {b}
              </li>
            ))}
          </ul>
        </TabsContent>
      )}

      {product.ingredients && (
        <TabsContent value="ingredients">
          <p className="max-w-2xl text-ink-soft leading-relaxed">{product.ingredients}</p>
        </TabsContent>
      )}

      {product.howToUse && (
        <TabsContent value="how-to-use">
          <p className="max-w-2xl text-ink-soft leading-relaxed">{product.howToUse}</p>
        </TabsContent>
      )}
    </Tabs>
  );
}
