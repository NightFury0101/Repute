import type { Metadata } from "next";
import { ShopView } from "@/components/shop/shop-view";
import type { ShopSearchParams } from "@/lib/shop-params";

export const metadata: Metadata = {
  title: "Shop All Products",
  description: "Browse the full Maldibay catalog — makeup, skincare, haircare, fragrance, body care and tools.",
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<ShopSearchParams>;
}) {
  const params = await searchParams;

  const filterTitles: Record<string, string> = {
    new: "New Arrivals",
    bestsellers: "Best Sellers",
    featured: "Featured Edit",
  };

  return (
    <ShopView
      searchParams={params}
      title={params.filter ? filterTitles[params.filter] ?? "Shop All" : params.q ? `Results for "${params.q}"` : "Shop All"}
      description="Every formula in the Maldibay catalog, in one place. Filter by category, brand, price and more."
    />
  );
}
