"use client";

import Image from "next/image";
import { useCartStore } from "@/store/cart-store";
import { formatPrice } from "@/lib/utils";
import { DELIVERY_METHODS, FREE_SHIPPING_THRESHOLD } from "@/lib/constants";

export function OrderSummary({
  deliveryMethod = "STANDARD",
  showItems = true,
}: {
  deliveryMethod?: "STANDARD" | "EXPRESS";
  showItems?: boolean;
}) {
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.subtotal());
  const discountAmount = useCartStore((s) => s.discountAmount);
  const promoCode = useCartStore((s) => s.promoCode);

  const deliveryDef = DELIVERY_METHODS.find((d) => d.id === deliveryMethod)!;
  const afterDiscount = Math.max(0, subtotal - discountAmount);
  const shippingCost = deliveryMethod === "STANDARD" && afterDiscount >= FREE_SHIPPING_THRESHOLD ? 0 : deliveryDef.price;
  const total = afterDiscount + shippingCost;

  return (
    <div className="rounded-2xl bg-ivory p-6 flex flex-col gap-5">
      {showItems && (
        <div className="flex flex-col gap-4 max-h-72 overflow-y-auto scrollbar-thin pr-1">
          {items.map((item) => (
            <div key={item.key} className="flex gap-3">
              <div className="relative h-16 w-14 shrink-0 rounded-lg overflow-hidden bg-warm-white">
                {item.image && <Image src={item.image} alt={item.name} fill className="object-cover" sizes="60px" />}
                <span className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-ink text-warm-white text-[0.6rem] flex items-center justify-center">
                  {item.quantity}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-ink line-clamp-1">{item.name}</p>
                {item.variantName && <p className="text-xs text-ink-mute">{item.variantName}</p>}
              </div>
              <p className="text-sm text-ink shrink-0">{formatPrice(item.price * item.quantity)}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-2.5 text-sm pt-4 border-t border-line/70">
        <div className="flex justify-between text-ink-soft">
          <span>Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        {discountAmount > 0 && (
          <div className="flex justify-between text-emerald-700">
            <span>Discount {promoCode && `(${promoCode})`}</span>
            <span>-{formatPrice(discountAmount)}</span>
          </div>
        )}
        <div className="flex justify-between text-ink-soft">
          <span>Shipping ({deliveryDef.label})</span>
          <span>{shippingCost === 0 ? "Free" : formatPrice(shippingCost)}</span>
        </div>
        <div className="flex justify-between text-base font-medium text-ink pt-2.5 border-t border-line/70">
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>
    </div>
  );
}
