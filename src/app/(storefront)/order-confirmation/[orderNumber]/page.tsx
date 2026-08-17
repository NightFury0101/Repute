import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, Package } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/db";
import { formatPrice, formatDate } from "@/lib/utils";
import { DELIVERY_METHODS, PAYMENT_METHODS } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Order Confirmed",
};

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: { items: true },
  });

  if (!order) notFound();

  const delivery = DELIVERY_METHODS.find((d) => d.id === order.deliveryMethod);
  const payment = PAYMENT_METHODS.find((p) => p.id === order.paymentMethod);

  return (
    <div className="py-16 sm:py-20">
      <Container className="max-w-3xl">
        <div className="flex flex-col items-center text-center gap-4 mb-12">
          <CheckCircle2 size={48} className="text-emerald-600" strokeWidth={1.3} />
          <h1 className="font-serif text-4xl sm:text-5xl text-ink">Thank You!</h1>
          <p className="text-ink-soft max-w-md">
            Your order has been placed successfully. A confirmation has been sent to{" "}
            <strong>{order.email}</strong>.
          </p>
          <p className="text-sm text-ink-mute">
            Order Number: <span className="font-medium text-ink">{order.orderNumber}</span>
          </p>
        </div>

        <div className="rounded-2xl border border-line overflow-hidden">
          <div className="grid sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-line">
            <SummaryBlock label="Shipping To">
              {order.shippingName}
              <br />
              {order.shippingLine1}
              {order.shippingLine2 ? `, ${order.shippingLine2}` : ""}
              <br />
              {order.shippingCity}, {order.shippingPostal}
              <br />
              {order.shippingCountry}
            </SummaryBlock>
            <SummaryBlock label="Delivery Method">{delivery?.label ?? order.deliveryMethod}</SummaryBlock>
            <SummaryBlock label="Payment Method">{payment?.label ?? order.paymentMethod}</SummaryBlock>
          </div>

          <div className="p-6 sm:p-8 flex flex-col gap-4">
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

        <p className="text-center text-xs text-ink-mute mt-4">Placed on {formatDate(order.createdAt)}</p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
          <Button asChild size="lg">
            <Link href="/shop">Continue Shopping</Link>
          </Button>
          <Button asChild size="lg" variant="secondary">
            <Link href="/account/orders" className="flex items-center gap-2">
              <Package size={16} /> Track Order
            </Link>
          </Button>
        </div>
      </Container>
    </div>
  );
}

function SummaryBlock({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="p-6">
      <p className="text-xs uppercase tracking-wider text-ink-mute mb-2">{label}</p>
      <p className="text-sm text-ink leading-relaxed">{children}</p>
    </div>
  );
}
