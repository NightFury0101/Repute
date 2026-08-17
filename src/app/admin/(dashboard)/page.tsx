import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { DollarSign, ShoppingCart, TrendingUp, Users, AlertTriangle } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { SalesChart } from "@/components/admin/sales-chart";
import { Badge } from "@/components/ui/badge";
import { getDashboardAnalytics } from "@/lib/data/analytics";
import { formatPrice, formatDate } from "@/lib/utils";
import { ORDER_STATUS_LABELS, type OrderStatus } from "@/lib/constants";

export const metadata: Metadata = { title: "Admin Dashboard" };

export default async function AdminDashboardPage() {
  const data = await getDashboardAnalytics();

  return (
    <div>
      <AdminPageHeader title="Dashboard" description="Store performance at a glance." />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={DollarSign} label="Revenue (30d)" value={formatPrice(data.totalRevenue)} />
        <StatCard icon={ShoppingCart} label="Orders (30d)" value={String(data.totalOrders)} />
        <StatCard icon={TrendingUp} label="Avg. Order Value" value={formatPrice(data.avgOrderValue)} />
        <StatCard icon={Users} label="Total Customers" value={String(data.totalCustomers)} />
      </div>

      <div className="grid lg:grid-cols-[1fr_340px] gap-6">
        <div className="bg-warm-white rounded-2xl border border-line p-6">
          <h3 className="font-serif text-xl text-ink mb-4">Sales Over Time (30 days)</h3>
          <SalesChart data={data.salesOverTime} />
        </div>

        <div className="bg-warm-white rounded-2xl border border-line p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif text-xl text-ink">Low Stock</h3>
            {data.outOfStockCount > 0 && (
              <span className="flex items-center gap-1 text-xs text-red-600">
                <AlertTriangle size={13} /> {data.outOfStockCount} out of stock
              </span>
            )}
          </div>
          {data.lowStockProducts.length === 0 ? (
            <p className="text-sm text-ink-mute">All products are well stocked.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {data.lowStockProducts.map((p) => (
                <Link key={p.id} href={`/admin/products/${p.id}/edit`} className="flex items-center justify-between text-sm hover:bg-ivory -mx-2 px-2 py-1.5 rounded-lg">
                  <span className="text-ink truncate">{p.name}</span>
                  <Badge variant={p.stock === 0 ? "sale" : "warning"}>{p.stock} left</Badge>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mt-6">
        <div className="bg-warm-white rounded-2xl border border-line p-6">
          <h3 className="font-serif text-xl text-ink mb-4">Best-Selling Products</h3>
          {data.bestSelling.length === 0 ? (
            <p className="text-sm text-ink-mute">No sales yet.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {data.bestSelling.map((p) => (
                <div key={p.id} className="flex items-center gap-3">
                  <div className="relative h-10 w-9 rounded-md overflow-hidden bg-cream shrink-0">
                    {p.image && <Image src={p.image} alt={p.name} fill className="object-cover" sizes="40px" />}
                  </div>
                  <span className="text-sm text-ink flex-1 truncate">{p.name}</span>
                  <span className="text-xs text-ink-mute">{p.unitsSold} sold</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-warm-white rounded-2xl border border-line p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif text-xl text-ink">Recent Orders</h3>
            <Link href="/admin/orders" className="text-xs text-ink underline underline-offset-2">
              View All
            </Link>
          </div>
          <div className="flex flex-col divide-y divide-line">
            {data.recentOrders.map((order) => (
              <Link key={order.id} href={`/admin/orders/${order.id}`} className="flex items-center justify-between py-3 hover:bg-ivory/60 -mx-2 px-2 rounded-lg">
                <div>
                  <p className="text-sm text-ink">{order.orderNumber}</p>
                  <p className="text-xs text-ink-mute">{order.user.name ?? order.email} · {formatDate(order.createdAt)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="muted">{ORDER_STATUS_LABELS[order.status as OrderStatus]}</Badge>
                  <span className="text-sm font-medium text-ink w-14 text-right">{formatPrice(order.total)}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="bg-warm-white rounded-2xl border border-line p-5 flex flex-col gap-2">
      <Icon size={18} className="text-rose-gold-dark" />
      <span className="font-serif text-2xl text-ink">{value}</span>
      <span className="text-xs text-ink-mute">{label}</span>
    </div>
  );
}
