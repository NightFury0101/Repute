"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, X, ShoppingBag } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { PromoCodeForm } from "@/components/cart/promo-code-form";
import { OrderSummary } from "@/components/checkout/order-summary";
import { ProductRail } from "@/components/home/product-rail";
import { useCartStore } from "@/store/cart-store";
import { formatPrice } from "@/lib/utils";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/constants";
import type { ProductListItem } from "@/lib/data/products";

export function CartPageClient({ recommended }: { recommended: ProductListItem[] }) {
  const items = useCartStore((s) => s.items);
  const saved = useCartStore((s) => s.saved);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const saveForLater = useCartStore((s) => s.saveForLater);
  const moveToCart = useCartStore((s) => s.moveToCart);
  const removeSaved = useCartStore((s) => s.removeSaved);
  const subtotal = useCartStore((s) => s.subtotal());
  const hasHydrated = useCartStore((s) => s.hasHydrated);

  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  return (
    <div className="py-10 sm:py-14">
      <Container>
        <h1 className="font-serif text-4xl sm:text-5xl text-ink">Shopping Bag</h1>

        {!hasHydrated ? null : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-5 py-24 text-center">
            <ShoppingBag size={44} className="text-ink-mute" strokeWidth={1.2} />
            <p className="text-ink-soft text-lg">Your bag is empty.</p>
            <Button asChild size="lg">
              <Link href="/shop">Continue Shopping</Link>
            </Button>
          </div>
        ) : (
          <div className="mt-10 grid lg:grid-cols-[1fr_380px] gap-12">
            <div>
              {remainingForFreeShipping > 0 ? (
                <div className="rounded-full bg-blush/40 px-5 py-3 text-sm text-ink-soft mb-6">
                  Add <strong>{formatPrice(remainingForFreeShipping)}</strong> more for free standard shipping.
                </div>
              ) : (
                <div className="rounded-full bg-emerald-50 px-5 py-3 text-sm text-emerald-800 mb-6">
                  🎉 You&apos;ve unlocked free standard shipping.
                </div>
              )}

              <div className="flex flex-col divide-y divide-line">
                {items.map((item) => (
                  <div key={item.key} className="flex gap-5 py-6">
                    <Link href={`/product/${item.slug}`} className="relative h-32 w-28 shrink-0 overflow-hidden rounded-xl bg-cream">
                      {item.image && <Image src={item.image} alt={item.name} fill className="object-cover" sizes="120px" />}
                    </Link>
                    <div className="flex-1 min-w-0 flex flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-xs uppercase tracking-wider text-ink-mute">{item.brand}</p>
                          <Link href={`/product/${item.slug}`} className="font-medium text-ink hover:underline">
                            {item.name}
                          </Link>
                          {item.variantName && <p className="text-sm text-ink-mute mt-0.5">{item.variantName}</p>}
                        </div>
                        <button
                          onClick={() => removeItem(item.key)}
                          className="text-ink-mute hover:text-ink cursor-pointer shrink-0"
                          aria-label="Remove item"
                        >
                          <X size={18} />
                        </button>
                      </div>

                      <div className="mt-auto flex items-center justify-between pt-4">
                        <div className="flex items-center border border-line rounded-full">
                          <button
                            onClick={() => updateQuantity(item.key, item.quantity - 1)}
                            className="h-9 w-9 flex items-center justify-center cursor-pointer text-ink-soft hover:text-ink"
                          >
                            <Minus size={13} />
                          </button>
                          <span className="w-7 text-center text-sm">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.key, item.quantity + 1)}
                            disabled={item.quantity >= item.maxStock}
                            className="h-9 w-9 flex items-center justify-center cursor-pointer text-ink-soft hover:text-ink disabled:opacity-30"
                          >
                            <Plus size={13} />
                          </button>
                        </div>
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => saveForLater(item.key)}
                            className="text-xs text-ink-mute hover:text-ink underline underline-offset-2 cursor-pointer"
                          >
                            Save for later
                          </button>
                          <p className="font-medium text-ink">{formatPrice(item.price * item.quantity)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {saved.length > 0 && (
                <div className="mt-14">
                  <h3 className="font-serif text-2xl mb-5">Saved for Later ({saved.length})</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {saved.map((item) => (
                      <div key={item.key} className="flex gap-4 rounded-xl border border-line p-3">
                        <div className="relative h-20 w-16 shrink-0 rounded-lg overflow-hidden bg-cream">
                          {item.image && <Image src={item.image} alt={item.name} fill className="object-cover" sizes="60px" />}
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col">
                          <p className="text-sm text-ink line-clamp-1">{item.name}</p>
                          <p className="text-sm text-ink-mute mt-0.5">{formatPrice(item.price)}</p>
                          <div className="mt-auto flex items-center gap-3">
                            <button
                              onClick={() => moveToCart(item.key)}
                              className="text-xs font-medium text-ink underline underline-offset-2 cursor-pointer"
                            >
                              Move to Bag
                            </button>
                            <button
                              onClick={() => removeSaved(item.key)}
                              className="text-xs text-ink-mute hover:text-ink cursor-pointer"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-5">
              <OrderSummary showItems={false} />
              <PromoCodeForm />
              <Button asChild size="lg" className="w-full">
                <Link href="/checkout">Proceed to Checkout</Link>
              </Button>
              <Link href="/shop" className="text-center text-sm text-ink-soft hover:text-ink underline underline-offset-2">
                Continue Shopping
              </Link>
            </div>
          </div>
        )}
      </Container>

      {recommended.length > 0 && (
        <div className="mt-24">
          <ProductRail
            eyebrow="You May Also Like"
            title="Complete the Ritual"
            products={recommended}
            viewAllHref="/shop"
            tinted
          />
        </div>
      )}
    </div>
  );
}
