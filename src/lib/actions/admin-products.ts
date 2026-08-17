"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { productFormSchema } from "@/lib/validations";
import { toJsonArray } from "@/lib/json";
import { slugify } from "@/lib/utils";
import type { ActionResult } from "@/lib/actions/auth";

async function uniqueSlug(base: string, excludeId?: string) {
  const slugBase = slugify(base);
  let slug = slugBase;
  let n = 1;
  while (
    await prisma.product.findFirst({ where: { slug, ...(excludeId ? { id: { not: excludeId } } : {}) } })
  ) {
    n += 1;
    slug = `${slugBase}-${n}`;
  }
  return slug;
}

export async function saveProduct(input: unknown): Promise<ActionResult<{ id: string; slug: string }>> {
  await requireAdmin();
  const parsed = productFormSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] = issue.message;
    return { success: false, error: "Please check the form for errors.", fieldErrors };
  }
  const data = parsed.data;

  const skuOwner = await prisma.product.findFirst({
    where: { sku: data.sku, ...(data.id ? { id: { not: data.id } } : {}) },
  });
  if (skuOwner) {
    return { success: false, error: "SKU already in use.", fieldErrors: { sku: "Already in use" } };
  }

  const slug = await uniqueSlug(data.name, data.id);

  const baseData = {
    name: data.name,
    slug,
    brandId: data.brandId,
    categoryId: data.categoryId,
    sku: data.sku,
    shortDescription: data.shortDescription || null,
    description: data.description || null,
    ingredients: data.ingredients || null,
    howToUse: data.howToUse || null,
    benefits: toJsonArray(data.benefits),
    skinType: toJsonArray(data.skinType),
    price: data.price,
    discountPrice: data.discountPrice || null,
    stock: data.stock,
    lowStockAt: data.lowStockAt,
    productType: data.productType || null,
    isFeatured: !!data.isFeatured,
    isBestSeller: !!data.isBestSeller,
    isNewArrival: !!data.isNewArrival,
    isActive: data.isActive ?? true,
  };

  const product = data.id
    ? await prisma.product.update({ where: { id: data.id }, data: baseData })
    : await prisma.product.create({ data: baseData });

  if (data.images) {
    await prisma.productImage.deleteMany({ where: { productId: product.id } });
    if (data.images.length) {
      await prisma.productImage.createMany({
        data: data.images.map((img, idx) => ({
          productId: product.id,
          url: img.url,
          alt: img.alt || data.name,
          sortOrder: idx,
        })),
      });
    }
  }

  if (data.variants) {
    await prisma.productVariant.deleteMany({ where: { productId: product.id } });
    if (data.variants.length) {
      await prisma.productVariant.createMany({
        data: data.variants.map((v, idx) => ({
          productId: product.id,
          type: v.type,
          name: v.name,
          swatch: v.swatch || null,
          priceOverride: v.priceOverride || null,
          stock: v.stock,
          sortOrder: idx,
        })),
      });
    }
  }

  if (data.tags) {
    await prisma.productTag.deleteMany({ where: { productId: product.id } });
    for (const tagName of data.tags) {
      const tag = await prisma.tag.upsert({
        where: { name: tagName },
        update: {},
        create: { name: tagName },
      });
      await prisma.productTag.create({ data: { productId: product.id, tagId: tag.id } });
    }
  }

  revalidatePath("/admin/products");
  revalidatePath("/shop");
  revalidatePath(`/product/${product.slug}`);
  revalidatePath("/");
  return { success: true, data: { id: product.id, slug: product.slug } };
}

export async function deleteProduct(id: string) {
  await requireAdmin();
  await prisma.product.delete({ where: { id } });
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  revalidatePath("/");
  return { success: true as const };
}

export async function duplicateProduct(id: string) {
  await requireAdmin();
  const original = await prisma.product.findUnique({
    where: { id },
    include: { images: true, variants: true, tags: true },
  });
  if (!original) return { success: false as const, error: "Product not found." };

  const slug = await uniqueSlug(`${original.name} copy`);
  const sku = `${original.sku}-COPY-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

  const copy = await prisma.product.create({
    data: {
      name: `${original.name} (Copy)`,
      slug,
      sku,
      shortDescription: original.shortDescription,
      description: original.description,
      ingredients: original.ingredients,
      howToUse: original.howToUse,
      benefits: original.benefits,
      skinType: original.skinType,
      price: original.price,
      discountPrice: original.discountPrice,
      stock: original.stock,
      lowStockAt: original.lowStockAt,
      productType: original.productType,
      categoryId: original.categoryId,
      brandId: original.brandId,
      isFeatured: false,
      isBestSeller: false,
      isNewArrival: true,
      isActive: false,
      images: {
        create: original.images.map((img) => ({ url: img.url, alt: img.alt, sortOrder: img.sortOrder })),
      },
      variants: {
        create: original.variants.map((v) => ({
          type: v.type,
          name: v.name,
          swatch: v.swatch,
          priceOverride: v.priceOverride,
          stock: v.stock,
          sortOrder: v.sortOrder,
        })),
      },
      tags: { create: original.tags.map((t) => ({ tagId: t.tagId })) },
    },
  });

  revalidatePath("/admin/products");
  return { success: true as const, data: { id: copy.id, slug: copy.slug } };
}

export async function toggleProductFlag(
  id: string,
  flag: "isFeatured" | "isBestSeller" | "isNewArrival" | "isActive",
  value: boolean
) {
  await requireAdmin();
  await prisma.product.update({ where: { id }, data: { [flag]: value } });
  revalidatePath("/admin/products");
  revalidatePath("/");
  revalidatePath("/shop");
  return { success: true as const };
}

export async function updateProductStock(id: string, stock: number) {
  await requireAdmin();
  await prisma.product.update({ where: { id }, data: { stock } });
  revalidatePath("/admin/products");
  revalidatePath("/admin/inventory");
  return { success: true as const };
}
