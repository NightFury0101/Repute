import type { Metadata } from "next";
import Link from "next/link";
import { Heart } from "lucide-react";
import { Container } from "@/components/ui/container";
import { ProductCard } from "@/components/product/product-card";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { getWishlistProducts } from "@/lib/actions/wishlist";

export const metadata: Metadata = {
  title: "Wishlist",
};

export default async function WishlistPage() {
  const session = await auth();
  const products = session?.user ? await getWishlistProducts() : [];

  return (
    <div className="py-10 sm:py-14">
      <Container>
        <h1 className="font-serif text-4xl sm:text-5xl text-ink">Wishlist</h1>

        {!session?.user ? (
          <div className="flex flex-col items-center justify-center gap-5 py-24 text-center">
            <Heart size={44} className="text-ink-mute" strokeWidth={1.2} />
            <p className="text-ink-soft text-lg">Sign in to view and save your wishlist.</p>
            <Button asChild size="lg">
              <Link href="/login?callbackUrl=/wishlist">Sign In</Link>
            </Button>
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-5 py-24 text-center">
            <Heart size={44} className="text-ink-mute" strokeWidth={1.2} />
            <p className="text-ink-soft text-lg">Your wishlist is empty.</p>
            <Button asChild size="lg">
              <Link href="/shop">Discover Products</Link>
            </Button>
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-x-5 gap-y-10">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}
