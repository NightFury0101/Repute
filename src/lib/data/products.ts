import "server-only";
import { prisma } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";
import { SortOption } from "@/lib/constants";

const productListInclude = {
  images: { orderBy: { sortOrder: "asc" as const } },
  brand: true,
  category: true,
  variants: { orderBy: { sortOrder: "asc" as const } },
} satisfies Prisma.ProductInclude;

export type ProductListItem = Prisma.ProductGetPayload<{
  include: typeof productListInclude;
}>;

const productDetailInclude = {
  ...productListInclude,
  tags: { include: { tag: true } },
  reviews: {
    where: { status: "APPROVED" as const },
    include: { user: true },
    orderBy: { createdAt: "desc" as const },
  },
  bundleOf: { include: { bundledProduct: { include: productListInclude } } },
} satisfies Prisma.ProductInclude;

export type ProductDetail = Prisma.ProductGetPayload<{
  include: typeof productDetailInclude;
}>;

export interface ProductFilters {
  categorySlug?: string;
  categorySlugs?: string[];
  brandSlugs?: string[];
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  inStockOnly?: boolean;
  onSaleOnly?: boolean;
  productTypes?: string[];
  skinTypes?: string[];
  query?: string;
  sort?: SortOption;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  excludeId?: string;
  take?: number;
  skip?: number;
}

function buildWhere(filters: ProductFilters): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = { isActive: true };

  if (filters.categorySlug) {
    where.category = { slug: filters.categorySlug };
  }
  if (filters.categorySlugs?.length) {
    where.category = { slug: { in: filters.categorySlugs } };
  }
  if (filters.brandSlugs?.length) {
    where.brand = { slug: { in: filters.brandSlugs } };
  }
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    where.price = {
      ...(filters.minPrice !== undefined ? { gte: filters.minPrice } : {}),
      ...(filters.maxPrice !== undefined ? { lte: filters.maxPrice } : {}),
    };
  }
  if (filters.minRating !== undefined) {
    where.rating = { gte: filters.minRating };
  }
  if (filters.inStockOnly) {
    where.stock = { gt: 0 };
  }
  if (filters.onSaleOnly) {
    where.discountPrice = { not: null };
  }
  if (filters.productTypes?.length) {
    where.productType = { in: filters.productTypes };
  }
  if (filters.skinTypes?.length) {
    where.OR = filters.skinTypes.map((st) => ({ skinType: { contains: st } }));
  }
  if (filters.query) {
    const q = filters.query;
    where.AND = [
      ...(Array.isArray(where.AND) ? where.AND : where.AND ? [where.AND] : []),
      {
        OR: [
          { name: { contains: q } },
          { shortDescription: { contains: q } },
          { description: { contains: q } },
          { brand: { name: { contains: q } } },
          { category: { name: { contains: q } } },
          { tags: { some: { tag: { name: { contains: q } } } } },
        ],
      },
    ];
  }
  if (filters.isFeatured) where.isFeatured = true;
  if (filters.isBestSeller) where.isBestSeller = true;
  if (filters.isNewArrival) where.isNewArrival = true;
  if (filters.excludeId) where.id = { not: filters.excludeId };

  return where;
}

function buildOrderBy(sort?: SortOption): Prisma.ProductOrderByWithRelationInput[] {
  switch (sort) {
    case "newest":
      return [{ createdAt: "desc" }];
    case "best-selling":
      return [{ isBestSeller: "desc" }, { reviewCount: "desc" }];
    case "price-asc":
      return [{ price: "asc" }];
    case "price-desc":
      return [{ price: "desc" }];
    case "rating":
      return [{ rating: "desc" }];
    case "featured":
    default:
      return [{ isFeatured: "desc" }, { createdAt: "desc" }];
  }
}

export async function getProducts(filters: ProductFilters = {}) {
  const where = buildWhere(filters);
  const orderBy = buildOrderBy(filters.sort);

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      include: productListInclude,
      take: filters.take,
      skip: filters.skip,
    }),
    prisma.product.count({ where }),
  ]);

  return { items, total };
}

