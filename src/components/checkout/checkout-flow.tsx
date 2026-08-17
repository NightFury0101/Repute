"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { Check, Lock, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Container } from "@/components/ui/container";
import { Input, Textarea, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { OrderSummary } from "@/components/checkout/order-summary";
import { PromoCodeForm } from "@/components/cart/promo-code-form";
import { useCartStore } from "@/store/cart-store";
import { checkoutSchema } from "@/lib/validations";
import { placeOrder } from "@/lib/actions/orders";
import { DELIVERY_METHODS, PAYMENT_METHODS, FREE_SHIPPING_THRESHOLD } from "@/lib/constants";
import { cn, formatPrice } from "@/lib/utils";
import type { z } from "zod";
import type { Address } from "@/generated/prisma/client";

// The order's cart "items" are sourced from the cart store, not user-entered
// form fields, so they (and the client-only promo box) are excluded from the
// form's own resolver — otherwise an empty RHF-tracked `items` array would
// fail validation on submit and silently block the "Place Order" click.
const clientCheckoutSchema = checkoutSchema.omit({ items: true, promoCode: true });
type CheckoutFormValues = z.infer<typeof clientCheckoutSchema>;

const STEPS = [
  { id: "info", label: "Customer Info" },
  { id: "shipping", label: "Shipping Address" },
  { id: "delivery", label: "Delivery Method" },
  { id: "payment", label: "Payment" },
  { id: "review", label: "Review" },
] as const;

const STEP_FIELDS: Record<string, (keyof CheckoutFormValues)[]> = {
  info: ["email", "phone", "fullName"],
  shipping: ["line1", "city", "postalCode", "country"],
  delivery: ["deliveryMethod"],
  payment: ["paymentMethod"],
  review: [],
};

export function CheckoutFlow({ addresses }: { addresses: Address[] }) {
  const router = useRouter();
  const { data: session } = useSession();
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.subtotal());
  const promoCode = useCartStore((s) => s.promoCode);
  const clearCart = useCartStore((s) => s.clear);
  const hasHydrated = useCartStore((s) => s.hasHydrated);

  const [stepIndex, setStepIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const defaultAddress = addresses.find((a) => a.isDefault) ?? addresses[0];

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(clientCheckoutSchema),
    defaultValues: {
      email: session?.user?.email ?? "",
      phone: defaultAddress?.phone ?? "",
      fullName: defaultAddress?.fullName ?? session?.user?.name ?? "",
      line1: defaultAddress?.line1 ?? "",
      line2: defaultAddress?.line2 ?? "",
      city: defaultAddress?.city ?? "",
      state: defaultAddress?.state ?? "",
      postalCode: defaultAddress?.postalCode ?? "",
      country: defaultAddress?.country ?? "Maldives",
      deliveryMethod: "STANDARD",
      paymentMethod: "COD",
      notes: "",
      saveAddress: false,
    },
  });

  useEffect(() => {
    if (hasHydrated && items.length === 0 && !submitting) {
      router.replace("/cart");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasHydrated, items.length]);

  if (!hasHydrated || items.length === 0) return null;

  const currentStep = STEPS[stepIndex];
  const deliveryMethod = form.watch("deliveryMethod");
  const values = form.watch();

  async function goNext() {
    const fields = STEP_FIELDS[currentStep.id];
    const valid = fields.length ? await form.trigger(fields) : true;
    if (valid) setStepIndex((i) => Math.min(STEPS.length - 1, i + 1));
  }

  function goBack() {
    setStepIndex((i) => Math.max(0, i - 1));
  }

  function selectAddress(address: Address) {
    form.setValue("fullName", address.fullName);
    form.setValue("phone", address.phone);
    form.setValue("line1", address.line1);
    form.setValue("line2", address.line2 ?? "");
    form.setValue("city", address.city);
    form.setValue("state", address.state ?? "");
    form.setValue("postalCode", address.postalCode);
    form.setValue("country", address.country);
  }

  async function onSubmit(data: CheckoutFormValues) {
    setSubmitting(true);
    const result = await placeOrder({
      ...data,
      promoCode: promoCode ?? "",
      items: items.map((i) => ({ productId: i.productId, variantId: i.variantId, quantity: i.quantity })),
    });
    if (result.success) {
      clearCart();
      router.push(`/order-confirmation/${result.data.orderNumber}`);
    } else {
      toast.error(result.error);
      setSubmitting(false);
    }
  }

  return (
    <div className="py-10 sm:py-14">
      <Container>
        <div className="flex items-center justify-center gap-2 mb-10 text-xs text-ink-mute">
          <Lock size={12} /> Secure Checkout <span className="mx-1">·</span> <ShieldCheck size={12} /> SSL Encrypted
        </div>

        <ol className="flex items-center justify-center gap-1 sm:gap-3 mb-12 overflow-x-auto no-scrollbar px-2">
          {STEPS.map((step, i) => (
            <li key={step.id} className="flex items-center gap-1 sm:gap-3 shrink-0">
              <button
                onClick={() => i < stepIndex && setStepIndex(i)}
                className={cn(
                  "flex items-center gap-2 text-xs sm:text-sm",
                  i <= stepIndex ? "text-ink" : "text-ink-mute",
                  i < stepIndex && "cursor-pointer"
                )}
              >
                <span
                  className={cn(
                    "h-6 w-6 rounded-full flex items-center justify-center text-[0.7rem]",
                    i < stepIndex ? "bg-ink text-warm-white" : i === stepIndex ? "border-2 border-ink" : "border border-line"
                  )}
                >
                  {i < stepIndex ? <Check size={12} /> : i + 1}
                </span>
                <span className="hidden sm:inline">{step.label}</span>
              </button>
              {i < STEPS.length - 1 && <span className="w-4 sm:w-8 h-px bg-line" />}
            </li>
          ))}
        </ol>

        <div className="grid lg:grid-cols-[1fr_380px] gap-12">
          <form
            onSubmit={(e) => {
              // Placing the order is only ever triggered explicitly from the
              // review step's button (see below) — guard against any native
              // implicit form submission (e.g. pressing Enter in a field)
              // advancing straight to checkout from an earlier step.
              e.preventDefault();
            }}
          >
            <div className="rounded-2xl border border-line p-6 sm:p-8">
              {currentStep.id === "info" && (
                <div className="flex flex-col gap-5">
                  <h2 className="font-serif text-2xl">Customer Information</h2>
                  <Field label="Email Address" error={form.formState.errors.email?.message}>
                    <Input type="email" {...form.register("email")} placeholder="you@example.com" />
                  </Field>
                  <Field label="Full Name" error={form.formState.errors.fullName?.message}>
                    <Input {...form.register("fullName")} placeholder="Jane Doe" />
                  </Field>
                  <Field label="Phone Number" error={form.formState.errors.phone?.message}>
                    <Input type="tel" {...form.register("phone")} placeholder="+960 777-1234" />
                  </Field>
                </div>
              )}

              {currentStep.id === "shipping" && (
                <div className="flex flex-col gap-5">
                  <h2 className="font-serif text-2xl">Shipping Address</h2>
                  {addresses.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {addresses.map((a) => (
                        <button
                          type="button"
                          key={a.id}
                          onClick={() => selectAddress(a)}
                          className="text-xs rounded-full border border-line px-3 py-1.5 hover:border-ink cursor-pointer"
                        >
                          Use {a.label}
                        </button>
                      ))}
                    </div>
                  )}
                  <Field label="Address Line 1" error={form.formState.errors.line1?.message}>
                    <Input {...form.register("line1")} placeholder="Street address" />
                  </Field>
                  <Field label="Address Line 2 (optional)">
                    <Input {...form.register("line2")} placeholder="Apartment, suite, etc." />
                  </Field>
                  <div className="grid sm:grid-cols-2 gap-5">
                    <Field label="City" error={form.formState.errors.city?.message}>
                      <Input {...form.register("city")} />
                    </Field>
                    <Field label="State / Atoll (optional)">
                      <Input {...form.register("state")} />
                    </Field>
                    <Field label="Postal Code" error={form.formState.errors.postalCode?.message}>
                      <Input {...form.register("postalCode")} />
                    </Field>
                    <Field label="Country" error={form.formState.errors.country?.message}>
                      <Input {...form.register("country")} />
                    </Field>
                  </div>
                  {session?.user && (
                    <label className="flex items-center gap-2.5 text-sm text-ink-soft cursor-pointer">
                      <input type="checkbox" {...form.register("saveAddress")} className="h-4 w-4" />
                      Save this address to my account
                    </label>
                  )}
                </div>
              )}

              {currentStep.id === "delivery" && (
                <div className="flex flex-col gap-4">
                  <h2 className="font-serif text-2xl mb-2">Delivery Method</h2>
                  {DELIVERY_METHODS.map((method) => (
                    <label
                      key={method.id}
                      className={cn(
                        "flex items-center justify-between gap-4 rounded-xl border p-5 cursor-pointer transition-colors",
                        deliveryMethod === method.id ? "border-ink bg-ivory" : "border-line hover:border-ink/40"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          value={method.id}
                          {...form.register("deliveryMethod")}
                          className="h-4 w-4"
                        />
                        <div>
                          <p className="font-medium text-ink">{method.label}</p>
                          <p className="text-sm text-ink-mute">{method.description}</p>
                        </div>
                      </div>
                      <p className="font-medium text-ink">
                        {method.id === "STANDARD" && subtotal >= FREE_SHIPPING_THRESHOLD
                          ? "Free"
                          : formatPrice(method.price)}
                      </p>
                    </label>
                  ))}
                </div>
              )}

              {currentStep.id === "payment" && (
                <div className="flex flex-col gap-4">
                  <h2 className="font-serif text-2xl mb-2">Payment Method</h2>
                  {PAYMENT_METHODS.map((method) => (
                    <label
                      key={method.id}
                      className={cn(
                        "flex items-center gap-3 rounded-xl border p-5 cursor-pointer transition-colors",
                        values.paymentMethod === method.id ? "border-ink bg-ivory" : "border-line hover:border-ink/40"
                      )}
                    >
                      <input type="radio" value={method.id} {...form.register("paymentMethod")} className="h-4 w-4" />
                      <p className="font-medium text-ink">{method.label}</p>
                    </label>
                  ))}
                  <p className="text-xs text-ink-mute rounded-xl bg-ivory p-4 leading-relaxed">
                    {values.paymentMethod === "CARD"
                      ? "Card payments are processed by our secure payment partner at fulfillment — no card details are collected on this demo site."
                      : values.paymentMethod === "BANK_TRANSFER"
                      ? "Bank transfer details will be emailed to you after checkout."
                      : "Pay in cash when your order is delivered."}
                  </p>
                  <Field label="Order Notes (optional)">
                    <Textarea rows={3} {...form.register("notes")} placeholder="Delivery instructions, gift notes, etc." />
                  </Field>
                </div>
              )}

              {currentStep.id === "review" && (
                <div className="flex flex-col gap-6">
                  <h2 className="font-serif text-2xl">Review Your Order</h2>
                  <ReviewRow label="Contact" value={`${values.fullName} · ${values.email} · ${values.phone}`} onEdit={() => setStepIndex(0)} />
                  <ReviewRow
                    label="Shipping to"
                    value={`${values.line1}${values.line2 ? ", " + values.line2 : ""}, ${values.city}${values.state ? ", " + values.state : ""} ${values.postalCode}, ${values.country}`}
                    onEdit={() => setStepIndex(1)}
                  />
                  <ReviewRow
                    label="Delivery"
                    value={DELIVERY_METHODS.find((d) => d.id === values.deliveryMethod)?.label ?? ""}
                    onEdit={() => setStepIndex(2)}
                  />
                  <ReviewRow
                    label="Payment"
                    value={PAYMENT_METHODS.find((p) => p.id === values.paymentMethod)?.label ?? ""}
                    onEdit={() => setStepIndex(3)}
                  />
                </div>
              )}
            </div>

            <div className="flex items-center justify-between mt-6">
              {stepIndex > 0 ? (
                <Button type="button" variant="ghost" onClick={goBack}>
                  Back
                </Button>
              ) : (
                <span />
              )}
              {currentStep.id === "review" ? (
                <Button
                  type="button"
                  size="lg"
                  disabled={submitting}
                  onClick={form.handleSubmit(onSubmit)}
                >
                  {submitting ? "Placing Order…" : "Place Order"}
                </Button>
              ) : (
                <Button type="button" size="lg" onClick={goNext}>
                  Continue
                </Button>
              )}
            </div>
          </form>

          <div className="flex flex-col gap-5 h-fit">
            <OrderSummary deliveryMethod={deliveryMethod} />
            <PromoCodeForm />
          </div>
        </div>
      </Container>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

function ReviewRow({ label, value, onEdit }: { label: string; value: string; onEdit: () => void }) {
  return (
    <div className="flex items-start justify-between gap-4 pb-4 border-b border-line last:border-0">
      <div>
        <p className="text-xs uppercase tracking-wider text-ink-mute">{label}</p>
        <p className="text-sm text-ink mt-1">{value}</p>
      </div>
      <button type="button" onClick={onEdit} className="text-xs text-ink underline underline-offset-2 shrink-0 cursor-pointer">
        Edit
      </button>
    </div>
  );
}
