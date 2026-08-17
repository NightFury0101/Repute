"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown, GripVertical } from "lucide-react";
import { Modal, ModalContent } from "@/components/ui/modal";
import { Input, Textarea, Label } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ImageUploader, type UploadedImage } from "@/components/admin/image-uploader";
import { saveCategory, deleteCategory, reorderCategories } from "@/lib/actions/admin-taxonomy";
import type { Category } from "@/generated/prisma/client";

type CategoryWithCount = Category & { _count: { products: number } };

export function CategoriesClient({ categories }: { categories: CategoryWithCount[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<UploadedImage[]>([]);
  const [isActive, setIsActive] = useState(true);
  const [isPending, startTransition] = useTransition();

  function openNew() {
    setEditing(null);
    setName("");
    setDescription("");
    setImage([]);
    setIsActive(true);
    setOpen(true);
  }

  function openEdit(category: Category) {
    setEditing(category);
    setName(category.name);
    setDescription(category.description ?? "");
    setImage(category.image ? [{ url: category.image }] : []);
    setIsActive(category.isActive);
    setOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await saveCategory({
        id: editing?.id,
        name,
        description,
        image: image[0]?.url ?? "",
        isActive,
      });
      if (result.success) {
        toast.success(editing ? "Category updated" : "Category created");
        setOpen(false);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  function handleDelete(category: CategoryWithCount) {
    if (category._count.products > 0) {
      toast.error(`Cannot delete: ${category._count.products} product(s) use this category.`);
      return;
    }
    if (!confirm(`Delete "${category.name}"?`)) return;
    startTransition(async () => {
      const result = await deleteCategory(category.id);
      if (result.success) {
        toast.success("Category deleted");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  function move(index: number, dir: -1 | 1) {
    const next = [...categories];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    startTransition(async () => {
      await reorderCategories(next.map((c) => c.id));
      router.refresh();
    });
  }

  return (
    <div>
      <div className="flex justify-end mb-6">
        <Button onClick={openNew}>
          <Plus size={16} /> Add Category
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {categories.map((category, i) => (
          <div key={category.id} className="rounded-2xl border border-line bg-warm-white overflow-hidden">
            <div className="relative h-32 bg-cream">
              {category.image && <Image src={category.image} alt={category.name} fill className="object-cover" sizes="300px" />}
              <div className="absolute top-2 right-2 flex gap-1">
                <button onClick={() => move(i, -1)} disabled={i === 0} className="h-7 w-7 rounded-full bg-warm-white/90 flex items-center justify-center disabled:opacity-30 cursor-pointer">
                  <ArrowUp size={13} />
                </button>
                <button onClick={() => move(i, 1)} disabled={i === categories.length - 1} className="h-7 w-7 rounded-full bg-warm-white/90 flex items-center justify-center disabled:opacity-30 cursor-pointer">
                  <ArrowDown size={13} />
                </button>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between">
                <p className="font-medium text-ink flex items-center gap-1.5">
                  <GripVertical size={13} className="text-ink-mute" /> {category.name}
                </p>
                {!category.isActive && <span className="text-[0.6rem] bg-ivory text-ink-mute px-2 py-0.5 rounded-full">Hidden</span>}
              </div>
              <p className="text-xs text-ink-mute mt-1">{category._count.products} products</p>
              <div className="flex items-center gap-4 mt-3">
                <button onClick={() => openEdit(category)} className="text-xs text-ink flex items-center gap-1 hover:underline cursor-pointer">
                  <Pencil size={12} /> Edit
                </button>
                <button onClick={() => handleDelete(category)} className="text-xs text-red-600 flex items-center gap-1 hover:underline cursor-pointer">
                  <Trash2 size={12} /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal open={open} onOpenChange={setOpen}>
        <ModalContent title={editing ? "Edit Category" : "Add Category"}>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Description</Label>
              <Textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Image</Label>
              <ImageUploader images={image} onChange={(imgs) => setImage(imgs.slice(-1))} max={1} />
            </div>
            <label className="flex items-center gap-2.5 text-sm cursor-pointer">
              <Checkbox checked={isActive} onCheckedChange={(v) => setIsActive(!!v)} /> Active (visible on storefront)
            </label>
            <Button type="submit" size="lg" disabled={isPending} className="mt-2">
              {editing ? "Save Changes" : "Create Category"}
            </Button>
          </form>
        </ModalContent>
      </Modal>
    </div>
  );
}
