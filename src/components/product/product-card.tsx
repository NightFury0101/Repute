"use client";

import Image from "next/image";
import Link from "next/link";
import { Zap } from "lucide-react";
import { Rating } from "@/components/ui/rating";
import { Badge } from "@/components/ui/badge";
import { WishlistButton } from "@/components/product/wishlist-button";
import { AddToCartButton } from "@/components/product/add-to-cart-button";
import { QuickViewTrigger } from "@/components/product/quick-view-modal";
import { formatPrice, cn } from "@/lib/utils";
import type { ProductListItem } from "@/lib/data/products";

export function ProductCard({
  product,
  className,
  priority,
}: {
  product: ProductListItem;
  className?: string;
  priority?: boolean;
}) {
  const image = product.images[0]?.url ?? "/generated/og-image.jpg";
  const hoverImage = product.images[1]?.url ?? image;
  const hasDiscount = product.discountPrice != null && product.discountPrice < product.price;
  const discountPct = hasDiscount
    ? Math.round((1 - product.discountPrice! / product.price) * 100)
    : 0;
  const outOfStock = product.stock <= 0;
  const defaultVariant = product.variants[0];

  return (
    <div className={cn("group relative flex flex-col", className)}>
      <Link
        href={`/product/${product.slug}`}
        className="relative block aspect-[4/5] w-full overflow-hidden rounded-2xl bg-cream"
      >
        <Image
          src={image}
          alt={product.images[0]?.alt ?? product.name}
          fill
          priority={priority}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 22vw"
          className={cn(
            "object-cover transition-opacity duration-500",
            hoverImage !== image && "group-hover:opacity-0"
          )}
        />
        {hoverImage !== image && (
          <Image
            src={hoverImage}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 22vw"
            className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          />
        )}

        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {hasDiscount && <Badge variant="sale">-{discountPct}%</Badge>}
          {product.isNewArrival && <Badge variant="ink">New</Badge>}
          {product.isBestSeller && !product.isNewArrival && <Badge variant="rose">Bestseller</Badge>}
          {outOfStock && <Badge variant="muted">Sold Out</Badge>}
        </div>

        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
          <WishlistButton productId={product.id} />
          <QuickViewTrigger product={product} className="hidden sm:flex" />
        </div>

        <div className="absolute inset-x-3 bottom-3 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hidden sm:block">
          <AddToCartButton
            item={{
              productId: product.id,
              variantId: defaultVariant?.id ?? null,
              name: product.name,
              slug: product.slug,
              brand: product.brand.name,
              image,
              price: defaultVariant?.priceOverride ?? product.discountPrice ?? product.price,
              compareAtPrice: hasDiscount ? product.price : null,
              variantName: defaultVariant?.name ?? null,
              maxStock: defaultVariant?.stock ?? product.stock,
            }}
            openDrawer={false}
            disabled={outOfStock}
            variant="primary"
            size="sm"
            className="w-full backdrop-blur"
          >
            <span className="flex items-center justify-center gap-1.5">
              <Zap size={14} /> Quick Add
            </span>
          </AddToCartButton>
        </div>
      </Link>

      <div className="mt-3.5 flex flex-col gap-1">
        <p className="text-[0.65rem] uppercase tracking-wider text-ink-mute">{product.brand.name}</p>
        <Link href={`/product/${product.slug}`} className="text-sm font-medium text-ink hover:underline line-clamp-1">
          {product.name}
        </Link>
        {product.reviewCount > 0 && (
          <div className="flex items-center gap-1.5">
            <Rating value={product.rating} size={12} />
            <span className="text-xs text-ink-mute">({product.reviewCount})</span>
          </div>
        )}
        <div className="flex items-center gap-2 mt-0.5">
          <span className={cn("text-sm font-medium", hasDiscount && "text-red-700")}>
            {formatPrice(defaultVariant?.priceOverride ?? product.discountPrice ?? product.price)}
          </span>
          {hasDiscount && (
            <span className="text-xs text-ink-mute line-through">{formatPrice(product.price)}</span>
          )}
        </div>
      </div>
    </div>
  );
}
