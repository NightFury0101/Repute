import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Container, SectionHeading } from "@/components/ui/container";
import { getCategories } from "@/lib/data/categories";

export const metadata: Metadata = {
  title: "Categories",
  description: "Explore every Maldibay category — makeup, skincare, haircare, fragrance, body care and tools.",
};

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="py-14 sm:py-20">
      <Container>
        <SectionHeading
          eyebrow="Explore"
          title="Shop by Category"
          description="Six edits, each considered down to the last ingredient."
        />

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/shop/${category.slug}`}
              className="group relative flex items-end overflow-hidden rounded-3xl bg-cream aspect-[16/10] sm:aspect-[4/3]"
            >
              {category.image && (
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  sizes="(max-width: 640px) 100vw, 50vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/10 to-transparent" />
              <div className="relative p-7 sm:p-9">
                <p className="font-serif text-2xl sm:text-3xl text-warm-white">{category.name}</p>
                <p className="text-warm-white/75 text-sm mt-2 max-w-sm">{category.description}</p>
                <span className="inline-flex items-center gap-1.5 text-warm-white text-sm mt-4 group-hover:gap-2.5 transition-all">
                  {category._count.products} products →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </div>
  );
}
