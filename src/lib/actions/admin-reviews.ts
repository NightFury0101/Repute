"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { recomputeProductRating } from "@/lib/data/reviews";

export async function setReviewStatus(id: string, status: "PENDING" | "APPROVED" | "HIDDEN") {
  await requireAdmin();
  const review = await prisma.review.update({ where: { id }, data: { status } });
  await recomputeProductRating(review.productId);
  revalidatePath("/admin/reviews");
  return { success: true as const };
}

export async function deleteReview(id: string) {
  await requireAdmin();
  const review = await prisma.review.delete({ where: { id } });
  await recomputeProductRating(review.productId);
  revalidatePath("/admin/reviews");
  return { success: true as const };
}
