import type { Metadata } from "next";
import { Container } from "@/components/ui/container";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Maldibay collects, uses and protects your personal information.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="py-14 sm:py-20">
      <Container className="max-w-3xl">
        <h1 className="font-serif text-4xl sm:text-5xl text-ink">Privacy Policy</h1>
        <p className="text-sm text-ink-mute mt-3">Last updated: January 1, 2026</p>

        <div className="mt-10 flex flex-col gap-9 text-ink-soft leading-relaxed [&_h2]:font-serif [&_h2]:text-2xl [&_h2]:text-ink [&_h2]:mb-3">
          <section>
            <p>
              Maldibay (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) respects your privacy and is committed to
              protecting the personal information you share with us. This policy explains what data we collect,
              how we use it, and the choices you have.
            </p>
          </section>

          <section>
            <h2>Information We Collect</h2>
            <ul className="list-disc pl-5 flex flex-col gap-2">
              <li><strong>Account information:</strong> name, email address, phone number, and password (stored securely as a hash — we never store plain-text passwords).</li>
              <li><strong>Order information:</strong> shipping and billing addresses, order history, and items purchased.</li>
              <li><strong>Usage data:</strong> pages visited, products viewed, and interactions with our site, used to improve your shopping experience.</li>
              <li><strong>Content you provide:</strong> product reviews, review photos, and messages sent through our contact form.</li>
            </ul>
          </section>

          <section>
            <h2>How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc pl-5 flex flex-col gap-2 mt-2">
              <li>Process and fulfill your orders, including shipping and customer support.</li>
              <li>Maintain your account, wishlist, and order history.</li>
              <li>Send order confirmations, shipping updates, and — if you opt in — newsletters and promotions.</li>
              <li>Improve our products, website, and overall shopping experience.</li>
              <li>Detect and prevent fraud or misuse of our platform.</li>
            </ul>
          </section>

          <section>
            <h2>Cookies & Local Storage</h2>
            <p>
              We use cookies and browser local storage to keep you signed in, remember items in your shopping bag,
              and understand how our site is used. You can control cookies through your browser settings, though
              disabling them may affect site functionality such as checkout.
            </p>
          </section>

          <section>
            <h2>Sharing Your Information</h2>
            <p>
              We do not sell your personal information. We share data only with trusted service providers who help
              us operate our business — such as payment processing and delivery courier partners — and only to the
              extent necessary for them to perform their services.
            </p>
          </section>

          <section>
            <h2>Data Security</h2>
            <p>
              We implement industry-standard safeguards, including encrypted password storage, access controls, and
              secure server infrastructure, to protect your personal information from unauthorized access, loss, or
              misuse.
            </p>
          </section>

          <section>
            <h2>Your Rights</h2>
            <p>
              You may access, update, or delete your account information at any time from your Account Settings.
              You can unsubscribe from marketing emails using the link in any newsletter, or by contacting us
              directly. To request full deletion of your data, reach out via our Contact page.
            </p>
          </section>

          <section>
            <h2>Children&apos;s Privacy</h2>
            <p>
              Maldibay is not directed at children under 16, and we do not knowingly collect personal information
              from children.
            </p>
          </section>

          <section>
            <h2>Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. Material changes will be reflected by an updated
              &quot;Last updated&quot; date at the top of this page.
            </p>
          </section>

          <section>
            <h2>Contact Us</h2>
            <p>
              Questions about this policy or your data? Reach us anytime at{" "}
              <a href="mailto:privacy@maldibay.com" className="text-ink underline underline-offset-2">
                privacy@maldibay.com
              </a>{" "}
              or through our{" "}
              <a href="/contact" className="text-ink underline underline-offset-2">
                Contact page
              </a>
              .
            </p>
          </section>
        </div>
      </Container>
    </div>
  );
}
