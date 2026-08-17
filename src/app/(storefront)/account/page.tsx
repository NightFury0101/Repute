import type { Metadata } from "next";
import Link from "next/link";
import { Package, Heart, MapPin, ArrowRight } from "lucide-react";
import { AvatarInitials } from "@/components/ui/avatar-initials";
import { Badge } from "@/components/ui/badge";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { getOrdersForUser } from "@/lib/actions/orders";
import { formatDate, formatPrice } from "@/lib/utils";
import { ORDER_STATUS_LABELS, type OrderStatus } from "@/lib/constants";

export const metadata: Metadata = {
  title: "My Account",
};

export default async function AccountOverviewPage() {
  const sessionUser = await requireUser();
  const [user, orders, wishlistCount, addressCount] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: sessionUser.id } }),
    getOrdersForUser(sessionUser.id),
    prisma.wishlistItem.count({ where: { userId: sessionUser.id } }),
    prisma.address.count({ where: { userId: sessionUser.id } }),
  ]);

  return (
    <div className="flex flex-col gap-10">
      <div className="flex items-center gap-4 rounded-2xl bg-ivory p-6">
        <AvatarInitials name={user.name ?? user.email} size={56} />
        <div>
          <p className="font-serif text-2xl text-ink">{user.name ?? "Maldibay Customer"}</p>
          <p className="text-sm text-ink-mute">{user.email}</p>
          <p className="text-xs text-ink-mute mt-1">Member since {formatDate(user.createdAt)}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatCard icon={Package} label="Orders" value={orders.length} href="/account/orders" />
        <StatCard icon={Heart} label="Wishlist" value={wishlistCount} href="/wishlist" />
        <StatCard icon={MapPin} label="Addresses" value={addressCount} href="/account/addresses" />
      </div>

      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-serif text-2xl text-ink">Recent Orders</h2>
          <Link href="/account/orders" className="text-sm text-ink underline underline-offset-2 flex items-center gap-1">
            View All <ArrowRight size={14} />
          </Link>
        </div>

        {orders.length === 0 ? (
          <p className="text-ink-soft text-sm">You haven&apos;t placed any orders yet.</p>
        ) : (
          <div className="flex flex-col divide-y divide-line border-y border-line">
            {orders.slice(0, 3).map((order) => (
              <Link
                key={order.id}
                href={`/account/orders/${order.orderNumber}`}
                className="flex items-center justify-between gap-4 py-4 hover:bg-ivory/50 -mx-2 px-2 rounded-lg transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-ink">{order.orderNumber}</p>
                  <p className="text-xs text-ink-mute mt-0.5">
                    {formatDate(order.createdAt)} · {order.items.length} item{order.items.length === 1 ? "" : "s"}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant={order.status === "DELIVERED" ? "success" : order.status === "CANCELLED" ? "muted" : "ink"}>
                    {ORDER_STATUS_LABELS[order.status as OrderStatus]}
                  </Badge>
                  <p className="text-sm font-medium text-ink w-16 text-right">{formatPrice(order.total)}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  href: string;
}) {
  return (
    <Link href={href} className="flex flex-col gap-2 rounded-2xl border border-line p-5 hover:border-ink transition-colors">
      <Icon size={18} className="text-rose-gold-dark" />
      <span className="font-serif text-2xl text-ink">{value}</span>
      <span className="text-xs text-ink-mute">{label}</span>
    </Link>
  );
}
