import type { Metadata } from "next";
import Link from "next/link";
import { Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { requireUser } from "@/lib/session";
import { getOrdersForUser } from "@/lib/actions/orders";
import { formatDate, formatPrice } from "@/lib/utils";
import { ORDER_STATUS_LABELS, type OrderStatus } from "@/lib/constants";

export const metadata: Metadata = {
  title: "My Orders",
};

const STATUS_VARIANT: Record<string, "ink" | "success" | "muted" | "warning"> = {
  PENDING: "muted",
  CONFIRMED: "ink",
  PROCESSING: "ink",
  SHIPPED: "warning",
  DELIVERED: "success",
  CANCELLED: "muted",
  REFUNDED: "muted",
};

export default async function OrdersPage() {
  const user = await requireUser();
  const orders = await getOrdersForUser(user.id);

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <Package size={40} className="text-ink-mute" strokeWidth={1.2} />
        <p className="text-ink-soft">You haven&apos;t placed any orders yet.</p>
        <Button asChild>
          <Link href="/shop">Start Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {orders.map((order) => (
        <Link
          key={order.id}
          href={`/account/orders/${order.orderNumber}`}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-line p-5 hover:border-ink transition-colors"
        >
          <div>
            <p className="font-medium text-ink">{order.orderNumber}</p>
            <p className="text-xs text-ink-mute mt-1">
              Placed {formatDate(order.createdAt)} · {order.items.length} item{order.items.length === 1 ? "" : "s"}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant={STATUS_VARIANT[order.status] ?? "ink"}>{ORDER_STATUS_LABELS[order.status as OrderStatus]}</Badge>
            <p className="font-medium text-ink w-16 text-right">{formatPrice(order.total)}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
