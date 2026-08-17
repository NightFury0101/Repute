import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Leaf, HeartHandshake, Sparkles, Globe2 } from "lucide-react";
import { Container, SectionHeading } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "About Us",
  description: "The story, values and people behind Repute — a premium beauty destination built on quiet luxury and considered formulation.",
};

const VALUES = [
  {
    icon: Leaf,
    title: "Considered Formulation",
    description: "Every product is developed with dermatologists and formulators, favoring fewer, better ingredients over long lists.",
  },
  {
    icon: HeartHandshake,
    title: "Cruelty-Free, Always",
    description: "We never test on animals, and we hold every brand we carry to the same standard.",
  },
  {
    icon: Sparkles,
    title: "Quiet Luxury",
    description: "Beautiful packaging and rich textures, without the markup of a legacy name. Quality first.",
  },
  {
    icon: Globe2,
    title: "Responsibly Sourced",
    description: "From refillable packaging to reef-safe formulas, we're building toward a lower-impact routine.",
  },
];

export default function AboutPage() {
  return (
    <div>
      <section className="relative h-[56vh] min-h-[420px] max-h-[620px] w-full">
        <Image src="/generated/hero/about-hero.jpg" alt="Repute studio" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-ink/35 flex items-center justify-center text-center px-6">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-warm-white/80">Our Story</span>
            <h1 className="font-serif text-4xl sm:text-6xl text-warm-white mt-4">Beauty, Considered.</h1>
          </div>
        </div>
      </section>

      <Container className="py-20 sm:py-28">
        <Reveal className="max-w-2xl mx-auto text-center">
          <p className="text-lg text-ink-soft leading-relaxed">
            Repute began with a simple frustration: too much of the beauty industry asks you to choose between
            formulas that work and brands that feel considered. We didn&apos;t think that trade-off should exist. So
            we built a home for makeup, skincare, haircare, fragrance and body care that is as thoughtful in its
            formulation as it is in its presentation — sourced from independent labs and studios who care as much
            about what goes into a product as how it feels to use.
          </p>
        </Reveal>
      </Container>

      <section className="py-20 sm:py-28 bg-cream">
        <Container>
          <Reveal>
            <SectionHeading eyebrow="What We Stand For" title="Our Values" align="center" className="mx-auto" />
          </Reveal>
          <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {VALUES.map((value, i) => (
              <Reveal key={value.title} delay={i * 80} className="flex flex-col items-center text-center gap-4">
                <div className="h-14 w-14 rounded-full bg-warm-white flex items-center justify-center">
                  <value.icon size={22} className="text-rose-gold-dark" strokeWidth={1.5} />
                </div>
                <h3 className="font-serif text-xl text-ink">{value.title}</h3>
                <p className="text-sm text-ink-soft leading-relaxed">{value.description}</p>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <Container className="py-20 sm:py-28">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <Reveal className="relative aspect-[4/5] rounded-3xl overflow-hidden">
            <Image src="/generated/hero/featured-collection.jpg" alt="Repute curation" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
          </Reveal>
          <Reveal delay={100}>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-gold-dark">How We Curate</span>
            <h2 className="font-serif text-3xl sm:text-4xl mt-4 text-ink">Every product earns its place.</h2>
            <p className="mt-5 text-ink-soft leading-relaxed">
              We test everything before it reaches our shelves — texture, scent, longevity, and how it performs
              across skin tones and types. Fewer than a third of what we sample makes the final edit. What remains
              is a catalog we&apos;re genuinely proud to put our name on.
            </p>
            <Button asChild size="lg" className="mt-8">
              <Link href="/shop">Shop the Edit</Link>
            </Button>
          </Reveal>
        </div>
      </Container>
    </div>
  );
}
