import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { NewsletterForm } from "@/components/layout/newsletter-form";

export function NewsletterSection() {
  return (
    <section className="py-20 sm:py-28">
      <Container>
        <Reveal className="mx-auto max-w-2xl flex flex-col items-center text-center rounded-3xl bg-blush/50 px-8 py-16 sm:px-16">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-gold-dark">
            Join the Repute Circle
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl mt-4 text-ink">Beauty notes, delivered.</h2>
          <p className="mt-4 text-ink-soft max-w-md">
            Be first to know about new launches, exclusive offers and the rituals behind our favorite formulas.
          </p>
          <div className="mt-8 flex justify-center w-full">
            <NewsletterForm variant="light" />
          </div>
          <p className="mt-4 text-xs text-ink-mute">No spam, ever. Unsubscribe anytime.</p>
        </Reveal>
      </Container>
    </section>
  );
}
