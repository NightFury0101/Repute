import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import type { HomepageSettings } from "@/lib/data/settings";

export function FeaturedCollection({ settings }: { settings: HomepageSettings }) {
  return (
    <section className="py-20 sm:py-28">
      <Container>
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <Reveal className="relative aspect-[4/5] rounded-3xl overflow-hidden order-1">
            <Image
              src={settings.featuredCollectionImage}
              alt={settings.featuredCollectionTitle}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </Reveal>
          <Reveal delay={120} className="order-2">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-gold-dark">
              Featured Collection
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl mt-4 leading-tight text-ink">
              {settings.featuredCollectionTitle}
            </h2>
            <p className="mt-5 text-ink-soft text-base leading-relaxed max-w-md">
              {settings.featuredCollectionSubtitle}
            </p>
            <Button asChild size="lg" className="mt-8">
              <Link href={settings.featuredCollectionLink}>Discover the Edit</Link>
            </Button>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
