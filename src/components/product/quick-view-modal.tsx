"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Eye, X } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { Rating } from "@/components/ui/rating";
import { Badge } from "@/components/ui/badge";
import { WishlistButton } from "@/components/product/wishlist-button";
import { AddToCartButton } from "@/components/product/add-to-cart-button";
import { formatPrice, cn } from "@/lib/utils";
import type { ProductListItem } from "@/lib/data/products";

export function QuickViewTrigger({ product, className }: { product: ProductListItem; className?: string }) {
  const [open, setOpen] = useState(false);
  const [selectedVariantId, setSelectedVariantId] = useState(product.variants[0]?.id);
  const [activeImage, setActiveImage] = useState(0);

  // Reset selection state whenever the modal transitions to open, without an effect.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setSelectedVariantId(product.variants[0]?.id);
      setActiveImage(0);
    }
  }

  const selected = product.variants.find((v) => v.id === selectedVariantId);
  const hasDiscount = product.discountPrice != null && product.discountPrice < product.price;
  const image = product.images[activeImage]?.url ?? product.images[0]?.url ?? "/generated/og-image.jpg";
  const outOfStock = (selected ? selected.stock : product.stock) <= 0;

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          onClick={(e) => e.preventDefault()}
          className={cn(
            "h-9 w-9 rounded-full bg-warm-white/90 backdrop-blur flex items-center justify-center shadow-sm hover:scale-110 transition-transform cursor-pointer",
            className
          )}
          aria-label="Quick view"
        >
          <Eye size={16} className="text-ink" />
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-[2px] data-[state=open]:animate-fade-in" />
        <Dialog.Content className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[94vw] max-w-3xl max-h-[88vh] overflow-y-auto rounded-2xl bg-warm-white shadow-2xl focus:outline-none data-[state=open]:animate-pop">
          <Dialog.Title className="sr-only">{product.name}</Dialog.Title>
          <Dialog.Close className="absolute top-4 right-4 z-10 h-9 w-9 rounded-full bg-warm-white/90 flex items-center justify-center cursor-pointer">
            <X size={16} />
          </Dialog.Close>
          <div className="grid sm:grid-cols-2 gap-0">
            <div className="relative aspect-square sm:aspect-auto bg-cream">
              <Image src={image} alt={product.name} fill className="object-cover" sizes="(max-width: 640px) 100vw, 50vw" />
              {product.images.length > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {product.images.map((img, i) => (
                    <button
                      key={img.id}
                      onClick={() => setActiveImage(i)}
                      className={cn("h-1.5 rounded-full transition-all", i === activeImage ? "w-5 bg-ink" : "w-1.5 bg-ink/30")}
                      aria-label={`Image ${i + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
            <div className="p-6 sm:p-8 flex flex-col gap-4">
              <p className="text-xs uppercase tracking-wider text-ink-mute">{product.brand.name}</p>
              <h2 className="font-serif text-2xl text-ink">{product.name}</h2>
              {product.reviewCount > 0 && (
                <div className="flex items-center gap-2">
                  <Rating value={product.rating} size={14} />
                  <span className="text-xs text-ink-mute">({product.reviewCount})</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className={cn("text-xl font-medium", hasDiscount && "text-red-700")}>
                  {formatPrice(selected?.priceOverride ?? product.discountPrice ?? product.price)}
                </span>
                {hasDiscount && <span className="text-sm text-ink-mute line-through">{formatPrice(product.price)}</span>}
                {product.isBestSeller && <Badge variant="rose">Bestseller</Badge>}
              </div>
              {product.shortDescription && <p className="text-sm text-ink-soft leading-relaxed">{product.shortDescription}</p>}

              {product.variants.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v) =>
                    v.type === "shade" ? (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVariantId(v.id)}
                        title={v.name}
                        className={cn(
                          "h-8 w-8 rounded-full border-2",
                          selectedVariantId === v.id ? "border-ink" : "border-transparent"
                        )}
                        style={{ background: v.swatch ?? "#ccc" }}
                      />
                    ) : (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVariantId(v.id)}
                        className={cn(
                          "h-9 px-3 rounded-full border text-xs",
                          selectedVariantId === v.id ? "border-ink bg-ink text-warm-white" : "border-line"
                        )}
                      >
                        {v.name}
                      </button>
                    )
                  )}
                </div>
              )}

              <div className="flex items-center gap-3 mt-2">
                <AddToCartButton
                  item={{
                    productId: product.id,
                    variantId: selected?.id ?? null,
                    name: product.name,
                    slug: product.slug,
                    brand: product.brand.name,
                    image,
                    price: selected?.priceOverride ?? product.discountPrice ?? product.price,
                    compareAtPrice: hasDiscount ? product.price : null,
                    variantName: selected?.name ?? null,
                    maxStock: selected?.stock ?? product.stock,
                  }}
                  disabled={outOfStock}
                  className="flex-1"
                />
                <WishlistButton productId={product.id} className="border border-line" />
              </div>
              <Link href={`/product/${product.slug}`} className="text-xs text-ink underline underline-offset-2 mt-1">
                View full details →
              </Link>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
