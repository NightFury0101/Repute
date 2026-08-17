"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Menu, LogOut, ExternalLink } from "lucide-react";
import { Sheet, SheetTrigger, SheetContent, SheetCloseButton } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/brands", label: "Brands" },
  { href: "/admin/inventory", label: "Inventory" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/customers", label: "Customers" },
  { href: "/admin/discounts", label: "Discounts" },
  { href: "/admin/reviews", label: "Reviews" },
  { href: "/admin/homepage", label: "Homepage CMS" },
];

export function AdminMobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden sticky top-0 z-30 flex items-center justify-between bg-ink text-warm-white px-5 py-4">
      <Link href="/admin" className="font-serif text-lg">
        Maldibay <span className="text-warm-white/40 text-xs font-sans">Admin</span>
      </Link>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger className="p-2 cursor-pointer" aria-label="Open admin menu">
          <Menu size={20} />
        </SheetTrigger>
        <SheetContent side="left" title="Admin Menu" className="bg-ink text-warm-white max-w-xs">
          <div className="flex items-center justify-between px-6 py-5 border-b border-warm-white/10">
            <span className="font-serif text-lg">Menu</span>
            <SheetCloseButton className="text-warm-white hover:bg-warm-white/10" />
          </div>
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-1">
            {LINKS.map((link) => {
              const active = link.exact ? pathname === link.href : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "px-4 py-3 rounded-xl text-sm transition-colors",
                    active ? "bg-warm-white text-ink" : "text-warm-white/70 hover:bg-warm-white/10"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
          <div className="p-4 border-t border-warm-white/10 flex flex-col gap-1">
            <Link href="/" target="_blank" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-warm-white/70">
              <ExternalLink size={16} /> View Store
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/admin/login" })}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-red-300 cursor-pointer"
            >
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
