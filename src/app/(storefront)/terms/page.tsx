import type { Metadata } from "next";
import { Container } from "@/components/ui/container";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "The terms and conditions governing your use of Maldibay and purchases made on our site.",
};

export default function TermsPage() {
  return (
    <div className="py-14 sm:py-20">
      <Container className="max-w-3xl">
        <h1 className="font-serif text-4xl sm:text-5xl text-ink">Terms &amp; Conditions</h1>
        <p className="text-sm text-ink-mute mt-3">Last updated: January 1, 2026</p>

        <div className="mt-10 flex flex-col gap-9 text-ink-soft leading-relaxed [&_h2]:font-serif [&_h2]:text-2xl [&_h2]:text-ink [&_h2]:mb-3">
          <section>
            <p>
              These Terms &amp; Conditions (&quot;Terms&quot;) govern your access to and use of Maldibay
              (&quot;the Site&quot;), including any purchase made through it. By creating an account or placing an
              order, you agree to these Terms.
            </p>
          </section>

          <section>
            <h2>1. Eligibility</h2>
            <p>
              You must be at least 18 years old, or have the consent of a parent or guardian, to create an account
              or place an order on Maldibay.
            </p>
          </section>

          <section>
            <h2>2. Account Responsibility</h2>
            <p>
              You are responsible for maintaining the confidentiality of your account credentials and for all
              activity that occurs under your account. Notify us immediately if you suspect unauthorized use.
            </p>
          </section>

          <section>
            <h2>3. Product Information & Pricing</h2>
            <p>
              We strive to display accurate product descriptions, images, and pricing. Colors may vary slightly
              depending on your display. We reserve the right to correct pricing errors and to limit quantities on
              any order, even after an order has been submitted.
            </p>
          </section>

          <section>
            <h2>4. Orders & Payment</h2>
            <p>
              Placing an order constitutes an offer to purchase. We reserve the right to refuse or cancel any order
              for reasons including product availability, errors in pricing or product information, or suspected
              fraud. Accepted payment methods are shown at checkout; card payments will be processed by a licensed
              third-party payment provider once integrated, and no card details are stored on our servers.
            </p>
          </section>

          <section>
            <h2>5. Shipping & Delivery</h2>
            <p>
              Estimated delivery timelines are provided at checkout and on our{" "}
              <a href="/shipping-returns" className="text-ink underline underline-offset-2">
                Shipping &amp; Returns
              </a>{" "}
              page. Maldibay is not responsible for delays caused by couriers, customs, or circumstances outside our
              reasonable control.
            </p>
          </section>

          <section>
            <h2>6. Returns & Refunds</h2>
            <p>
              Returns are accepted in accordance with our{" "}
              <a href="/shipping-returns" className="text-ink underline underline-offset-2">
                Shipping &amp; Returns
              </a>{" "}
              policy. Refunds are issued to the original payment method once a return is received and inspected.
            </p>
          </section>

          <section>
            <h2>7. Reviews & User Content</h2>
            <p>
              By submitting a review, photo, or other content, you grant Maldibay a non-exclusive, royalty-free
              license to display and use that content in connection with our site and marketing. You confirm that
              any content you submit is your own and does not violate any third party&apos;s rights. We reserve the
              right to moderate, edit, or remove content that violates our community guidelines.
            </p>
          </section>

          <section>
            <h2>8. Promotions & Discount Codes</h2>
            <p>
              Promotional codes are subject to the terms stated at the time of issue, including minimum spend,
              eligible products, and expiration dates. Codes cannot be combined unless explicitly stated and have
              no cash value.
            </p>
          </section>

          <section>
            <h2>9. Intellectual Property</h2>
            <p>
              All content on Maldibay — including text, graphics, logos, and images — is the property of Maldibay
              or its licensors and is protected by applicable intellectual property laws. You may not reproduce or
              use our content without written permission.
            </p>
          </section>

          <section>
            <h2>10. Limitation of Liability</h2>
            <p>
              Maldibay is provided on an &quot;as is&quot; basis. To the fullest extent permitted by law, we are not
              liable for any indirect, incidental, or consequential damages arising from your use of the Site or
              products purchased through it. Nothing in these Terms limits liability that cannot be excluded under
              applicable law.
            </p>
          </section>

          <section>
            <h2>11. Changes to These Terms</h2>
            <p>
              We may revise these Terms from time to time. Continued use of the Site after changes are posted
              constitutes acceptance of the revised Terms.
            </p>
          </section>

          <section>
            <h2>12. Contact</h2>
            <p>
              Questions about these Terms can be sent to{" "}
              <a href="mailto:legal@maldibay.com" className="text-ink underline underline-offset-2">
                legal@maldibay.com
              </a>{" "}
              or via our{" "}
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
