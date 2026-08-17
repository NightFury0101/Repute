"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useWishlistStore } from "@/store/wishlist-store";
import { toggleWishlist } from "@/lib/actions/wishlist";

export function WishlistButton({
  productId,
  className,
  size = 18,
  variant = "floating",
}: {
  productId: string;
  className?: string;
  size?: number;
  variant?: "floating" | "inline";
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const inWishlist = useWishlistStore((s) => s.ids.has(productId));
  const setWishlist = useWishlistStore((s) => s.set);
  const isAuthed = useWishlistStore((s) => s.isAuthed);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthed) {
      toast("Sign in to save items to your wishlist", {
        action: { label: "Sign in", onClick: () => router.push("/login?callbackUrl=/wishlist") },
      });
      return;
    }
    const next = !inWishlist;
    setWishlist(productId, next);
    startTransition(async () => {
      const result = await toggleWishlist(productId);
      if (!result.ok) {
        setWishlist(productId, !next);
        return;
      }
      toast(next ? "Added to wishlist" : "Removed from wishlist");
    });
  };

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      aria-pressed={inWishlist}
      aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
      className={cn(
        variant === "floating" &&
          "h-9 w-9 rounded-full bg-warm-white/90 backdrop-blur flex items-center justify-center shadow-sm hover:scale-110 transition-transform cursor-pointer",
        variant === "inline" && "cursor-pointer",
        className
      )}
    >
      <Heart
        size={size}
        className={cn(
          "transition-colors",
          inWishlist ? "fill-rose-gold-dark text-rose-gold-dark" : "text-ink fill-transparent"
        )}
      />
    </button>
  );
}
