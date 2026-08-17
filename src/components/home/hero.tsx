import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { HomepageSettings } from "@/lib/data/settings";

export function Hero({ settings }: { settings: HomepageSettings }) {
  return (
    <section className="relative overflow-hidden bg-cream">
      <div className="relative h-[86vh] min-h-[560px] max-h-[880px] w-full">
        <Image
          src={settings.heroImage}
          alt="Maldibay editorial hero"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ivory/90 via-ivory/40 to-transparent sm:from-ivory/85 sm:via-ivory/25" />

        <div className="relative h-full flex items-center">
          <div className="mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-12">
            <div className="max-w-lg">
              <span className="animate-fade-up inline-block text-xs font-semibold uppercase tracking-[0.25em] text-rose-gold-dark mb-5">
                The New Collection
              </span>
              <h1
                className="animate-fade-up font-serif text-[2.75rem] sm:text-6xl lg:text-[4.5rem] leading-[1.04] text-ink"
                style={{ animationDelay: "90ms" }}
              >
                {settings.heroTitle}
              </h1>
              <p
                className="animate-fade-up mt-6 text-base sm:text-lg text-ink-soft leading-relaxed max-w-md"
                style={{ animationDelay: "180ms" }}
              >
                {settings.heroSubtitle}
              </p>
              <div className="animate-fade-up mt-9 flex flex-wrap items-center gap-4" style={{ animationDelay: "280ms" }}>
                <Button asChild size="lg">
                  <Link href={settings.heroCtaLink}>{settings.heroCtaLabel}</Link>
                </Button>
                <Button asChild size="lg" variant="secondary">
                  <Link href={settings.heroCtaLink2}>{settings.heroCtaLabel2}</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
