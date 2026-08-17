import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSearchBar } from "@/components/admin/admin-search-bar";
import { OrdersTable } from "@/components/admin/orders-table";
import { getAdminOrders } from "@/lib/actions/admin-orders";

export const metadata: Metadata = { title: "Orders" };

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const { q, status } = await searchParams;
  const orders = await getAdminOrders({ query: q, status });

  return (
    <div>
      <AdminPageHeader title="Orders" description={`${orders.length} order${orders.length === 1 ? "" : "s"}`} />
      <div className="mb-6">
        <AdminSearchBar placeholder="Search by order #, name or email…" />
      </div>
      <OrdersTable orders={orders} />
    </div>
  );
}
