"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Heart, ShoppingBag, User, Menu, Search, LogOut, Package, MapPin, LayoutGrid } from "lucide-react";
import { Sheet, SheetContent, SheetCloseButton } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { useCartStore } from "@/store/cart-store";
import { useWishlistStore } from "@/store/wishlist-store";
import { cn } from "@/lib/utils";
import type { Category } from "@/generated/prisma/client";

const NAV_LINKS = [
  { label: "Shop", href: "/shop" },
  { label: "New Arrivals", href: "/shop?filter=new" },
  { label: "Best Sellers", href: "/shop?filter=bestsellers" },
  { label: "About", href: "/about" },
];

export function Header({ categories }: { categories: Category[] }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [lastPathname, setLastPathname] = useState(pathname);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setMobileOpen(false);
  }
  const count = useCartStore((s) => s.items.reduce((sum, i) => sum + i.quantity, 0));
  const setCartOpen = useCartStore((s) => s.setOpen);
  const wishlistCount = useWishlistStore((s) => s.ids.size);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <header
      className={cn(
        "sticky top-0 z-40 bg-warm-white/90 backdrop-blur-md transition-shadow duration-300",
        scrolled && "shadow-[0_1px_0_0_theme(colors.line)]"
      )}
    >
      <div className="hidden sm:flex items-center justify-center bg-ink text-warm-white text-[0.7rem] tracking-wide py-2 px-4 text-center">
        Complimentary shipping on all orders over $75 — use code&nbsp;<strong>GLOW20</strong>&nbsp;for 20% off
      </div>

      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-5 sm:px-8 lg:px-12 h-[76px]">
        <div className="flex items-center gap-2 lg:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 -ml-2 cursor-pointer text-ink"
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
        </div>

        <Link href="/" className="font-serif text-2xl sm:text-[1.7rem] tracking-tight text-ink shrink-0">
          Maldibay
        </Link>

        <nav className="hidden lg:flex items-center gap-8">
          <DropdownMenu>
            <DropdownMenuTrigger className="text-sm font-medium text-ink-soft hover:text-ink transition-colors cursor-pointer flex items-center gap-1">
              Shop
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-[240px]">
              <DropdownMenuItem asChild>
                <Link href="/shop" className="font-medium">
                  <LayoutGrid size={15} /> All Products
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {categories.map((c) => (
                <DropdownMenuItem key={c.id} asChild>
                  <Link href={`/shop/${c.slug}`}>{c.name}</Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          {NAV_LINKS.slice(1).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-ink-soft hover:text-ink transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <Link href="/contact" className="text-sm font-medium text-ink-soft hover:text-ink transition-colors">
            Contact
          </Link>
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => router.push("/search")}
            className="p-2.5 text-ink hover:bg-ink/5 rounded-full transition-colors cursor-pointer"
            aria-label="Search"
          >
            <Search size={19} />
          </button>

          <Link
            href="/wishlist"
            className="relative p-2.5 text-ink hover:bg-ink/5 rounded-full transition-colors hidden sm:inline-flex"
            aria-label="Wishlist"
          >
            <Heart size={19} />
            {wishlistCount > 0 && (
              <span className="absolute top-0.5 right-0.5 h-4 w-4 rounded-full bg-rose-gold-dark text-white text-[0.6rem] flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger
              className="p-2.5 text-ink hover:bg-ink/5 rounded-full transition-colors cursor-pointer hidden sm:inline-flex"
              aria-label="Account"
            >
              <User size={19} />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="min-w-[220px]">
              {session?.user ? (
                <>
                  <DropdownMenuLabel>Hi, {session.user.name?.split(" ")[0] ?? "there"}</DropdownMenuLabel>
                  <DropdownMenuItem asChild>
                    <Link href="/account">
                      <User size={15} /> My Account
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/account/orders">
                      <Package size={15} /> Orders
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/account/addresses">
                      <MapPin size={15} /> Addresses
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/wishlist">
                      <Heart size={15} /> Wishlist
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/admin">
                          <LayoutGrid size={15} /> Admin Dashboard
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })} className="text-red-700">
                    <LogOut size={15} /> Sign Out
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem asChild>
                    <Link href="/login">Sign In</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/register">Create Account</Link>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <button
            onClick={() => setCartOpen(true)}
            className="relative p-2.5 text-ink hover:bg-ink/5 rounded-full transition-colors cursor-pointer"
            aria-label="Cart"
          >
            <ShoppingBag size={19} />
            {count > 0 && (
              <span className="absolute top-0.5 right-0.5 h-4 w-4 rounded-full bg-ink text-white text-[0.6rem] flex items-center justify-center">
                {count}
              </span>
            )}
          </button>
        </div>
      </div>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" title="Menu" className="max-w-xs">
          <div className="flex items-center justify-between px-6 py-5 border-b border-line">
            <span className="font-serif text-xl">Menu</span>
            <SheetCloseButton />
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-1">
            <Link href="/shop" className="py-3 text-base font-medium border-b border-line">
              All Products
            </Link>
            {categories.map((c) => (
              <Link key={c.id} href={`/shop/${c.slug}`} className="py-3 text-base border-b border-line text-ink-soft">
                {c.name}
              </Link>
            ))}
            {NAV_LINKS.slice(1).map((link) => (
              <Link key={link.href} href={link.href} className="py-3 text-base border-b border-line text-ink-soft">
                {link.label}
              </Link>
            ))}
            <Link href="/contact" className="py-3 text-base border-b border-line text-ink-soft">
              Contact
            </Link>
            <Link href="/faq" className="py-3 text-base border-b border-line text-ink-soft">
              FAQ
            </Link>
            <div className="mt-4 flex flex-col gap-2">
              {session?.user ? (
                <>
                  <Link href="/account" className="py-3 text-base font-medium">
                    My Account
                  </Link>
                  {isAdmin && (
                    <Link href="/admin" className="py-3 text-base font-medium">
                      Admin Dashboard
                    </Link>
                  )}
                </>
              ) : (
                <>
                  <Link href="/login" className="py-3 text-base font-medium">
                    Sign In
                  </Link>
                  <Link href="/register" className="py-3 text-base text-ink-soft">
                    Create Account
                  </Link>
                </>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}
