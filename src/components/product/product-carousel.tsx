"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "@/components/product/product-card";
import { cn } from "@/lib/utils";
import type { ProductListItem } from "@/lib/data/products";

export function ProductCarousel({ products }: { products: ProductListItem[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: "start", dragFree: true, containScroll: "trimSnaps" });
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanPrev(emblaApi.canScrollPrev());
    setCanNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    // Sync local button state from the embla instance, which only exists post-mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  return (
    <div className="relative">
      <div className="overflow-hidden -mx-1" ref={emblaRef}>
        <div className="flex gap-5 px-1">
          {products.map((product) => (
            <div key={product.id} className="min-w-[68%] xs:min-w-[55%] sm:min-w-[38%] md:min-w-[28%] lg:min-w-[22%]">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={() => emblaApi?.scrollPrev()}
        disabled={!canPrev}
        className={cn(
          "hidden md:flex absolute -left-5 top-[36%] -translate-y-1/2 h-11 w-11 rounded-full bg-warm-white shadow-lg items-center justify-center text-ink transition-opacity cursor-pointer disabled:opacity-0",
        )}
        aria-label="Previous"
      >
        <ChevronLeft size={18} />
      </button>
      <button
        onClick={() => emblaApi?.scrollNext()}
        disabled={!canNext}
        className={cn(
          "hidden md:flex absolute -right-5 top-[36%] -translate-y-1/2 h-11 w-11 rounded-full bg-warm-white shadow-lg items-center justify-center text-ink transition-opacity cursor-pointer disabled:opacity-0",
        )}
        aria-label="Next"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}
