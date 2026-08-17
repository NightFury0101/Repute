"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { categoryFormSchema, brandFormSchema } from "@/lib/validations";
import { slugify } from "@/lib/utils";
import type { ActionResult } from "@/lib/actions/auth";

async function uniqueCategorySlug(base: string, excludeId?: string) {
  const slugBase = slugify(base);
  let slug = slugBase;
  let n = 1;
  while (
    await prisma.category.findFirst({ where: { slug, ...(excludeId ? { id: { not: excludeId } } : {}) } })
  ) {
    n += 1;
    slug = `${slugBase}-${n}`;
  }
  return slug;
}

async function uniqueBrandSlug(base: string, excludeId?: string) {
  const slugBase = slugify(base);
  let slug = slugBase;
  let n = 1;
  while (
    await prisma.brand.findFirst({ where: { slug, ...(excludeId ? { id: { not: excludeId } } : {}) } })
  ) {
    n += 1;
    slug = `${slugBase}-${n}`;
  }
  return slug;
}

export async function saveCategory(input: unknown): Promise<ActionResult<{ id: string }>> {
  await requireAdmin();
  const parsed = categoryFormSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] = issue.message;
    return { success: false, error: "Please check the form for errors.", fieldErrors };
  }
  const data = parsed.data;
  const slug = await uniqueCategorySlug(data.name, data.id);

  const category = data.id
    ? await prisma.category.update({
        where: { id: data.id },
        data: {
          name: data.name,
          slug,
          description: data.description || null,
          image: data.image || null,
          isActive: data.isActive ?? true,
        },
      })
    : await prisma.category.create({
        data: {
          name: data.name,
          slug,
          description: data.description || null,
          image: data.image || null,
          isActive: data.isActive ?? true,
          sortOrder: await prisma.category.count(),
        },
      });

  revalidatePath("/admin/categories");
  revalidatePath("/shop");
  revalidatePath("/");
  return { success: true, data: { id: category.id } };
}

export async function deleteCategory(id: string) {
  await requireAdmin();
  const count = await prisma.product.count({ where: { categoryId: id } });
  if (count > 0) {
    return { success: false as const, error: `Cannot delete: ${count} product(s) still use this category.` };
  }
  await prisma.category.delete({ where: { id } });
  revalidatePath("/admin/categories");
  revalidatePath("/shop");
  return { success: true as const };
}

export async function reorderCategories(orderedIds: string[]) {
  await requireAdmin();
  await Promise.all(
    orderedIds.map((id, idx) => prisma.category.update({ where: { id }, data: { sortOrder: idx } }))
  );
  revalidatePath("/admin/categories");
  revalidatePath("/");
  return { success: true as const };
}

export async function saveBrand(input: unknown): Promise<ActionResult<{ id: string }>> {
  await requireAdmin();
  const parsed = brandFormSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] = issue.message;
    return { success: false, error: "Please check the form for errors.", fieldErrors };
  }
  const data = parsed.data;
  const slug = await uniqueBrandSlug(data.name, data.id);

  const brand = data.id
    ? await prisma.brand.update({
        where: { id: data.id },
        data: { name: data.name, slug, description: data.description || null, logo: data.logo || null },
      })
    : await prisma.brand.create({
        data: { name: data.name, slug, description: data.description || null, logo: data.logo || null },
      });

  revalidatePath("/admin/brands");
  revalidatePath("/shop");
  return { success: true, data: { id: brand.id } };
}

export async function deleteBrand(id: string) {
  await requireAdmin();
  const count = await prisma.product.count({ where: { brandId: id } });
  if (count > 0) {
    return { success: false as const, error: `Cannot delete: ${count} product(s) still use this brand.` };
  }
  await prisma.brand.delete({ where: { id } });
  revalidatePath("/admin/brands");
  return { success: true as const };
}
