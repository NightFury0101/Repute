"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Truck, RotateCcw, ShieldCheck, Minus, Plus, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { Rating } from "@/components/ui/rating";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WishlistButton } from "@/components/product/wishlist-button";
import { useCartStore } from "@/store/cart-store";
import { formatPrice, cn } from "@/lib/utils";
import type { ProductDetail } from "@/lib/data/products";

export function ProductInfo({ product }: { product: ProductDetail }) {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const setCartOpen = useCartStore((s) => s.setOpen);

  const variantType = product.variants[0]?.type as "shade" | "size" | undefined;
  const options = useMemo(
    () => product.variants.filter((v) => v.type === variantType),
    [product.variants, variantType]
  );
  const [selectedId, setSelectedId] = useState<string | undefined>(options[0]?.id);
  const selected = options.find((o) => o.id === selectedId);
  const [quantity, setQuantity] = useState(1);

  const hasDiscount = product.discountPrice != null && product.discountPrice < product.price;
  const effectivePrice = selected?.priceOverride ?? product.discountPrice ?? product.price;
  const compareAtPrice = selected?.priceOverride ? undefined : hasDiscount ? product.price : undefined;
  const stock = selected ? selected.stock : product.stock;
  const outOfStock = stock <= 0;
  const lowStock = stock > 0 && stock <= product.lowStockAt;
  const image = product.images[0]?.url ?? null;

  function buildCartItem() {
    return {
      productId: product.id,
      variantId: selected?.id ?? null,
      name: product.name,
      slug: product.slug,
      brand: product.brand.name,
      image,
      price: effectivePrice,
      compareAtPrice: compareAtPrice ?? null,
      variantName: selected?.name ?? null,
      maxStock: stock,
    };
  }

  function handleAddToCart() {
    if (outOfStock) return;
    addItem({ ...buildCartItem(), quantity });
  }

  function handleBuyNow() {
    if (outOfStock) return;
    addItem({ ...buildCartItem(), quantity }, false);
    setCartOpen(false);
    router.push("/checkout");
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href={`/shop?brand=${product.brand.slug}`} className="text-xs uppercase tracking-wider text-ink-mute hover:text-ink">
          {product.brand.name}
        </Link>
        <h1 className="font-serif text-3xl sm:text-4xl mt-2 text-ink">{product.name}</h1>

        <div className="flex items-center gap-3 mt-3">
          {product.reviewCount > 0 ? (
            <a href="#reviews" className="flex items-center gap-2 hover:opacity-80">
              <Rating value={product.rating} size={15} />
              <span className="text-sm text-ink-soft">
                {product.rating.toFixed(1)} ({product.reviewCount} review{product.reviewCount === 1 ? "" : "s"})
              </span>
            </a>
          ) : (
            <span className="text-sm text-ink-mute">No reviews yet</span>
          )}
          {product.isBestSeller && <Badge variant="rose">Bestseller</Badge>}
          {product.isNewArrival && <Badge variant="ink">New</Badge>}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className={cn("text-2xl font-medium", hasDiscount && "text-red-700")}>
          {formatPrice(effectivePrice)}
        </span>
        {compareAtPrice && <span className="text-lg text-ink-mute line-through">{formatPrice(compareAtPrice)}</span>}
        {hasDiscount && !selected?.priceOverride && (
          <Badge variant="sale">Save {Math.round((1 - product.discountPrice! / product.price) * 100)}%</Badge>
        )}
      </div>

      {product.shortDescription && <p className="text-ink-soft leading-relaxed">{product.shortDescription}</p>}

      <div>
        {outOfStock ? (
          <span className="text-sm font-medium text-red-700">Out of Stock</span>
        ) : lowStock ? (
          <span className="text-sm font-medium text-amber-700">Only {stock} left in stock — order soon</span>
        ) : (
          <span className="text-sm font-medium text-emerald-700 flex items-center gap-1.5">
            <Check size={15} /> In Stock
          </span>
        )}
      </div>

      {options.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-ink mb-3">
            {variantType === "shade" ? "Shade" : "Size"}
            {selected && <span className="text-ink-mute font-normal normal-case"> — {selected.name}</span>}
          </p>
          <div className="flex flex-wrap gap-2.5">
            {options.map((opt) =>
              variantType === "shade" ? (
                <button
                  key={opt.id}
                  onClick={() => setSelectedId(opt.id)}
                  title={opt.name}
                  className={cn(
                    "h-10 w-10 rounded-full border-2 transition-all cursor-pointer",
                    selectedId === opt.id ? "border-ink scale-110" : "border-transparent hover:scale-105"
                  )}
                  style={{ background: opt.swatch ?? "#ccc" }}
                >
                  <span className="sr-only">{opt.name}</span>
                </button>
              ) : (
                <button
                  key={opt.id}
                  onClick={() => setSelectedId(opt.id)}
                  disabled={opt.stock <= 0}
                  className={cn(
                    "h-11 px-4 rounded-full border text-sm transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed",
                    selectedId === opt.id ? "border-ink bg-ink text-warm-white" : "border-line hover:border-ink"
                  )}
                >
                  {opt.name}
                </button>
              )
            )}
          </div>
        </div>
      )}

      <div className="flex items-center gap-4">
        <div className="flex items-center border border-line rounded-full">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="h-12 w-11 flex items-center justify-center cursor-pointer text-ink-soft hover:text-ink"
            aria-label="Decrease quantity"
          >
            <Minus size={14} />
          </button>
          <span className="w-8 text-center text-sm">{quantity}</span>
          <button
            onClick={() => setQuantity((q) => Math.min(stock || 1, q + 1))}
            className="h-12 w-11 flex items-center justify-center cursor-pointer text-ink-soft hover:text-ink"
            aria-label="Increase quantity"
          >
            <Plus size={14} />
          </button>
        </div>
        <WishlistButton productId={product.id} variant="inline" size={22} className="p-3 border border-line rounded-full hover:border-ink" />
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button size="lg" variant="secondary" className="flex-1" onClick={handleAddToCart} disabled={outOfStock}>
          Add to Cart
        </Button>
        <Button size="lg" className="flex-1" onClick={handleBuyNow} disabled={outOfStock}>
          Buy Now
        </Button>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 pt-4 border-t border-line text-xs text-ink-soft">
        <div className="flex items-start gap-2">
          <Truck size={16} className="shrink-0 mt-0.5" />
          <span>Free shipping over $75. Standard delivery in 4–6 days.</span>
        </div>
        <div className="flex items-start gap-2">
          <RotateCcw size={16} className="shrink-0 mt-0.5" />
          <span>30-day hassle-free returns on unused items.</span>
        </div>
        <div className="flex items-start gap-2">
          <ShieldCheck size={16} className="shrink-0 mt-0.5" />
          <span>Secure checkout. Cruelty-free formulas.</span>
        </div>
      </div>
    </div>
  );
}
