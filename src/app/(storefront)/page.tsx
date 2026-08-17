import { Hero } from "@/components/home/hero";
import { CategoryGrid } from "@/components/home/category-grid";
import { ProductRail } from "@/components/home/product-rail";
import { PromoBanner } from "@/components/home/promo-banner";
import { FeaturedCollection } from "@/components/home/featured-collection";
import { ReviewsSection } from "@/components/home/reviews-section";
import { NewsletterSection } from "@/components/home/newsletter-section";
import { getCategories } from "@/lib/data/categories";
import { getBestSellers, getNewArrivals, getFeaturedProducts } from "@/lib/data/products";
import { getHomepageSettings, getBanners } from "@/lib/data/settings";

export default async function HomePage() {
  const [categories, settings, promoBanners, bestSellers, newArrivals, featured] = await Promise.all([
    getCategories(),
    getHomepageSettings(),
    getBanners("promo"),
    getBestSellers(10),
    getNewArrivals(8),
    getFeaturedProducts(10),
  ]);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Maldibay",
    url: siteUrl,
    logo: `${siteUrl}/favicon.svg`,
    sameAs: [],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Hero settings={settings} />
      <CategoryGrid categories={categories} />
      <ProductRail
        eyebrow="Customer Favorites"
        title="Best Sellers"
        description="The formulas our community reaches for again and again."
        products={bestSellers.items}
        viewAllHref="/shop?filter=bestsellers"
      />
      {promoBanners[0] && <PromoBanner banner={promoBanners[0]} />}
      <ProductRail
        eyebrow="Just Landed"
        title="New Arrivals"
        description="Fresh formulas, straight from the lab to your routine."
        products={newArrivals.items}
        viewAllHref="/shop?filter=new"
        tinted
      />
      <FeaturedCollection settings={settings} />
      {featured.items.length > 0 && (
        <ProductRail
          eyebrow="Curated For You"
          title="Featured Edit"
          products={featured.items}
          viewAllHref="/shop?filter=featured"
        />
      )}
      <ReviewsSection />
      <NewsletterSection />
    </>
  );
}
