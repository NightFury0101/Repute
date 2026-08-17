import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container, SectionHeading } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { ProductCarousel } from "@/components/product/product-carousel";
import type { ProductListItem } from "@/lib/data/products";

export function ProductRail({
  eyebrow,
  title,
  description,
  products,
  viewAllHref,
  tinted,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  products: ProductListItem[];
  viewAllHref: string;
  tinted?: boolean;
}) {
  if (!products.length) return null;

  return (
    <section className={tinted ? "py-20 sm:py-28 bg-cream" : "py-20 sm:py-28"}>
      <Container>
        <Reveal className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
          <SectionHeading eyebrow={eyebrow} title={title} description={description} />
          <Link
            href={viewAllHref}
            className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-ink border-b border-ink pb-0.5 hover:gap-2.5 transition-all shrink-0"
          >
            View All <ArrowRight size={15} />
          </Link>
        </Reveal>

        <div className="mt-10">
          <ProductCarousel products={products} />
        </div>

        <Link
          href={viewAllHref}
          className="sm:hidden mt-8 flex items-center justify-center gap-1.5 text-sm font-medium text-ink border border-ink rounded-full py-3"
        >
          View All <ArrowRight size={15} />
        </Link>
      </Container>
    </section>
  );
}
