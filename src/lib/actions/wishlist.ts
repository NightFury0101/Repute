"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function getWishlistIds(): Promise<string[]> {
  const session = await auth();
  if (!session?.user?.id) return [];
  const items = await prisma.wishlistItem.findMany({
    where: { userId: session.user.id },
    select: { productId: true },
  });
  return items.map((i) => i.productId);
}

export async function getWishlistProducts() {
  const session = await auth();
  if (!session?.user?.id) return [];
  const items = await prisma.wishlistItem.findMany({
    where: { userId: session.user.id },
    include: {
      product: {
        include: { images: { orderBy: { sortOrder: "asc" } }, brand: true, category: true, variants: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  return items.map((i) => i.product);
}

export async function toggleWishlist(
  productId: string
): Promise<{ ok: true; inWishlist: boolean } | { ok: false; reason: "UNAUTHENTICATED" }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, reason: "UNAUTHENTICATED" };
  }
  const userId = session.user.id;

  const existing = await prisma.wishlistItem.findUnique({
    where: { userId_productId: { userId, productId } },
  });

  if (existing) {
    await prisma.wishlistItem.delete({ where: { id: existing.id } });
    revalidatePath("/wishlist");
    return { ok: true, inWishlist: false };
  }

  await prisma.wishlistItem.create({ data: { userId, productId } });
  revalidatePath("/wishlist");
  return { ok: true, inWishlist: true };
}

export async function removeFromWishlist(productId: string) {
  const session = await auth();
  if (!session?.user?.id) return { ok: false as const };
  await prisma.wishlistItem.deleteMany({
    where: { userId: session.user.id, productId },
  });
  revalidatePath("/wishlist");
  return { ok: true as const };
}
