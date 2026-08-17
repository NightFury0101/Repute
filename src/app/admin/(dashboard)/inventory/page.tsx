import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { InventoryTable } from "@/components/admin/inventory-table";
import { getAdminProducts } from "@/lib/data/products";

export const metadata: Metadata = { title: "Inventory" };

export default async function AdminInventoryPage() {
  const products = await getAdminProducts();
  const sorted = [...products].sort((a, b) => a.stock - b.stock);
  const lowStock = sorted.filter((p) => p.stock <= p.lowStockAt).length;

  return (
    <div>
      <AdminPageHeader
        title="Inventory"
        description={`${products.length} products · ${lowStock} at or below their low-stock threshold`}
      />
      <InventoryTable products={sorted} />
    </div>
  );
}
