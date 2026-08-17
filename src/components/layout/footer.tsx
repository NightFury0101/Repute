import Link from "next/link";
import { CreditCard, Landmark, Wallet } from "lucide-react";
import { Container } from "@/components/ui/container";
import { NewsletterForm } from "@/components/layout/newsletter-form";
import { IconInstagram, IconFacebook, IconX } from "@/components/ui/social-icons";
import type { Category } from "@/generated/prisma/client";

export function Footer({ categories }: { categories: Category[] }) {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 bg-ink text-warm-white/80">
      <Container className="py-16">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:grid-cols-6">
          <div className="col-span-2 sm:col-span-3 lg:col-span-2 flex flex-col gap-4">
            <Link href="/" className="font-serif text-2xl text-warm-white">
              Repute
            </Link>
            <p className="text-sm leading-relaxed max-w-xs">
              Thoughtfully formulated beauty essentials — makeup, skincare, haircare, fragrance and body
              care, made to become part of your everyday ritual.
            </p>
            <div className="flex items-center gap-3 mt-2">
              {[IconInstagram, IconFacebook, IconX].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label="Social media"
                  className="h-9 w-9 rounded-full border border-warm-white/20 flex items-center justify-center hover:bg-warm-white/10 transition-colors"
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-wider text-warm-white mb-4">Shop</h4>
            <ul className="flex flex-col gap-2.5 text-sm">
              <li><Link href="/shop" className="hover:text-warm-white transition-colors">All Products</Link></li>
              {categories.slice(0, 5).map((c) => (
                <li key={c.id}>
                  <Link href={`/shop/${c.slug}`} className="hover:text-warm-white transition-colors">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-wider text-warm-white mb-4">Customer Support</h4>
            <ul className="flex flex-col gap-2.5 text-sm">
              <li><Link href="/contact" className="hover:text-warm-white transition-colors">Contact Us</Link></li>
              <li><Link href="/faq" className="hover:text-warm-white transition-colors">FAQ</Link></li>
              <li><Link href="/shipping-returns" className="hover:text-warm-white transition-colors">Shipping &amp; Returns</Link></li>
              <li><Link href="/account/orders" className="hover:text-warm-white transition-colors">Track Order</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-wider text-warm-white mb-4">Company</h4>
            <ul className="flex flex-col gap-2.5 text-sm">
              <li><Link href="/about" className="hover:text-warm-white transition-colors">About Us</Link></li>
              <li><Link href="/privacy-policy" className="hover:text-warm-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-warm-white transition-colors">Terms &amp; Conditions</Link></li>
            </ul>
          </div>

          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <h4 className="text-xs uppercase tracking-wider text-warm-white mb-4">Stay in the Know</h4>
            <p className="text-sm mb-4">First access to new launches, edits &amp; rituals.</p>
            <NewsletterForm variant="dark" />
          </div>
        </div>

        <div className="mt-14 pt-8 border-t border-warm-white/15 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-warm-white/60">© {year} Repute. All rights reserved.</p>
          <div className="flex items-center gap-4 text-warm-white/60">
            <span className="flex items-center gap-1.5 text-xs"><CreditCard size={16} /> Visa</span>
            <span className="flex items-center gap-1.5 text-xs"><CreditCard size={16} /> Mastercard</span>
            <span className="flex items-center gap-1.5 text-xs"><Wallet size={16} /> PayPal</span>
            <span className="flex items-center gap-1.5 text-xs"><Landmark size={16} /> Bank Transfer</span>
          </div>
        </div>
      </Container>
    </footer>
  );
}
