"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, X, ShoppingBag } from "lucide-react";
import { Sheet, SheetContent, SheetCloseButton } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart-store";
import { formatPrice } from "@/lib/utils";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/constants";

export function CartDrawer() {
  const isOpen = useCartStore((s) => s.isOpen);
  const setOpen = useCartStore((s) => s.setOpen);
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const saveForLater = useCartStore((s) => s.saveForLater);

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetContent side="right" title="Shopping cart">
        <div className="flex items-center justify-between px-6 py-5 border-b border-line">
          <h2 className="font-serif text-xl">Your Bag ({items.reduce((s, i) => s + i.quantity, 0)})</h2>
          <SheetCloseButton />
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 text-center">
            <ShoppingBag size={40} className="text-ink-mute" strokeWidth={1.2} />
            <p className="text-ink-soft">Your bag is empty.</p>
            <Button variant="secondary" onClick={() => setOpen(false)} asChild>
              <Link href="/shop">Continue Shopping</Link>
            </Button>
          </div>
        ) : (
          <>
            {remainingForFreeShipping > 0 ? (
              <div className="px-6 py-3 bg-blush/40 text-xs text-ink-soft">
                Add <strong>{formatPrice(remainingForFreeShipping)}</strong> more for free standard shipping.
              </div>
            ) : (
              <div className="px-6 py-3 bg-emerald-50 text-xs text-emerald-800">
                🎉 You&apos;ve unlocked free standard shipping.
              </div>
            )}

            <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-6 scrollbar-thin">
              {items.map((item) => (
                <div key={item.key} className="flex gap-4">
                  <Link
                    href={`/product/${item.slug}`}
                    onClick={() => setOpen(false)}
                    className="relative h-24 w-20 shrink-0 overflow-hidden rounded-lg bg-cream"
                  >
                    {item.image && (
                      <Image src={item.image} alt={item.name} fill className="object-cover" sizes="80px" />
                    )}
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[0.65rem] uppercase tracking-wider text-ink-mute">{item.brand}</p>
                        <Link
                          href={`/product/${item.slug}`}
                          onClick={() => setOpen(false)}
                          className="text-sm font-medium text-ink hover:underline line-clamp-2"
                        >
                          {item.name}
                        </Link>
                        {item.variantName && (
                          <p className="text-xs text-ink-mute mt-0.5">{item.variantName}</p>
                        )}
                      </div>
                      <button
                        onClick={() => removeItem(item.key)}
                        className="text-ink-mute hover:text-ink cursor-pointer shrink-0"
                        aria-label="Remove item"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-line rounded-full">
                        <button
                          onClick={() => updateQuantity(item.key, item.quantity - 1)}
                          className="h-7 w-7 flex items-center justify-center cursor-pointer text-ink-soft hover:text-ink"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-6 text-center text-xs">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.key, item.quantity + 1)}
                          disabled={item.quantity >= item.maxStock}
                          className="h-7 w-7 flex items-center justify-center cursor-pointer text-ink-soft hover:text-ink disabled:opacity-30"
                          aria-label="Increase quantity"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => saveForLater(item.key)}
                      className="text-xs text-ink-mute hover:text-ink underline underline-offset-2 mt-2 cursor-pointer"
                    >
                      Save for later
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-line px-6 py-5 space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-ink-soft">Subtotal</span>
                <span className="font-medium">{formatPrice(subtotal)}</span>
              </div>
              <p className="text-xs text-ink-mute">Shipping and taxes calculated at checkout.</p>
              <Button asChild size="lg" className="w-full" onClick={() => setOpen(false)}>
                <Link href="/checkout">Checkout</Link>
              </Button>
              <Button asChild variant="secondary" size="md" className="w-full" onClick={() => setOpen(false)}>
                <Link href="/cart">View Bag</Link>
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
