import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { SearchBox } from "@/components/search/search-box";
import { ShopView } from "@/components/shop/shop-view";
import type { ShopSearchParams } from "@/lib/shop-params";

export const metadata: Metadata = {
  title: "Search",
  description: "Search Repute for products, brands and categories.",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<ShopSearchParams>;
}) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";

  return (
    <div className="py-14 sm:py-16">
      <Container>
        <SearchBox initialQuery={query} autoFocus={!query} />
      </Container>

      {query ? (
        <ShopView searchParams={params} title={`Results for "${query}"`} />
      ) : (
        <Container className="mt-16 text-center">
          <p className="text-ink-soft">Start typing to search our full catalog of products, brands and categories.</p>
        </Container>
      )}
    </div>
  );
}
