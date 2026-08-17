import Image from "next/image";
import Link from "next/link";
import { Container, SectionHeading } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import type { Category } from "@/generated/prisma/client";

export function CategoryGrid({ categories }: { categories: Category[] }) {
  return (
    <section className="py-20 sm:py-28">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="Shop by Category"
            title="Find your ritual"
            description="Six edits, each considered down to the last ingredient — explore the full range or shop with intention."
          />
        </Reveal>

        <div className="mt-12 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-6">
          {categories.map((category, i) => (
            <Reveal key={category.id} delay={i * 60}>
              <Link
                href={`/shop/${category.slug}`}
                className="group relative block aspect-[3/4] overflow-hidden rounded-2xl bg-cream"
              >
                {category.image && (
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 16vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/0 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <p className="text-warm-white font-serif text-lg sm:text-xl">{category.name}</p>
                  <span className="text-warm-white/70 text-xs mt-0.5 inline-block group-hover:translate-x-1 transition-transform">
                    Shop now →
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
