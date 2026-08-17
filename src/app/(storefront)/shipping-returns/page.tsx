import type { Metadata } from "next";
import { Truck, Zap, RotateCcw, ShieldCheck } from "lucide-react";
import { Container, SectionHeading } from "@/components/ui/container";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Shipping & Returns",
  description: "Maldibay shipping timelines, delivery costs, and our 30-day return policy.",
};

export default function ShippingReturnsPage() {
  return (
    <div className="py-14 sm:py-20">
      <Container className="max-w-3xl">
        <SectionHeading eyebrow="Support" title="Shipping & Returns" align="center" className="mx-auto" />

        <div className="mt-14 grid sm:grid-cols-2 gap-6">
          <InfoCard icon={Truck} title="Standard Delivery" detail="4–6 business days · $4.50" />
          <InfoCard icon={Zap} title="Express Delivery" detail="1–2 business days · $12.00" />
          <InfoCard icon={RotateCcw} title="Free Returns" detail="Within 30 days of delivery" />
          <InfoCard icon={ShieldCheck} title="Free Shipping" detail={`On standard orders over $${FREE_SHIPPING_THRESHOLD}`} />
        </div>

        <div className="mt-16 flex flex-col gap-10 text-ink-soft leading-relaxed">
          <section>
            <h2 className="font-serif text-2xl text-ink mb-3">Shipping</h2>
            <p>
              All orders are processed within 1 business day. Once your order ships, you&apos;ll receive a
              confirmation email with a tracking number. Standard delivery arrives in 4–6 business days;
              Express delivery arrives in 1–2 business days. Standard shipping is complimentary on all orders
              over ${FREE_SHIPPING_THRESHOLD}.
            </p>
            <p className="mt-3">
              We currently ship across the Maldives, with select international destinations available at
              checkout. Delivery times may vary slightly during peak seasons and public holidays.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-ink mb-3">Returns</h2>
            <p>
              We want you to love what you order. If something isn&apos;t right, unused and unopened items in
              their original packaging can be returned within 30 days of delivery for a full refund to your
              original payment method. Due to hygiene reasons, opened cosmetics, skincare and personal care items
              cannot be returned unless defective.
            </p>
            <p className="mt-3">
              To start a return, contact our support team from the{" "}
              <a href="/contact" className="text-ink underline underline-offset-2">
                Contact page
              </a>{" "}
              with your order number. We&apos;ll provide instructions and cover return shipping for defective or
              incorrect items.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-ink mb-3">Damaged or Incorrect Items</h2>
            <p>
              If your order arrives damaged or you received the wrong item, please reach out within 48 hours of
              delivery with photos of the issue. We&apos;ll send a replacement or issue a full refund at no
              additional cost to you.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-ink mb-3">Refund Timelines</h2>
            <p>
              Once your return is received and inspected, refunds are processed within 3–5 business days. Depending
              on your payment method, it may take an additional 5–10 business days for the refund to appear in your
              account.
            </p>
          </section>
        </div>
      </Container>
    </div>
  );
}

function InfoCard({ icon: Icon, title, detail }: { icon: React.ElementType; title: string; detail: string }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl bg-ivory p-5">
      <div className="h-11 w-11 rounded-full bg-warm-white flex items-center justify-center shrink-0">
        <Icon size={18} className="text-rose-gold-dark" />
      </div>
      <div>
        <p className="text-sm font-medium text-ink">{title}</p>
        <p className="text-xs text-ink-mute mt-0.5">{detail}</p>
      </div>
    </div>
  );
}
