"use client";

import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/input";
import { formatDate, formatPrice } from "@/lib/utils";
import { ORDER_STATUSES, ORDER_STATUS_LABELS, type OrderStatus } from "@/lib/constants";
import type { Order, OrderItem, User } from "@/generated/prisma/client";

const STATUS_VARIANT: Record<string, "ink" | "success" | "muted" | "warning" | "sale"> = {
  PENDING: "muted",
  CONFIRMED: "ink",
  PROCESSING: "ink",
  SHIPPED: "warning",
  DELIVERED: "success",
  CANCELLED: "muted",
  REFUNDED: "sale",
};

type OrderRow = Order & { user: User; items: OrderItem[] };

export function OrdersTable({ orders }: { orders: OrderRow[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function setStatusFilter(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set("status", value);
    else params.delete("status");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div>
      <div className="mb-6">
        <Select value={searchParams.get("status") ?? ""} onChange={(e) => setStatusFilter(e.target.value)} className="w-auto min-w-[200px]">
          <option value="">All Statuses</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {ORDER_STATUS_LABELS[s]}
            </option>
          ))}
        </Select>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-line bg-warm-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs uppercase tracking-wider text-ink-mute">
              <th className="p-4 font-medium">Order</th>
              <th className="p-4 font-medium">Customer</th>
              <th className="p-4 font-medium">Date</th>
              <th className="p-4 font-medium">Items</th>
              <th className="p-4 font-medium">Total</th>
              <th className="p-4 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-line last:border-0 hover:bg-ivory/50">
                <td className="p-4">
                  <Link href={`/admin/orders/${order.id}`} className="text-ink font-medium hover:underline">
                    {order.orderNumber}
                  </Link>
                </td>
                <td className="p-4 text-ink-soft">{order.user?.name ?? order.email}</td>
                <td className="p-4 text-ink-soft">{formatDate(order.createdAt)}</td>
                <td className="p-4 text-ink-soft">{order.items.length}</td>
                <td className="p-4 text-ink font-medium">{formatPrice(order.total)}</td>
                <td className="p-4">
                  <Badge variant={STATUS_VARIANT[order.status] ?? "ink"}>{ORDER_STATUS_LABELS[order.status as OrderStatus]}</Badge>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-ink-mute">
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
