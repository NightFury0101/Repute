import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Check, Truck } from "lucide-react";
import { requireUser } from "@/lib/session";
import { getOrderByNumber } from "@/lib/actions/orders";
import { formatDate, formatPrice, cn } from "@/lib/utils";
import { DELIVERY_METHODS, PAYMENT_METHODS, ORDER_STATUS_LABELS } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Order Details",
};

const TRACKING_STEPS = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"] as const;

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const user = await requireUser();
  const { orderNumber } = await params;
  const order = await getOrderByNumber(orderNumber, user.id);
  if (!order) notFound();

  const delivery = DELIVERY_METHODS.find((d) => d.id === order.deliveryMethod);
  const payment = PAYMENT_METHODS.find((p) => p.id === order.paymentMethod);
  const isCancelled = order.status === "CANCELLED" || order.status === "REFUNDED";
  const currentStepIndex = TRACKING_STEPS.indexOf(order.status as (typeof TRACKING_STEPS)[number]);

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-serif text-2xl text-ink">Order {order.orderNumber}</h2>
          <p className="text-sm text-ink-mute mt-1">Placed on {formatDate(order.createdAt)}</p>
        </div>
        {order.trackingNumber && (
          <p className="text-sm text-ink-soft flex items-center gap-2">
            <Truck size={16} /> Tracking: <strong>{order.trackingNumber}</strong>
          </p>
        )}
      </div>

      {!isCancelled ? (
        <div className="flex items-center">
          {TRACKING_STEPS.map((step, i) => (
            <div key={step} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-2">
                <div
                  className={cn(
                    "h-9 w-9 rounded-full flex items-center justify-center text-xs shrink-0",
                    i <= currentStepIndex ? "bg-ink text-warm-white" : "border border-line text-ink-mute"
                  )}
                >
                  {i < currentStepIndex ? <Check size={14} /> : i + 1}
                </div>
                <span className="text-[0.65rem] text-ink-mute text-center w-16">{ORDER_STATUS_LABELS[step]}</span>
              </div>
              {i < TRACKING_STEPS.length - 1 && (
                <div className={cn("flex-1 h-px mx-1 mb-5", i < currentStepIndex ? "bg-ink" : "bg-line")} />
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl bg-red-50 text-red-700 text-sm p-4">
          This order was {order.status === "CANCELLED" ? "cancelled" : "refunded"}.
        </div>
      )}

      <div className="rounded-2xl border border-line overflow-hidden">
        <div className="grid sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-line">
          <div className="p-6">
            <p className="text-xs uppercase tracking-wider text-ink-mute mb-2">Shipping Address</p>
            <p className="text-sm text-ink leading-relaxed">
              {order.shippingName}
              <br />
              {order.shippingLine1}
              {order.shippingLine2 ? `, ${order.shippingLine2}` : ""}
              <br />
              {order.shippingCity}, {order.shippingPostal}
              <br />
              {order.shippingCountry}
            </p>
          </div>
          <div className="p-6">
            <p className="text-xs uppercase tracking-wider text-ink-mute mb-2">Delivery Method</p>
            <p className="text-sm text-ink">{delivery?.label ?? order.deliveryMethod}</p>
          </div>
          <div className="p-6">
            <p className="text-xs uppercase tracking-wider text-ink-mute mb-2">Payment Method</p>
            <p className="text-sm text-ink">{payment?.label ?? order.paymentMethod}</p>
          </div>
        </div>

        <div className="p-6 sm:p-8 flex flex-col gap-4 border-t border-line">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center gap-4">
              <div className="relative h-16 w-14 rounded-lg overflow-hidden bg-cream shrink-0">
                {item.productImage && (
                  <Image src={item.productImage} alt={item.productName} fill className="object-cover" sizes="60px" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-ink line-clamp-1">{item.productName}</p>
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
                <span>Discount</span>
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
    </div>
  );
}
