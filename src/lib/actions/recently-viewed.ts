"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function trackRecentlyViewed(productId: string) {
  const session = await auth();
  if (!session?.user?.id) return;
  await prisma.recentlyViewed.upsert({
    where: { userId_productId: { userId: session.user.id, productId } },
    update: { viewedAt: new Date() },
    create: { userId: session.user.id, productId },
  });
}

export async function getRecentlyViewedProducts(excludeId?: string) {
  const session = await auth();
  if (!session?.user?.id) return [];
  const items = await prisma.recentlyViewed.findMany({
    where: { userId: session.user.id, ...(excludeId ? { productId: { not: excludeId } } : {}) },
    orderBy: { viewedAt: "desc" },
    take: 12,
    include: {
      product: { include: { images: { orderBy: { sortOrder: "asc" } }, brand: true, category: true, variants: true } },
    },
  });
  return items.map((i) => i.product).filter((p) => p.isActive);
}
