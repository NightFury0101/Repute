import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSearchBar } from "@/components/admin/admin-search-bar";
import { ProductsTable } from "@/components/admin/products-table";
import { Button } from "@/components/ui/button";
import { getAdminProducts } from "@/lib/data/products";

export const metadata: Metadata = { title: "Products" };

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const products = await getAdminProducts({ query: q });

  return (
    <div>
      <AdminPageHeader
        title="Products"
        description={`${products.length} product${products.length === 1 ? "" : "s"} in your catalog`}
        actions={
          <Button asChild>
            <Link href="/admin/products/new">
              <Plus size={16} /> Add Product
            </Link>
          </Button>
        }
      />
      <div className="mb-6">
        <AdminSearchBar placeholder="Search products, SKU or brand…" />
      </div>
      <ProductsTable products={products} />
    </div>
  );
}
