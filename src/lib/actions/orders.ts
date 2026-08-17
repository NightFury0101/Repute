"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { checkoutSchema } from "@/lib/validations";
import { DELIVERY_METHODS, FREE_SHIPPING_THRESHOLD } from "@/lib/constants";
import { validateDiscountCode } from "@/lib/actions/discounts";
import type { ActionResult } from "@/lib/actions/auth";

function generateOrderNumber() {
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `RP-${Date.now().toString(36).toUpperCase()}-${rand}`;
}

export async function placeOrder(
  input: unknown
): Promise<ActionResult<{ orderId: string; orderNumber: string }>> {
  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] = issue.message;
    return { success: false, error: "Please check the form for errors.", fieldErrors };
  }
  const data = parsed.data;
  const session = await auth();

  const productIds = [...new Set(data.items.map((i) => i.productId))];
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    include: { images: { take: 1, orderBy: { sortOrder: "asc" } }, variants: true },
  });
  const productMap = new Map(products.map((p) => [p.id, p]));

  const lineItems: {
    productId: string;
    variantId: string | null;
    productName: string;
    productImage: string | null;
    variantName: string | null;
    price: number;
    quantity: number;
  }[] = [];

  for (const item of data.items) {
    const product = productMap.get(item.productId);
    if (!product || !product.isActive) {
      return { success: false, error: `A product in your cart is no longer available.` };
    }
    const variant = item.variantId ? product.variants.find((v) => v.id === item.variantId) : null;
    if (item.variantId && !variant) {
      return { success: false, error: `A selected option for "${product.name}" is no longer available.` };
    }
    const availableStock = variant ? variant.stock : product.stock;
    if (availableStock < item.quantity) {
      return {
        success: false,
        error: `Only ${availableStock} left in stock for "${product.name}"${variant ? ` (${variant.name})` : ""}.`,
      };
    }
    const price = variant?.priceOverride ?? product.discountPrice ?? product.price;
    lineItems.push({
      productId: product.id,
      variantId: variant?.id ?? null,
      productName: product.name,
      productImage: product.images[0]?.url ?? null,
      variantName: variant?.name ?? null,
      price,
      quantity: item.quantity,
    });
  }

  const subtotal = lineItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

  let discountTotal = 0;
  let promoCode: string | null = null;
  if (data.promoCode && data.promoCode.trim()) {
    const categoryIds = [...new Set(products.map((p) => p.categoryId))];
    const result = await validateDiscountCode(data.promoCode, subtotal, productIds, categoryIds);
    if (!result.ok) {
      return { success: false, error: result.error };
    }
    discountTotal = result.discount.amount;
    promoCode = result.discount.code;
  }

  const deliveryDef = DELIVERY_METHODS.find((d) => d.id === data.deliveryMethod)!;
  let shippingCost: number = deliveryDef.price;
  if (data.deliveryMethod === "STANDARD" && subtotal - discountTotal >= FREE_SHIPPING_THRESHOLD) {
    shippingCost = 0;
  }
  const total = Math.max(0, subtotal - discountTotal + shippingCost);

  let userId = session?.user?.id ?? null;
  if (!userId) {
    const email = data.email.toLowerCase().trim();
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      userId = existing.id;
    } else {
      const guest = await prisma.user.create({
        data: { email, name: data.fullName, phone: data.phone, role: "CUSTOMER" },
      });
      userId = guest.id;
    }
  }

  const orderNumber = generateOrderNumber();

  try {
    const order = await prisma.$transaction(async (tx) => {
      let addressId: string | null = null;
      if (session?.user?.id && data.saveAddress) {
        const addr = await tx.address.create({
          data: {
            userId: session.user.id,
            label: "Checkout",
            fullName: data.fullName,
            phone: data.phone,
            line1: data.line1,
            line2: data.line2 || null,
            city: data.city,
            state: data.state || null,
            postalCode: data.postalCode,
            country: data.country,
          },
        });
        addressId = addr.id;
      }

      const created = await tx.order.create({
        data: {
          orderNumber,
          userId: userId!,
          email: data.email.toLowerCase().trim(),
          phone: data.phone,
          addressId,
          shippingName: data.fullName,
          shippingLine1: data.line1,
          shippingLine2: data.line2 || null,
          shippingCity: data.city,
          shippingState: data.state || null,
          shippingPostal: data.postalCode,
          shippingCountry: data.country,
          deliveryMethod: data.deliveryMethod,
          paymentMethod: data.paymentMethod,
          subtotal,
          discountTotal,
          shippingCost,
          total,
          promoCode,
          notes: data.notes || null,
          items: { create: lineItems },
          statusHistory: { create: { status: "PENDING", note: "Order placed" } },
        },
      });

      for (const item of lineItems) {
        if (item.variantId) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { decrement: item.quantity } },
          });
        }
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      if (promoCode) {
        await tx.discount.update({
          where: { code: promoCode },
          data: { usedCount: { increment: 1 } },
        });
      }

      return created;
    });

    return { success: true, data: { orderId: order.id, orderNumber: order.orderNumber } };
  } catch {
    return { success: false, error: "Something went wrong placing your order. Please try again." };
  }
}

export async function getOrderByNumber(orderNumber: string, userId?: string) {
  return prisma.order.findFirst({
    where: { orderNumber, ...(userId ? { userId } : {}) },
    include: { items: true, statusHistory: { orderBy: { createdAt: "asc" } }, user: true },
  });
}

export async function getOrdersForUser(userId: string) {
  return prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });
}
