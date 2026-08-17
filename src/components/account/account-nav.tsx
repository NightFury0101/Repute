"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { User, Package, MapPin, Heart, Clock, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/account", label: "Profile", icon: User, exact: true },
  { href: "/account/orders", label: "Orders", icon: Package },
  { href: "/account/addresses", label: "Addresses", icon: MapPin },
  { href: "/wishlist", label: "Wishlist", icon: Heart },
  { href: "/account/recently-viewed", label: "Recently Viewed", icon: Clock },
  { href: "/account/settings", label: "Settings", icon: Settings },
];

export function MobileAccountNav() {
  const pathname = usePathname();

  return (
    <nav className="flex lg:hidden items-center gap-2 overflow-x-auto no-scrollbar mb-8 -mt-4">
      {LINKS.map((link) => {
        const active = link.exact ? pathname === link.href : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "shrink-0 px-4 py-2 rounded-full text-xs font-medium border transition-colors",
              active ? "bg-ink text-warm-white border-ink" : "border-line text-ink-soft"
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AccountNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {LINKS.map((link) => {
        const active = link.exact ? pathname === link.href : pathname.startsWith(link.href);
        const Icon = link.icon;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-colors",
              active ? "bg-ink text-warm-white" : "text-ink-soft hover:bg-ivory"
            )}
          >
            <Icon size={16} />
            {link.label}
          </Link>
        );
      })}
      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-red-700 hover:bg-red-50 transition-colors cursor-pointer mt-2"
      >
        <LogOut size={16} /> Sign Out
      </button>
    </nav>
  );
}
