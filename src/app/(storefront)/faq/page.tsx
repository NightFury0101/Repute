import type { Metadata } from "next";
import Link from "next/link";
import { Container, SectionHeading } from "@/components/ui/container";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Answers to frequently asked questions about ordering, shipping, returns and products at Repute.",
};

const FAQ_GROUPS = [
  {
    title: "Orders & Payment",
    items: [
      {
        q: "What payment methods do you accept?",
        a: "We currently support Cash on Delivery and Bank Transfer at checkout, with secure card payments coming soon through our payment partner.",
      },
      {
        q: "Can I change or cancel my order after placing it?",
        a: "Contact us within 2 hours of placing your order and we'll do our best to update or cancel it before it enters processing. Once an order has shipped, it can no longer be changed.",
      },
      {
        q: "Do you offer gift wrapping?",
        a: "Yes — add a note at checkout and our team will include complimentary gift wrapping and a handwritten card for orders marked as gifts.",
      },
    ],
  },
  {
    title: "Shipping & Delivery",
    items: [
      {
        q: "How long does delivery take?",
        a: "Standard delivery takes 4–6 business days. Express delivery arrives in 1–2 business days. See our Shipping & Returns page for full details.",
      },
      {
        q: "Do you ship internationally?",
        a: "We currently ship across the Maldives, with select international destinations available at checkout. More regions are added regularly.",
      },
      {
        q: "How can I track my order?",
        a: "Once your order ships, you'll receive a tracking number by email. You can also view live status from your Account → Orders page.",
      },
    ],
  },
  {
    title: "Returns & Refunds",
    items: [
      {
        q: "What is your return policy?",
        a: "Unused, unopened items can be returned within 30 days of delivery for a full refund. See our Shipping & Returns page for the full policy.",
      },
      {
        q: "My order arrived damaged — what do I do?",
        a: "We're sorry! Contact our team within 48 hours of delivery with photos of the damage and we'll send a replacement or refund right away.",
      },
    ],
  },
  {
    title: "Products & Ingredients",
    items: [
      {
        q: "Are Repute products cruelty-free?",
        a: "Yes — every brand we carry is certified cruelty-free, and a growing number of our formulas are also fully vegan. Look for the badges on each product page.",
      },
      {
        q: "How do I know which shade or size is right for me?",
        a: "Each product page includes a detailed shade and size guide. If you're still unsure, our support team is happy to help you find the right match.",
      },
      {
        q: "Can I leave a review with photos?",
        a: "Absolutely — once you're signed in, visit any product page you've purchased and select 'Write a Review' to share your rating, comments and photos.",
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <div className="py-14 sm:py-20">
      <Container className="max-w-3xl">
        <SectionHeading eyebrow="Support" title="Frequently Asked Questions" align="center" className="mx-auto" />

        <div className="mt-14 flex flex-col gap-12">
          {FAQ_GROUPS.map((group) => (
            <div key={group.title}>
              <h2 className="font-serif text-2xl text-ink mb-2">{group.title}</h2>
              <Accordion type="single" collapsible>
                {group.items.map((item, i) => (
                  <AccordionItem key={i} value={`${group.title}-${i}`}>
                    <AccordionTrigger>{item.q}</AccordionTrigger>
                    <AccordionContent>{item.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>

        <p className="text-center text-ink-soft mt-16">
          Still have questions?{" "}
          <Link href="/contact" className="text-ink underline underline-offset-2">
            Contact our team
          </Link>
          .
        </p>
      </Container>
    </div>
  );
}
