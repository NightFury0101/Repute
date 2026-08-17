import type { ProductFilters } from "@/lib/data/products";
import type { SortOption } from "@/lib/constants";

export interface ShopSearchParams {
  cat?: string;
  brand?: string;
  min?: string;
  max?: string;
  rating?: string;
  stock?: string;
  sale?: string;
  type?: string;
  skin?: string;
  sort?: string;
  q?: string;
  page?: string;
  filter?: string; // shortcut: new | bestsellers | featured
}

export function parseShopParams(
  params: ShopSearchParams,
  fixedCategorySlug?: string
): ProductFilters {
  const filters: ProductFilters = {};

  if (fixedCategorySlug) {
    filters.categorySlug = fixedCategorySlug;
  } else if (params.cat) {
    filters.categorySlugs = params.cat.split(",").filter(Boolean);
  }

  if (params.brand) filters.brandSlugs = params.brand.split(",").filter(Boolean);
  if (params.min) filters.minPrice = Number(params.min);
  if (params.max) filters.maxPrice = Number(params.max);
  if (params.rating) filters.minRating = Number(params.rating);
  if (params.stock === "1") filters.inStockOnly = true;
  if (params.sale === "1") filters.onSaleOnly = true;
  if (params.type) filters.productTypes = params.type.split(",").filter(Boolean);
  if (params.skin) filters.skinTypes = params.skin.split(",").filter(Boolean);
  if (params.q) filters.query = params.q;
  if (params.sort) filters.sort = params.sort as SortOption;

  if (params.filter === "new") filters.isNewArrival = true;
  if (params.filter === "bestsellers") filters.isBestSeller = true;
  if (params.filter === "featured") filters.isFeatured = true;

  return filters;
}

export const PAGE_SIZE = 24;

export function getPage(params: ShopSearchParams) {
  const page = Number(params.page ?? "1");
  return Number.isFinite(page) && page > 0 ? page : 1;
}
