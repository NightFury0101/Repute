"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { updateProductStock } from "@/lib/actions/admin-products";
import type { ProductListItem } from "@/lib/data/products";

export function InventoryTable({ products }: { products: ProductListItem[] }) {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(products.map((p) => [p.id, String(p.stock)]))
  );
  const [isPending, startTransition] = useTransition();

  function commit(id: string) {
    const value = Number(values[id]);
    if (!Number.isFinite(value) || value < 0) return;
    startTransition(async () => {
      await updateProductStock(id, value);
      toast.success("Stock updated");
      router.refresh();
    });
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-line bg-warm-white">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-line text-left text-xs uppercase tracking-wider text-ink-mute">
            <th className="p-4 font-medium">Product</th>
            <th className="p-4 font-medium">SKU</th>
            <th className="p-4 font-medium">Current Stock</th>
            <th className="p-4 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id} className="border-b border-line last:border-0">
              <td className="p-4">
                <div className="flex items-center gap-3">
                  <div className="relative h-10 w-9 rounded-lg overflow-hidden bg-cream shrink-0">
                    {p.images[0] && <Image src={p.images[0].url} alt={p.name} fill className="object-cover" sizes="36px" />}
                  </div>
                  <span className="text-ink truncate max-w-[220px]">{p.name}</span>
                </div>
              </td>
              <td className="p-4 text-ink-soft">{p.sku}</td>
              <td className="p-4">
                <input
                  type="number"
                  min={0}
                  value={values[p.id]}
                  onChange={(e) => setValues((v) => ({ ...v, [p.id]: e.target.value }))}
                  onBlur={() => commit(p.id)}
                  disabled={isPending}
                  className="w-24 h-9 rounded-lg border border-line px-3 text-sm focus:outline-none focus:border-rose-gold"
                />
              </td>
              <td className="p-4">
                {p.stock === 0 ? (
                  <Badge variant="sale" className="flex items-center gap-1 w-fit"><AlertTriangle size={11} /> Out of Stock</Badge>
                ) : p.stock <= p.lowStockAt ? (
                  <Badge variant="warning" className="flex items-center gap-1 w-fit"><AlertTriangle size={11} /> Low Stock</Badge>
                ) : (
                  <Badge variant="success">In Stock</Badge>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
