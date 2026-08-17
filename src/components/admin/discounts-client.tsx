"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Modal, ModalContent } from "@/components/ui/modal";
import { Input, Label, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { saveDiscount, deleteDiscount, toggleDiscountActive } from "@/lib/actions/admin-discounts";
import { formatDate, formatPrice } from "@/lib/utils";
import type { Discount, Category } from "@/generated/prisma/client";

export function DiscountsClient({ discounts, categories }: { discounts: Discount[]; categories: Category[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Discount | null>(null);
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState({
    code: "",
    description: "",
    type: "PERCENTAGE" as "PERCENTAGE" | "FIXED",
    value: "",
    minSubtotal: "",
    categoryId: "",
    usageLimit: "",
    startsAt: "",
    endsAt: "",
    isActive: true,
  });

  function openNew() {
    setEditing(null);
    setForm({ code: "", description: "", type: "PERCENTAGE", value: "", minSubtotal: "", categoryId: "", usageLimit: "", startsAt: "", endsAt: "", isActive: true });
    setOpen(true);
  }

  function openEdit(discount: Discount) {
    setEditing(discount);
    setForm({
      code: discount.code,
      description: discount.description ?? "",
      type: discount.type as "PERCENTAGE" | "FIXED",
      value: String(discount.value),
      minSubtotal: discount.minSubtotal ? String(discount.minSubtotal) : "",
      categoryId: discount.categoryId ?? "",
      usageLimit: discount.usageLimit ? String(discount.usageLimit) : "",
      startsAt: discount.startsAt ? discount.startsAt.toISOString().slice(0, 10) : "",
      endsAt: discount.endsAt ? discount.endsAt.toISOString().slice(0, 10) : "",
      isActive: discount.isActive,
    });
    setOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await saveDiscount({
        id: editing?.id,
        ...form,
        minSubtotal: form.minSubtotal || null,
        usageLimit: form.usageLimit || null,
      });
      if (result.success) {
        toast.success(editing ? "Discount updated" : "Discount created");
        setOpen(false);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  function handleDelete(discount: Discount) {
    if (!confirm(`Delete code "${discount.code}"?`)) return;
    startTransition(async () => {
      await deleteDiscount(discount.id);
      toast.success("Discount deleted");
      router.refresh();
    });
  }

  function handleToggle(discount: Discount) {
    startTransition(async () => {
      await toggleDiscountActive(discount.id, !discount.isActive);
      router.refresh();
    });
  }

  return (
    <div>
      <div className="flex justify-end mb-6">
        <Button onClick={openNew}>
          <Plus size={16} /> Add Discount
        </Button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-line bg-warm-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs uppercase tracking-wider text-ink-mute">
              <th className="p-4 font-medium">Code</th>
              <th className="p-4 font-medium">Value</th>
              <th className="p-4 font-medium">Usage</th>
              <th className="p-4 font-medium">Expires</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {discounts.map((d) => (
              <tr key={d.id} className="border-b border-line last:border-0">
                <td className="p-4">
                  <p className="text-ink font-medium">{d.code}</p>
                  {d.description && <p className="text-xs text-ink-mute">{d.description}</p>}
                </td>
                <td className="p-4 text-ink-soft">{d.type === "PERCENTAGE" ? `${d.value}%` : formatPrice(d.value)}</td>
                <td className="p-4 text-ink-soft">{d.usedCount}{d.usageLimit ? ` / ${d.usageLimit}` : ""}</td>
                <td className="p-4 text-ink-soft">{d.endsAt ? formatDate(d.endsAt) : "—"}</td>
                <td className="p-4">
                  <button onClick={() => handleToggle(d)} disabled={isPending}>
                    <Badge variant={d.isActive ? "success" : "muted"} className="cursor-pointer">
                      {d.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </button>
                </td>
                <td className="p-4">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => openEdit(d)} className="p-2 text-ink-soft hover:text-ink cursor-pointer">
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => handleDelete(d)} className="p-2 text-ink-soft hover:text-red-600 cursor-pointer">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {discounts.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-ink-mute">No discounts yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={open} onOpenChange={setOpen}>
        <ModalContent title={editing ? "Edit Discount" : "Add Discount"}>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label>Code</Label>
                <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} required />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Type</Label>
                <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as "PERCENTAGE" | "FIXED" })}>
                  <option value="PERCENTAGE">Percentage Off</option>
                  <option value="FIXED">Fixed Amount Off</option>
                </Select>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Description</Label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label>{form.type === "PERCENTAGE" ? "Percentage (%)" : "Amount ($)"}</Label>
                <Input type="number" min="0" step="0.01" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} required />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Minimum Spend ($)</Label>
                <Input type="number" min="0" step="0.01" value={form.minSubtotal} onChange={(e) => setForm({ ...form, minSubtotal: e.target.value })} />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Applies to Category (optional)</Label>
              <Select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </Select>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label>Usage Limit</Label>
                <Input type="number" min="0" value={form.usageLimit} onChange={(e) => setForm({ ...form, usageLimit: e.target.value })} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Starts</Label>
                <Input type="date" value={form.startsAt} onChange={(e) => setForm({ ...form, startsAt: e.target.value })} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Ends</Label>
                <Input type="date" value={form.endsAt} onChange={(e) => setForm({ ...form, endsAt: e.target.value })} />
              </div>
            </div>
            <label className="flex items-center gap-2.5 text-sm cursor-pointer">
              <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="h-4 w-4" />
              Active
            </label>
            <Button type="submit" size="lg" disabled={isPending} className="mt-2">
              {editing ? "Save Changes" : "Create Discount"}
            </Button>
          </form>
        </ModalContent>
      </Modal>
    </div>
  );
}
