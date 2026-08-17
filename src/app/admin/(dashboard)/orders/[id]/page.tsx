import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Mail, Phone } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { OrderStatusUpdater } from "@/components/admin/order-status-updater";
import { Badge } from "@/components/ui/badge";
import { getAdminOrderById } from "@/lib/actions/admin-orders";
import { formatDate, formatPrice } from "@/lib/utils";
import { DELIVERY_METHODS, PAYMENT_METHODS, ORDER_STATUS_LABELS, type OrderStatus } from "@/lib/constants";

export const metadata: Metadata = { title: "Order Details" };

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getAdminOrderById(id);
  if (!order) notFound();

  const delivery = DELIVERY_METHODS.find((d) => d.id === order.deliveryMethod);
  const payment = PAYMENT_METHODS.find((p) => p.id === order.paymentMethod);

  return (
    <div>
      <AdminPageHeader
        title={`Order ${order.orderNumber}`}
        description={`Placed ${formatDate(order.createdAt)}`}
        actions={<Badge variant="ink">{ORDER_STATUS_LABELS[order.status as OrderStatus]}</Badge>}
      />

      <div className="grid lg:grid-cols-[1fr_340px] gap-6">
        <div className="flex flex-col gap-6">
          <div className="rounded-2xl border border-line bg-warm-white p-6">
            <h3 className="font-serif text-xl text-ink mb-4">Items</h3>
            <div className="flex flex-col gap-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-4">
                  <div className="relative h-14 w-12 rounded-lg overflow-hidden bg-cream shrink-0">
                    {item.product.images[0] && (
                      <Image src={item.product.images[0].url} alt={item.productName} fill className="object-cover" sizes="50px" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-ink">{item.productName}</p>
                    {item.variantName && <p className="text-xs text-ink-mute">{item.variantName}</p>}
                  </div>
                  <p className="text-sm text-ink-mute">Qty {item.quantity}</p>
                  <p className="text-sm font-medium text-ink w-16 text-right">{formatPrice(item.price * item.quantity)}</p>
                </div>
              ))}
              <div className="flex flex-col gap-2 text-sm pt-4 border-t border-line">
                <div className="flex justify-between text-ink-soft">
                  <span>Subtotal</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                {order.discountTotal > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Discount {order.promoCode && `(${order.promoCode})`}</span>
                    <span>-{formatPrice(order.discountTotal)}</span>
                  </div>
                )}
                <div className="flex justify-between text-ink-soft">
                  <span>Shipping</span>
                  <span>{order.shippingCost === 0 ? "Free" : formatPrice(order.shippingCost)}</span>
                </div>
                <div className="flex justify-between text-base font-medium text-ink pt-2 border-t border-line">
                  <span>Total</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-warm-white p-6">
            <h3 className="font-serif text-xl text-ink mb-4">Status History</h3>
            <div className="flex flex-col gap-4">
              {order.statusHistory.map((event) => (
                <div key={event.id} className="flex items-center justify-between text-sm">
                  <div>
                    <Badge variant="muted">{ORDER_STATUS_LABELS[event.status as OrderStatus] ?? event.status}</Badge>
                    {event.note && <span className="text-ink-soft ml-2">{event.note}</span>}
                  </div>
                  <span className="text-xs text-ink-mute">{formatDate(event.createdAt)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="rounded-2xl border border-line bg-warm-white p-6">
            <h3 className="font-serif text-xl text-ink mb-4">Customer</h3>
            <Link href={`/admin/customers/${order.userId}`} className="text-sm font-medium text-ink hover:underline">
              {order.user.name ?? "Guest"}
            </Link>
            <p className="text-sm text-ink-soft flex items-center gap-2 mt-2"><Mail size={13} /> {order.email}</p>
            <p className="text-sm text-ink-soft flex items-center gap-2 mt-1"><Phone size={13} /> {order.phone}</p>
          </div>

          <div className="rounded-2xl border border-line bg-warm-white p-6">
            <h3 className="font-serif text-xl text-ink mb-3">Shipping Address</h3>
            <p className="text-sm text-ink-soft leading-relaxed">
              {order.shippingName}
              <br />
              {order.shippingLine1}
              {order.shippingLine2 ? `, ${order.shippingLine2}` : ""}
              <br />
              {order.shippingCity}, {order.shippingPostal}
              <br />
              {order.shippingCountry}
            </p>
            <div className="mt-4 pt-4 border-t border-line text-sm text-ink-soft flex flex-col gap-1">
              <span>Delivery: {delivery?.label ?? order.deliveryMethod}</span>
              <span>Payment: {payment?.label ?? order.paymentMethod}</span>
            </div>
          </div>

          <OrderStatusUpdater orderId={order.id} currentStatus={order.status} trackingNumber={order.trackingNumber} />
        </div>
      </div>
    </div>
  );
}
