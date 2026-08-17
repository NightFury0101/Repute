import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ShopView } from "@/components/shop/shop-view";
import { getCategoryBySlug } from "@/lib/data/categories";
import type { ShopSearchParams } from "@/lib/shop-params";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category: slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return {};
  return {
    title: category.name,
    description: category.description ?? `Shop ${category.name} at Repute.`,
    openGraph: category.image ? { images: [category.image] } : undefined,
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>;
  searchParams: Promise<ShopSearchParams>;
}) {
  const { category: slug } = await params;
  const [category, resolvedSearchParams] = await Promise.all([getCategoryBySlug(slug), searchParams]);

  if (!category || !category.isActive) notFound();

  return (
    <ShopView
      searchParams={resolvedSearchParams}
      fixedCategorySlug={category.slug}
      title={category.name}
      description={category.description ?? undefined}
    />
  );
}
