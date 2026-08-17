import type { Metadata } from "next";
import { CartPageClient } from "@/components/cart/cart-page-client";
import { getBestSellers } from "@/lib/data/products";

export const metadata: Metadata = {
  title: "Shopping Bag",
};

export default async function CartPage() {
  const { items } = await getBestSellers(8);
  return <CartPageClient recommended={items} />;
}
