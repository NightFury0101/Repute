"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Search, X, Clock, TrendingUp } from "lucide-react";
import { fetchSearchSuggestions } from "@/lib/actions/search";
import { useSearchStore } from "@/store/search-store";
import { formatPrice } from "@/lib/utils";

const POPULAR_SEARCHES = ["Vitamin C Serum", "Lipstick", "Fragrance", "Hyaluronic Acid", "Gift Sets", "Body Oil"];

type Suggestions = Awaited<ReturnType<typeof fetchSearchSuggestions>>;

export function SearchBox({ initialQuery = "", autoFocus = false }: { initialQuery?: string; autoFocus?: boolean }) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState<Suggestions | null>(null);
  const [open, setOpen] = useState(false);
  const [, startTransition] = useTransition();
  const containerRef = useRef<HTMLDivElement>(null);
  const recent = useSearchStore((s) => s.recent);
  const addRecent = useSearchStore((s) => s.addRecent);
  const clearRecent = useSearchStore((s) => s.clearRecent);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (query.trim().length > 1) {
        fetchSearchSuggestions(query).then(setSuggestions);
      } else {
        setSuggestions(null);
      }
    }, 250);
    return () => clearTimeout(handler);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function submitSearch(term: string) {
    const trimmed = term.trim();
    if (!trimmed) return;
    addRecent(trimmed);
    setOpen(false);
    startTransition(() => {
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    });
  }

  const showDropdown = open;

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl mx-auto">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submitSearch(query);
        }}
        className="relative"
      >
        <Search size={19} className="absolute left-5 top-1/2 -translate-y-1/2 text-ink-mute" />
        <input
          autoFocus={autoFocus}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          placeholder="Search for products, brands or categories…"
          className="w-full h-14 rounded-full border border-line bg-warm-white pl-14 pr-14 text-base focus:outline-none focus:border-rose-gold focus:ring-2 focus:ring-rose-gold/30 transition-shadow"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setSuggestions(null);
            }}
            className="absolute right-5 top-1/2 -translate-y-1/2 text-ink-mute hover:text-ink cursor-pointer"
            aria-label="Clear search"
          >
            <X size={18} />
          </button>
        )}
      </form>

      {showDropdown && (
        <div className="absolute z-30 mt-2 w-full rounded-2xl border border-line bg-warm-white shadow-xl overflow-hidden animate-fade-in">
          {query.trim().length > 1 ? (
            suggestions && (suggestions.products.length || suggestions.brands.length || suggestions.categories.length) ? (
              <div className="max-h-[70vh] overflow-y-auto py-2">
                {suggestions.categories.length > 0 && (
                  <div className="px-4 py-2">
                    <p className="text-[0.65rem] uppercase tracking-wider text-ink-mute px-1 mb-1">Categories</p>
                    {suggestions.categories.map((c) => (
                      <Link
                        key={c.id}
                        href={`/shop/${c.slug}`}
                        onClick={() => setOpen(false)}
                        className="block px-2 py-2 rounded-lg hover:bg-ivory text-sm text-ink"
                      >
                        {c.name}
                      </Link>
                    ))}
                  </div>
                )}
                {suggestions.brands.length > 0 && (
                  <div className="px-4 py-2 border-t border-line">
                    <p className="text-[0.65rem] uppercase tracking-wider text-ink-mute px-1 mb-1">Brands</p>
                    {suggestions.brands.map((b) => (
                      <Link
                        key={b.id}
                        href={`/shop?brand=${b.slug}`}
                        onClick={() => setOpen(false)}
                        className="block px-2 py-2 rounded-lg hover:bg-ivory text-sm text-ink"
                      >
                        {b.name}
                      </Link>
                    ))}
                  </div>
                )}
                {suggestions.products.length > 0 && (
                  <div className="px-4 py-2 border-t border-line">
                    <p className="text-[0.65rem] uppercase tracking-wider text-ink-mute px-1 mb-1">Products</p>
                    {suggestions.products.map((p) => (
                      <Link
                        key={p.id}
                        href={`/product/${p.slug}`}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-ivory"
                      >
                        <div className="relative h-11 w-9 rounded-md overflow-hidden bg-cream shrink-0">
                          {p.images[0] && (
                            <Image src={p.images[0].url} alt={p.name} fill className="object-cover" sizes="40px" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm text-ink truncate">{p.name}</p>
                          <p className="text-xs text-ink-mute">
                            {p.brand.name} · {formatPrice(p.discountPrice ?? p.price)}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
                <div className="px-4 pt-2 border-t border-line">
                  <button
                    onClick={() => submitSearch(query)}
                    className="w-full text-left px-2 py-2.5 text-sm font-medium text-ink hover:bg-ivory rounded-lg cursor-pointer"
                  >
                    See all results for &ldquo;{query}&rdquo; →
                  </button>
                </div>
              </div>
            ) : (
              <div className="px-6 py-8 text-center text-sm text-ink-soft">No matches yet — try a different term.</div>
            )
          ) : (
            <div className="p-5">
              {recent.length > 0 && (
                <div className="mb-5">
                  <div className="flex items-center justify-between px-1 mb-2">
                    <p className="text-[0.65rem] uppercase tracking-wider text-ink-mute">Recent Searches</p>
                    <button onClick={clearRecent} className="text-xs text-ink-mute hover:text-ink cursor-pointer">
                      Clear
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recent.map((term) => (
                      <button
                        key={term}
                        onClick={() => submitSearch(term)}
                        className="flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs text-ink-soft hover:border-ink hover:text-ink transition-colors cursor-pointer"
                      >
                        <Clock size={11} /> {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <p className="text-[0.65rem] uppercase tracking-wider text-ink-mute px-1 mb-2">Popular Searches</p>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_SEARCHES.map((term) => (
                    <button
                      key={term}
                      onClick={() => submitSearch(term)}
                      className="flex items-center gap-1.5 rounded-full bg-ivory px-3 py-1.5 text-xs text-ink-soft hover:bg-blush hover:text-ink transition-colors cursor-pointer"
                    >
                      <TrendingUp size={11} /> {term}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