export async function getProductFacets(baseFilters: ProductFilters = {}) {
  const where = buildWhere({ ...baseFilters, brandSlugs: undefined, productTypes: undefined });
  const products = await prisma.product.findMany({
    where,
    select: {
      price: true,
      productType: true,
      brand: { select: { name: true, slug: true } },
      skinType: true,
    },
  });

  const brandMap = new Map<string, { name: string; slug: string; count: number }>();
  const typeMap = new Map<string, number>();
  let maxPrice = 0;

  for (const p of products) {
    maxPrice = Math.max(maxPrice, p.price);
    const existing = brandMap.get(p.brand.slug);
    brandMap.set(p.brand.slug, {
      name: p.brand.name,
      slug: p.brand.slug,
      count: (existing?.count ?? 0) + 1,
    });
    if (p.productType) {
      typeMap.set(p.productType, (typeMap.get(p.productType) ?? 0) + 1);
    }
  }

  return {
    brands: Array.from(brandMap.values()).sort((a, b) => a.name.localeCompare(b.name)),
    productTypes: Array.from(typeMap.entries()).map(([name, count]) => ({ name, count })),
    maxPrice: Math.ceil(maxPrice) || 100,
  };
}

export async function getProductBySlug(slug: string): Promise<ProductDetail | null> {
  return prisma.product.findUnique({
    where: { slug },
    include: productDetailInclude,
  });
}

export async function getProductById(id: string) {
  return prisma.product.findUnique({ where: { id }, include: productListInclude });
}

export async function getProductByIdAdmin(id: string): Promise<ProductDetail | null> {
  return prisma.product.findUnique({ where: { id }, include: productDetailInclude });
}

export interface AdminProductFilters {
  query?: string;
  categoryId?: string;
  status?: "active" | "inactive";
}

export async function getAdminProducts(filters: AdminProductFilters = {}) {
  const where: Prisma.ProductWhereInput = {};
  if (filters.query) {
    where.OR = [
      { name: { contains: filters.query } },
      { sku: { contains: filters.query } },
      { brand: { name: { contains: filters.query } } },
    ];
  }
  if (filters.categoryId) where.categoryId = filters.categoryId;
  if (filters.status === "active") where.isActive = true;
  if (filters.status === "inactive") where.isActive = false;

  return prisma.product.findMany({
    where,
    include: productListInclude,
    orderBy: { createdAt: "desc" },
  });
}

export async function getFeaturedProducts(take = 8) {
  return getProducts({ isFeatured: true, take });
}

export async function getBestSellers(take = 10) {
  return getProducts({ isBestSeller: true, take, sort: "best-selling" });
}

export async function getNewArrivals(take = 8) {
  return getProducts({ isNewArrival: true, take, sort: "newest" });
}

export async function getRelatedProducts(product: { categoryId: string; id: string }, take = 8) {
  return prisma.product.findMany({
    where: { categoryId: product.categoryId, id: { not: product.id }, isActive: true },
    include: productListInclude,
    take,
    orderBy: { rating: "desc" },
  });
}

export async function getFrequentlyBoughtWith(productId: string) {
  const bundles = await prisma.productBundle.findMany({
    where: { productId },
    include: { bundledProduct: { include: productListInclude } },
  });
  return bundles.map((b) => b.bundledProduct);
}

export async function searchProducts(query: string, take = 20) {
  if (!query.trim()) return { items: [], total: 0 };
  return getProducts({ query, take, sort: "featured" });
}

export async function getSearchSuggestions(query: string) {
  if (!query.trim()) return { products: [], brands: [], categories: [] };
  const [products, brands, categories] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true, name: { contains: query } },
      include: { images: { take: 1 }, brand: true },
      take: 5,
    }),
    prisma.brand.findMany({ where: { name: { contains: query } }, take: 3 }),
    prisma.category.findMany({ where: { name: { contains: query }, isActive: true }, take: 3 }),
  ]);
  return { products, brands, categories };
}
