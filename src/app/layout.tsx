import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { Providers } from "@/components/providers";
import { getWishlistIds } from "@/lib/actions/wishlist";
import { auth } from "@/lib/auth";

const display = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

const body = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Repute — Beauty, Considered",
    template: "%s | Repute",
  },
  description:
    "Repute is a premium beauty destination for makeup, skincare, haircare, fragrance and body care — thoughtfully curated, ethically sourced, made to be ritual.",
  keywords: [
    "beauty",
    "cosmetics",
    "skincare",
    "makeup",
    "fragrance",
    "premium beauty",
    "Repute",
  ],
  openGraph: {
    type: "website",
    siteName: "Repute",
    title: "Repute — Beauty, Considered",
    description:
      "Premium makeup, skincare, haircare, fragrance and body care — thoughtfully curated.",
    url: siteUrl,
    images: ["/generated/og-image.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Repute — Beauty, Considered",
    description:
      "Premium makeup, skincare, haircare, fragrance and body care — thoughtfully curated.",
    images: ["/generated/og-image.jpg"],
  },
  icons: {
    icon: "/favicon.svg",
  },
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const session = await auth();
  const wishlistIds = session?.user ? await getWishlistIds() : [];

  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${display.variable} ${body.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-ivory text-ink">
        <Providers wishlistIds={wishlistIds} isAuthed={!!session?.user}>
          {children}
        </Providers>
        <Toaster
          position="bottom-center"
          toastOptions={{
            style: {
              background: "var(--color-ink)",
              color: "var(--color-warm-white)",
              border: "none",
              borderRadius: "9999px",
              fontFamily: "var(--font-body)",
              fontSize: "0.875rem",
              padding: "0.75rem 1.25rem",
            },
          }}
        />
      </body>
    </html>
  );
}
