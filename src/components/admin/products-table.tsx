"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Copy, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { deleteProduct, duplicateProduct, toggleProductFlag } from "@/lib/actions/admin-products";
import { formatPrice, cn } from "@/lib/utils";
import type { ProductListItem } from "@/lib/data/products";

export function ProductsTable({ products }: { products: ProductListItem[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pendingId, setPendingId] = useState<string | null>(null);

  function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setPendingId(id);
    startTransition(async () => {
      await deleteProduct(id);
      toast.success("Product deleted");
      router.refresh();
      setPendingId(null);
    });
  }

  function handleDuplicate(id: string) {
    setPendingId(id);
    startTransition(async () => {
      const result = await duplicateProduct(id);
      if (result.success) toast.success("Product duplicated");
      router.refresh();
      setPendingId(null);
    });
  }

  function handleToggle(id: string, flag: "isFeatured" | "isBestSeller" | "isNewArrival" | "isActive", value: boolean) {
    startTransition(async () => {
      await toggleProductFlag(id, flag, value);
      router.refresh();
    });
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-line bg-warm-white">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-line text-left text-xs uppercase tracking-wider text-ink-mute">
            <th className="p-4 font-medium">Product</th>
            <th className="p-4 font-medium">Category</th>
            <th className="p-4 font-medium">Price</th>
            <th className="p-4 font-medium">Stock</th>
            <th className="p-4 font-medium">Flags</th>
            <th className="p-4 font-medium">Status</th>
            <th className="p-4 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id} className={cn("border-b border-line last:border-0", pendingId === p.id && "opacity-50")}>
              <td className="p-4">
                <div className="flex items-center gap-3">
                  <div className="relative h-12 w-10 rounded-lg overflow-hidden bg-cream shrink-0">
                    {p.images[0] && <Image src={p.images[0].url} alt={p.name} fill className="object-cover" sizes="40px" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-ink truncate max-w-[200px]">{p.name}</p>
                    <p className="text-xs text-ink-mute">{p.brand.name} · {p.sku}</p>
                  </div>
                </div>
              </td>
              <td className="p-4 text-ink-soft">{p.category.name}</td>
              <td className="p-4">
                <span className="text-ink">{formatPrice(p.discountPrice ?? p.price)}</span>
                {p.discountPrice && <span className="block text-xs text-ink-mute line-through">{formatPrice(p.price)}</span>}
              </td>
              <td className="p-4">
                <span className={cn(p.stock === 0 ? "text-red-600" : p.stock <= p.lowStockAt ? "text-amber-600" : "text-ink-soft")}>
                  {p.stock}
                </span>
              </td>
              <td className="p-4">
                <div className="flex flex-wrap gap-1">
                  <FlagPill active={p.isFeatured} label="Featured" onClick={() => handleToggle(p.id, "isFeatured", !p.isFeatured)} />
                  <FlagPill active={p.isBestSeller} label="Bestseller" onClick={() => handleToggle(p.id, "isBestSeller", !p.isBestSeller)} />
                  <FlagPill active={p.isNewArrival} label="New" onClick={() => handleToggle(p.id, "isNewArrival", !p.isNewArrival)} />
                </div>
              </td>
              <td className="p-4">
                <button onClick={() => handleToggle(p.id, "isActive", !p.isActive)} disabled={isPending}>
                  <Badge variant={p.isActive ? "success" : "muted"} className="cursor-pointer">
                    {p.isActive ? "Active" : "Hidden"}
                  </Badge>
                </button>
              </td>
              <td className="p-4">
                <div className="flex items-center justify-end gap-1">
                  <Link href={`/admin/products/${p.id}/edit`} className="p-2 text-ink-soft hover:text-ink cursor-pointer" aria-label="Edit">
                    <Pencil size={15} />
                  </Link>
                  <button onClick={() => handleDuplicate(p.id)} disabled={isPending} className="p-2 text-ink-soft hover:text-ink cursor-pointer" aria-label="Duplicate">
                    <Copy size={15} />
                  </button>
                  <button onClick={() => handleDelete(p.id, p.name)} disabled={isPending} className="p-2 text-ink-soft hover:text-red-600 cursor-pointer" aria-label="Delete">
                    <Trash2 size={15} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FlagPill({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "text-[0.6rem] px-2 py-0.5 rounded-full border cursor-pointer transition-colors",
        active ? "bg-ink text-warm-white border-ink" : "border-line text-ink-mute hover:border-ink"
      )}
    >
      {label}
    </button>
  );
}
