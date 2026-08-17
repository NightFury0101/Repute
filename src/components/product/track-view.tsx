"use client";

import { useEffect } from "react";
import { useRecentlyViewedStore } from "@/store/recently-viewed-store";
import { trackRecentlyViewed } from "@/lib/actions/recently-viewed";

export function TrackView({ productId }: { productId: string }) {
  const track = useRecentlyViewedStore((s) => s.track);

  useEffect(() => {
    track(productId);
    trackRecentlyViewed(productId);
  }, [productId, track]);

  return null;
}
