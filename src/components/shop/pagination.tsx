import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function Pagination({
  page,
  totalPages,
  buildHref,
}: {
  page: number;
  totalPages: number;
  buildHref: (page: number) => string;
}) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1
  );

  return (
    <nav className="flex items-center justify-center gap-2 mt-16">
      <Link
        href={buildHref(Math.max(1, page - 1))}
        aria-disabled={page === 1}
        className={cn(
          "h-10 w-10 flex items-center justify-center rounded-full border border-line",
          page === 1 ? "pointer-events-none opacity-30" : "hover:bg-ink hover:text-warm-white transition-colors"
        )}
      >
        <ChevronLeft size={16} />
      </Link>
      {pages.map((p, i) => (
        <span key={p} className="flex items-center gap-2">
          {i > 0 && pages[i - 1] !== p - 1 && <span className="text-ink-mute px-1">…</span>}
          <Link
            href={buildHref(p)}
            className={cn(
              "h-10 w-10 flex items-center justify-center rounded-full text-sm transition-colors",
              p === page ? "bg-ink text-warm-white" : "border border-line hover:bg-ink/5"
            )}
          >
            {p}
          </Link>
        </span>
      ))}
      <Link
        href={buildHref(Math.min(totalPages, page + 1))}
        aria-disabled={page === totalPages}
        className={cn(
          "h-10 w-10 flex items-center justify-center rounded-full border border-line",
          page === totalPages ? "pointer-events-none opacity-30" : "hover:bg-ink hover:text-warm-white transition-colors"
        )}
      >
        <ChevronRight size={16} />
      </Link>
    </nav>
  );
}
