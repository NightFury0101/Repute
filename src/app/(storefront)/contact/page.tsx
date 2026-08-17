import type { Metadata } from "next";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { Container, SectionHeading } from "@/components/ui/container";
import { ContactForm } from "@/components/contact/contact-form";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with the Repute customer care team.",
};

const INFO = [
  { icon: Mail, label: "Email", value: "hello@repute.com" },
  { icon: Phone, label: "Phone", value: "+960 330-1234" },
  { icon: MapPin, label: "Studio", value: "Malé, Maldives" },
  { icon: Clock, label: "Hours", value: "Mon–Fri, 9am–6pm MVT" },
];

export default function ContactPage() {
  return (
    <div className="py-14 sm:py-20">
      <Container>
        <SectionHeading
          eyebrow="Get in Touch"
          title="We'd Love to Hear From You"
          description="Questions about an order, a product, or a partnership? Send us a note and our team will get back to you within 1–2 business days."
        />

        <div className="mt-14 grid lg:grid-cols-[1fr_380px] gap-14">
          <ContactForm />

          <div className="flex flex-col gap-6">
            {INFO.map((item) => (
              <div key={item.label} className="flex items-start gap-4 rounded-2xl bg-ivory p-5">
                <item.icon size={18} className="text-rose-gold-dark mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs uppercase tracking-wider text-ink-mute">{item.label}</p>
                  <p className="text-sm text-ink mt-1">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
}
