import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductInfo } from "@/components/product/product-info";
import { ProductDetailsTabs } from "@/components/product/product-details-tabs";
import { ProductReviews } from "@/components/product/product-reviews";
import { FrequentlyBoughtTogether } from "@/components/product/frequently-bought-together";
import { ProductRail } from "@/components/home/product-rail";
import { TrackView } from "@/components/product/track-view";
import {
  getProductBySlug,
  getRelatedProducts,
  getFrequentlyBoughtWith,
} from "@/lib/data/products";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};

  const image = product.images[0]?.url;
  return {
    title: product.metaTitle || `${product.name} — ${product.brand.name}`,
    description: product.metaDescription || product.shortDescription || product.description || undefined,
    openGraph: {
      title: product.name,
      description: product.shortDescription ?? undefined,
      images: image ? [image] : undefined,
    },
    alternates: { canonical: `/product/${product.slug}` },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product || !product.isActive) notFound();

  const [related, bundled] = await Promise.all([
    getRelatedProducts(product, 8),
    getFrequentlyBoughtWith(product.id),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images.map((i) => i.url),
    description: product.shortDescription ?? product.description ?? undefined,
    sku: product.sku,
    brand: { "@type": "Brand", name: product.brand.name },
    offers: {
      "@type": "Offer",
      priceCurrency: "USD",
      price: product.discountPrice ?? product.price,
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/product/${product.slug}`,
    },
    ...(product.reviewCount > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: product.rating,
            reviewCount: product.reviewCount,
          },
        }
      : {}),
  };

  return (
    <div className="py-10 sm:py-14">
      <TrackView productId={product.id} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Container>
        <nav className="text-xs text-ink-mute mb-8 flex items-center gap-1.5 flex-wrap">
          <Link href="/shop" className="hover:text-ink">Shop</Link> /
          <Link href={`/shop/${product.category.slug}`} className="hover:text-ink">{product.category.name}</Link> /
          <span className="text-ink">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
          <ProductGallery images={product.images} name={product.name} />
          <ProductInfo product={product} />
        </div>

        <div className="mt-20 sm:mt-28">
          <ProductDetailsTabs product={product} />
        </div>

        {bundled.length > 0 && (
          <div className="mt-20 sm:mt-28">
            <FrequentlyBoughtTogether product={product} bundled={bundled} />
          </div>
        )}

        <div className="mt-20 sm:mt-28">
          <ProductReviews product={product} />
        </div>
      </Container>

      {related.length > 0 && (
        <div className="mt-20 sm:mt-28">
          <ProductRail
            eyebrow="You May Also Like"
            title="Related Products"
            products={related}
            viewAllHref={`/shop/${product.category.slug}`}
            tinted
          />
        </div>
      )}
    </div>
  );
}
