"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { bannerFormSchema } from "@/lib/validations";
import type { HomepageSettings } from "@/lib/data/settings";
import type { ActionResult } from "@/lib/actions/auth";

export async function updateHomepageSettings(
  partial: Partial<HomepageSettings>
): Promise<ActionResult> {
  await requireAdmin();
  await Promise.all(
    Object.entries(partial).map(([key, value]) =>
      prisma.siteSetting.upsert({
        where: { key: `homepage.${key}` },
        update: { value: JSON.stringify(value) },
        create: { key: `homepage.${key}`, value: JSON.stringify(value) },
      })
    )
  );
  revalidatePath("/");
  revalidatePath("/admin/homepage");
  return { success: true, data: undefined };
}

export async function saveBanner(input: unknown): Promise<ActionResult<{ id: string }>> {
  await requireAdmin();
  const parsed = bannerFormSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] = issue.message;
    return { success: false, error: "Please check the form for errors.", fieldErrors };
  }
  const data = parsed.data;

  const payload = {
    placement: data.placement,
    title: data.title,
    subtitle: data.subtitle || null,
    ctaLabel: data.ctaLabel || null,
    ctaLink: data.ctaLink || null,
    ctaLabel2: data.ctaLabel2 || null,
    ctaLink2: data.ctaLink2 || null,
    image: data.image || null,
    isActive: data.isActive ?? true,
  };

  const banner = data.id
    ? await prisma.banner.update({ where: { id: data.id }, data: payload })
    : await prisma.banner.create({
        data: { ...payload, sortOrder: await prisma.banner.count({ where: { placement: data.placement } }) },
      });

  revalidatePath("/");
  revalidatePath("/admin/homepage");
  return { success: true, data: { id: banner.id } };
}

export async function deleteBanner(id: string) {
  await requireAdmin();
  await prisma.banner.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/admin/homepage");
  return { success: true as const };
}

export async function setFeaturedProducts(productIds: string[]) {
  await requireAdmin();
  await prisma.product.updateMany({ data: { isFeatured: false } });
  await prisma.product.updateMany({ where: { id: { in: productIds } }, data: { isFeatured: true } });
  revalidatePath("/");
  revalidatePath("/admin/homepage");
  return { success: true as const };
}
