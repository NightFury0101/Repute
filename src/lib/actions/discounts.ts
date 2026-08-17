"use server";

import { prisma } from "@/lib/db";

export interface DiscountPreview {
  code: string;
  type: "PERCENTAGE" | "FIXED";
  value: number;
  amount: number;
}

export async function validateDiscountCode(
  code: string,
  subtotal: number,
  cartProductIds: string[] = [],
  cartCategoryIds: string[] = []
): Promise<{ ok: true; discount: DiscountPreview } | { ok: false; error: string }> {
  const trimmed = code.trim().toUpperCase();
  if (!trimmed) return { ok: false, error: "Enter a promo code." };

  const discount = await prisma.discount.findUnique({ where: { code: trimmed } });
  if (!discount || !discount.isActive) {
    return { ok: false, error: "This promo code is invalid or has expired." };
  }
  const now = new Date();
  if (discount.startsAt && now < discount.startsAt) {
    return { ok: false, error: "This promo code isn't active yet." };
  }
  if (discount.endsAt && now > discount.endsAt) {
    return { ok: false, error: "This promo code has expired." };
  }
  if (discount.usageLimit && discount.usedCount >= discount.usageLimit) {
    return { ok: false, error: "This promo code has reached its usage limit." };
  }
  if (discount.minSubtotal && subtotal < discount.minSubtotal) {
    return {
      ok: false,
      error: `Spend at least $${discount.minSubtotal.toFixed(2)} to use this code.`,
    };
  }
  if (discount.productId && !cartProductIds.includes(discount.productId)) {
    return { ok: false, error: "This code only applies to a specific product not in your cart." };
  }
  if (discount.categoryId && !cartCategoryIds.includes(discount.categoryId)) {
    return { ok: false, error: "This code only applies to a specific category not in your cart." };
  }

  const amount =
    discount.type === "PERCENTAGE"
      ? Math.round(subtotal * (discount.value / 100) * 100) / 100
      : Math.min(discount.value, subtotal);

  return {
    ok: true,
    discount: { code: discount.code, type: discount.type as "PERCENTAGE" | "FIXED", value: discount.value, amount },
  };
}
