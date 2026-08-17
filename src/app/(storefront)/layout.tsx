import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MobileNav } from "@/components/layout/mobile-nav";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { getCategories } from "@/lib/data/categories";

export default async function StorefrontLayout({ children }: { children: React.ReactNode }) {
  const categories = await getCategories();

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-full focus:bg-ink focus:text-warm-white focus:px-5 focus:py-3 focus:text-sm"
      >
        Skip to content
      </a>
      <Header categories={categories} />
      <main id="main-content" className="flex-1 pb-16 lg:pb-0">
        {children}
      </main>
      <Footer categories={categories} />
      <MobileNav />
      <CartDrawer />
    </>
  );
}
