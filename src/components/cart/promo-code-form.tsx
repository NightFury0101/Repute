"use client";

import { useState, useTransition } from "react";
import { Tag, X } from "lucide-react";
import { toast } from "sonner";
import { useCartStore } from "@/store/cart-store";
import { validateDiscountCode } from "@/lib/actions/discounts";
import { formatPrice } from "@/lib/utils";

export function PromoCodeForm() {
  const [code, setCode] = useState("");
  const [isPending, startTransition] = useTransition();
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.subtotal());
  const promoCode = useCartStore((s) => s.promoCode);
  const discountAmount = useCartStore((s) => s.discountAmount);
  const applyPromo = useCartStore((s) => s.applyPromo);
  const clearPromo = useCartStore((s) => s.clearPromo);

  function handleApply(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    startTransition(async () => {
      const result = await validateDiscountCode(
        code,
        subtotal,
        items.map((i) => i.productId)
      );
      if (result.ok) {
        applyPromo(result.discount.code, result.discount.amount);
        toast.success(`Promo code ${result.discount.code} applied`);
        setCode("");
      } else {
        toast.error(result.error);
      }
    });
  }

  if (promoCode) {
    return (
      <div className="flex items-center justify-between rounded-full bg-emerald-50 px-4 py-2.5 text-sm text-emerald-800">
        <span className="flex items-center gap-2">
          <Tag size={14} /> {promoCode} applied (-{formatPrice(discountAmount)})
        </span>
        <button onClick={clearPromo} className="cursor-pointer hover:opacity-70" aria-label="Remove promo code">
          <X size={15} />
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleApply} className="flex items-center gap-2">
      <input
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Promo code"
        className="h-11 flex-1 rounded-full border border-line px-4 text-sm focus:outline-none focus:border-rose-gold"
      />
      <button
        type="submit"
        disabled={isPending}
        className="h-11 px-5 rounded-full border border-ink text-sm font-medium hover:bg-ink hover:text-warm-white transition-colors cursor-pointer disabled:opacity-50"
      >
        Apply
      </button>
    </form>
  );
}
