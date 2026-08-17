import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import type { Banner } from "@/generated/prisma/client";

export function PromoBanner({ banner }: { banner: Banner }) {
  return (
    <section className="relative py-2 sm:py-4">
      <div className="relative mx-4 sm:mx-8 lg:mx-12 h-[60vh] min-h-[420px] max-h-[640px] overflow-hidden rounded-3xl">
        {banner.image && (
          <Image
            src={banner.image}
            alt={banner.title}
            fill
            sizes="100vw"
            className="object-cover"
          />
        )}
        <div className="absolute inset-0 bg-ink/45" />
        <div className="relative h-full flex items-center justify-center text-center px-6">
          <Reveal className="max-w-xl flex flex-col items-center">
            <h2 className="font-serif italic text-4xl sm:text-5xl lg:text-6xl text-warm-white leading-tight">
              {banner.title}
            </h2>
            {banner.subtitle && (
              <p className="mt-5 text-warm-white/85 text-base sm:text-lg leading-relaxed">{banner.subtitle}</p>
            )}
            {banner.ctaLabel && banner.ctaLink && (
              <Button asChild size="lg" variant="blush" className="mt-8">
                <Link href={banner.ctaLink}>{banner.ctaLabel}</Link>
              </Button>
            )}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
