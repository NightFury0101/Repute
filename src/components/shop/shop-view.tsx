import Link from "next/link";
import { PackageSearch } from "lucide-react";
import { Container } from "@/components/ui/container";
import { ProductCard } from "@/components/product/product-card";
import { FiltersPanel } from "@/components/shop/filters-panel";
import { FilterDrawer } from "@/components/shop/filter-drawer";
import { SortSelect } from "@/components/shop/sort-select";
import { Pagination } from "@/components/shop/pagination";
import { Button } from "@/components/ui/button";
import { getCategories } from "@/lib/data/categories";
import { getProducts, getProductFacets, type ProductFilters } from "@/lib/data/products";
import { parseShopParams, getPage, PAGE_SIZE, type ShopSearchParams } from "@/lib/shop-params";

export async function ShopView({
  searchParams,
  fixedCategorySlug,
  title,
  description,
  heading,
}: {
  searchParams: ShopSearchParams;
  fixedCategorySlug?: string;
  title: string;
  description?: string;
  heading?: React.ReactNode;
}) {
  const filters = parseShopParams(searchParams, fixedCategorySlug);
  const page = getPage(searchParams);

  const [categories, facets, { items, total }] = await Promise.all([
    getCategories(),
    getProductFacets(fixedCategorySlug ? { categorySlug: fixedCategorySlug } : {}),
    getProducts({ ...filters, take: PAGE_SIZE, skip: (page - 1) * PAGE_SIZE } satisfies ProductFilters),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function buildHref(nextPage: number) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(searchParams)) {
      if (value) params.set(key, value);
    }
    if (nextPage > 1) params.set("page", String(nextPage));
    else params.delete("page");
    const base = fixedCategorySlug ? `/shop/${fixedCategorySlug}` : "/shop";
    const qs = params.toString();
    return qs ? `${base}?${qs}` : base;
  }

  return (
    <div className="pt-10 sm:pt-14">
      <Container>
        {heading ?? (
          <div className="max-w-2xl">
            <h1 className="font-serif text-4xl sm:text-5xl text-ink">{title}</h1>
            {description && <p className="mt-4 text-ink-soft leading-relaxed">{description}</p>}
          </div>
        )}

        <div className="mt-10 flex items-center justify-between gap-4 flex-wrap border-b border-line pb-5">
          <div className="flex items-center gap-3">
            <FilterDrawer
              categories={categories}
              facets={facets}
              hideCategoryFilter={!!fixedCategorySlug}
              resultCount={total}
            />
            <p className="text-sm text-ink-soft">
              {total} {total === 1 ? "product" : "products"}
            </p>
          </div>
          <SortSelect />
        </div>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-12">
          <aside className="hidden lg:block">
            <div className="sticky top-28">
              <FiltersPanel
                categories={categories}
                facets={facets}
                hideCategoryFilter={!!fixedCategorySlug}
              />
            </div>
          </aside>

          <div>
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-24 gap-4">
                <PackageSearch size={40} className="text-ink-mute" strokeWidth={1.2} />
                <p className="text-ink-soft">No products match your filters.</p>
                <Button variant="secondary" asChild>
                  <Link href={fixedCategorySlug ? `/shop/${fixedCategorySlug}` : "/shop"}>Clear Filters</Link>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-x-5 gap-y-10">
                {items.map((product, i) => (
                  <ProductCard key={product.id} product={product} priority={i < 4} />
                ))}
              </div>
            )}

            <Pagination page={page} totalPages={totalPages} buildHref={buildHref} />
          </div>
        </div>
      </Container>
    </div>
  );
}
