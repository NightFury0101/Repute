"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { reviewSchema } from "@/lib/validations";
import { toJsonArray } from "@/lib/json";
import type { ActionResult } from "@/lib/actions/auth";

export async function submitReview(input: unknown): Promise<ActionResult<{ id: string }>> {
  const user = await requireUser();
  const parsed = reviewSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] = issue.message;
    return { success: false, error: "Please check the form for errors.", fieldErrors };
  }
  const data = parsed.data;

  const purchased = await prisma.orderItem.findFirst({
    where: { productId: data.productId, order: { userId: user.id } },
  });

  const review = await prisma.review.create({
    data: {
      productId: data.productId,
      userId: user.id,
      rating: data.rating,
      title: data.title || null,
      comment: data.comment,
      images: toJsonArray(data.images),
      isVerified: !!purchased,
      status: "PENDING",
    },
  });

  revalidatePath(`/product`);
  return { success: true, data: { id: review.id } };
}
