"use client";

import { SessionProvider } from "next-auth/react";
import { useEffect } from "react";
import { useWishlistStore } from "@/store/wishlist-store";

export function Providers({
  children,
  wishlistIds,
  isAuthed,
}: {
  children: React.ReactNode;
  wishlistIds: string[];
  isAuthed: boolean;
}) {
  const hydrate = useWishlistStore((s) => s.hydrate);

  useEffect(() => {
    hydrate(wishlistIds, isAuthed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wishlistIds.join(","), isAuthed]);

  return <SessionProvider>{children}</SessionProvider>;
}
