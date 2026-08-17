"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { addressSchema } from "@/lib/validations";
import type { ActionResult } from "@/lib/actions/auth";

export async function upsertAddress(input: unknown): Promise<ActionResult<{ id: string }>> {
  const user = await requireUser();
  const parsed = addressSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] = issue.message;
    return { success: false, error: "Please check the form for errors.", fieldErrors };
  }
  const data = parsed.data;

  if (data.isDefault) {
    await prisma.address.updateMany({
      where: { userId: user.id },
      data: { isDefault: false },
    });
  }

  const address = data.id
    ? await prisma.address.update({
        where: { id: data.id, userId: user.id },
        data: {
          label: data.label,
          fullName: data.fullName,
          phone: data.phone,
          line1: data.line1,
          line2: data.line2 || null,
          city: data.city,
          state: data.state || null,
          postalCode: data.postalCode,
          country: data.country,
          isDefault: !!data.isDefault,
        },
      })
    : await prisma.address.create({
        data: {
          userId: user.id,
          label: data.label,
          fullName: data.fullName,
          phone: data.phone,
          line1: data.line1,
          line2: data.line2 || null,
          city: data.city,
          state: data.state || null,
          postalCode: data.postalCode,
          country: data.country,
          isDefault: !!data.isDefault,
        },
      });

  revalidatePath("/account/addresses");
  return { success: true, data: { id: address.id } };
}

export async function deleteAddress(id: string) {
  const user = await requireUser();
  await prisma.address.deleteMany({ where: { id, userId: user.id } });
  revalidatePath("/account/addresses");
  return { success: true as const };
}

export async function setDefaultAddress(id: string) {
  const user = await requireUser();
  await prisma.address.updateMany({ where: { userId: user.id }, data: { isDefault: false } });
  await prisma.address.updateMany({ where: { id, userId: user.id }, data: { isDefault: true } });
  revalidatePath("/account/addresses");
  return { success: true as const };
}
