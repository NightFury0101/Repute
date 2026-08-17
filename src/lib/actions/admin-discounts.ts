"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { discountFormSchema } from "@/lib/validations";
import type { ActionResult } from "@/lib/actions/auth";

export async function getAdminDiscounts() {
  await requireAdmin();
  return prisma.discount.findMany({ orderBy: { createdAt: "desc" } });
}

export async function saveDiscount(input: unknown): Promise<ActionResult<{ id: string }>> {
  await requireAdmin();
  const parsed = discountFormSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] = issue.message;
    return { success: false, error: "Please check the form for errors.", fieldErrors };
  }
  const data = parsed.data;
  const code = data.code.trim().toUpperCase();

  const existing = await prisma.discount.findFirst({
    where: { code, ...(data.id ? { id: { not: data.id } } : {}) },
  });
  if (existing) {
    return { success: false, error: "Code already exists.", fieldErrors: { code: "Already exists" } };
  }

  const payload = {
    code,
    description: data.description || null,
    type: data.type,
    value: data.value,
    minSubtotal: data.minSubtotal || null,
    categoryId: data.categoryId || null,
    productId: data.productId || null,
    usageLimit: data.usageLimit || null,
    startsAt: data.startsAt ? new Date(data.startsAt) : null,
    endsAt: data.endsAt ? new Date(data.endsAt) : null,
    isActive: data.isActive ?? true,
  };

  const discount = data.id
    ? await prisma.discount.update({ where: { id: data.id }, data: payload })
    : await prisma.discount.create({ data: payload });

  revalidatePath("/admin/discounts");
  return { success: true, data: { id: discount.id } };
}

export async function deleteDiscount(id: string) {
  await requireAdmin();
  await prisma.discount.delete({ where: { id } });
  revalidatePath("/admin/discounts");
  return { success: true as const };
}

export async function toggleDiscountActive(id: string, isActive: boolean) {
  await requireAdmin();
  await prisma.discount.update({ where: { id }, data: { isActive } });
  revalidatePath("/admin/discounts");
  return { success: true as const };
}
