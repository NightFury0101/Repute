import type { Metadata } from "next";
import { Clock } from "lucide-react";
import { ProductCard } from "@/components/product/product-card";
import { getRecentlyViewedProducts } from "@/lib/actions/recently-viewed";

export const metadata: Metadata = {
  title: "Recently Viewed",
};

export default async function RecentlyViewedPage() {
  const products = await getRecentlyViewedProducts();

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
        <Clock size={36} className="text-ink-mute" strokeWidth={1.2} />
        <p className="text-ink-soft">Products you view will appear here.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-5 gap-y-10">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
