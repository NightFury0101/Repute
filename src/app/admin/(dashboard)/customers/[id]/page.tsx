import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AvatarInitials } from "@/components/ui/avatar-initials";
import { Badge } from "@/components/ui/badge";
import { CustomerStatusToggle } from "@/components/admin/customer-status-toggle";
import { getAdminCustomerById } from "@/lib/actions/admin-customers";
import { formatDate, formatPrice } from "@/lib/utils";
import { ORDER_STATUS_LABELS, type OrderStatus } from "@/lib/constants";

export const metadata: Metadata = { title: "Customer Details" };

export default async function AdminCustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const customer = await getAdminCustomerById(id);
  if (!customer) notFound();

  const lifetimeSpend = customer.orders.reduce((s, o) => s + o.total, 0);

  return (
    <div>
      <AdminPageHeader
        title={customer.name ?? "Customer"}
        description={customer.email}
        actions={<CustomerStatusToggle id={customer.id} status={customer.status} />}
      />

      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        <div className="rounded-2xl border border-line bg-warm-white p-6">
          <h3 className="font-serif text-xl text-ink mb-4">Order History</h3>
          {customer.orders.length === 0 ? (
            <p className="text-sm text-ink-mute">No orders yet.</p>
          ) : (
            <div className="flex flex-col divide-y divide-line">
              {customer.orders.map((order) => (
                <Link key={order.id} href={`/admin/orders/${order.id}`} className="flex items-center justify-between py-3 hover:bg-ivory/50 -mx-2 px-2 rounded-lg">
                  <div>
                    <p className="text-sm text-ink">{order.orderNumber}</p>
                    <p className="text-xs text-ink-mute">{formatDate(order.createdAt)} · {order.items.length} items</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="muted">{ORDER_STATUS_LABELS[order.status as OrderStatus]}</Badge>
                    <span className="text-sm font-medium text-ink w-16 text-right">{formatPrice(order.total)}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-6">
          <div className="rounded-2xl border border-line bg-warm-white p-6 flex flex-col items-center text-center gap-3">
            <AvatarInitials name={customer.name ?? customer.email} size={56} />
            <div>
              <p className="font-medium text-ink">{customer.name ?? "—"}</p>
              <p className="text-xs text-ink-mute">{customer.email}</p>
              {customer.phone && <p className="text-xs text-ink-mute">{customer.phone}</p>}
            </div>
            <Badge variant={customer.status === "ACTIVE" ? "success" : "sale"}>{customer.status}</Badge>
            <div className="grid grid-cols-2 gap-3 w-full mt-2 pt-4 border-t border-line">
              <div>
                <p className="font-serif text-xl text-ink">{customer.orders.length}</p>
                <p className="text-xs text-ink-mute">Orders</p>
              </div>
              <div>
                <p className="font-serif text-xl text-ink">{formatPrice(lifetimeSpend)}</p>
                <p className="text-xs text-ink-mute">Lifetime Spend</p>
              </div>
            </div>
            <p className="text-xs text-ink-mute">Member since {formatDate(customer.createdAt)}</p>
          </div>

          {customer.addresses.length > 0 && (
            <div className="rounded-2xl border border-line bg-warm-white p-6">
              <h3 className="font-serif text-lg text-ink mb-3">Addresses</h3>
              <div className="flex flex-col gap-3">
                {customer.addresses.map((a) => (
                  <p key={a.id} className="text-xs text-ink-soft leading-relaxed border-b border-line pb-3 last:border-0 last:pb-0">
                    <span className="font-medium text-ink">{a.label}</span>
                    <br />
                    {a.line1}, {a.city}, {a.country}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
