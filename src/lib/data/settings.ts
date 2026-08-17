import "server-only";
import { prisma } from "@/lib/db";

export interface HomepageSettings {
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  heroCtaLabel: string;
  heroCtaLink: string;
  heroCtaLabel2: string;
  heroCtaLink2: string;
  featuredCollectionTitle: string;
  featuredCollectionSubtitle: string;
  featuredCollectionImage: string;
  featuredCollectionLink: string;
}

export const DEFAULT_HOMEPAGE_SETTINGS: HomepageSettings = {
  heroTitle: "Glow that feels\nnaturally yours.",
  heroSubtitle:
    "Lightweight skincare designed to leave your skin calm, luminous, and hydrated.",
  heroImage: "/generated/hero/hero-product-cutout.png",
  heroCtaLabel: "Shop the Collection",
  heroCtaLink: "/shop",
  heroCtaLabel2: "Explore Collection",
  heroCtaLink2: "/shop?collection=featured",
  featuredCollectionTitle: "The Édition Rituelle",
  featuredCollectionSubtitle:
    "A capsule collection of our most-loved, quietly luxurious essentials — curated for a slower, more intentional beauty routine.",
  featuredCollectionImage: "/generated/hero/featured-collection.jpg",
  featuredCollectionLink: "/shop?collection=featured",
};

export async function getHomepageSettings(): Promise<HomepageSettings> {
  const rows = await prisma.siteSetting.findMany({
    where: { key: { startsWith: "homepage." } },
  });
  const map = new Map(rows.map((r) => [r.key, r.value]));
  const settings = { ...DEFAULT_HOMEPAGE_SETTINGS };
  for (const key of Object.keys(settings) as (keyof HomepageSettings)[]) {
    const stored = map.get(`homepage.${key}`);
    if (stored !== undefined) {
      try {
        settings[key] = JSON.parse(stored);
      } catch {
        // ignore malformed value, keep default
      }
    }
  }
  return settings;
}

export async function getBanners(placement?: string) {
  return prisma.banner.findMany({
    where: { isActive: true, ...(placement ? { placement } : {}) },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getAllBannersAdmin() {
  return prisma.banner.findMany({ orderBy: [{ placement: "asc" }, { sortOrder: "asc" }] });
}
