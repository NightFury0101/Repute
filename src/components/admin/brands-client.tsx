"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Tag } from "lucide-react";
import { Modal, ModalContent } from "@/components/ui/modal";
import { Input, Textarea, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ImageUploader, type UploadedImage } from "@/components/admin/image-uploader";
import { saveBrand, deleteBrand } from "@/lib/actions/admin-taxonomy";
import type { Brand } from "@/generated/prisma/client";

type BrandWithCount = Brand & { _count: { products: number } };

export function BrandsClient({ brands }: { brands: BrandWithCount[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Brand | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [logo, setLogo] = useState<UploadedImage[]>([]);
  const [isPending, startTransition] = useTransition();

  function openNew() {
    setEditing(null);
    setName("");
    setDescription("");
    setLogo([]);
    setOpen(true);
  }

  function openEdit(brand: Brand) {
    setEditing(brand);
    setName(brand.name);
    setDescription(brand.description ?? "");
    setLogo(brand.logo ? [{ url: brand.logo }] : []);
    setOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await saveBrand({ id: editing?.id, name, description, logo: logo[0]?.url ?? "" });
      if (result.success) {
        toast.success(editing ? "Brand updated" : "Brand created");
        setOpen(false);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  function handleDelete(brand: BrandWithCount) {
    if (brand._count.products > 0) {
      toast.error(`Cannot delete: ${brand._count.products} product(s) use this brand.`);
      return;
    }
    if (!confirm(`Delete "${brand.name}"?`)) return;
    startTransition(async () => {
      const result = await deleteBrand(brand.id);
      if (result.success) {
        toast.success("Brand deleted");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <div>
      <div className="flex justify-end mb-6">
        <Button onClick={openNew}>
          <Plus size={16} /> Add Brand
        </Button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-line bg-warm-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs uppercase tracking-wider text-ink-mute">
              <th className="p-4 font-medium">Brand</th>
              <th className="p-4 font-medium">Description</th>
              <th className="p-4 font-medium">Products</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {brands.map((brand) => (
              <tr key={brand.id} className="border-b border-line last:border-0">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="relative h-9 w-9 rounded-full overflow-hidden bg-ivory flex items-center justify-center shrink-0">
                      {brand.logo ? (
                        <Image src={brand.logo} alt={brand.name} fill className="object-cover" sizes="36px" />
                      ) : (
                        <Tag size={14} className="text-ink-mute" />
                      )}
                    </div>
                    <span className="text-ink font-medium">{brand.name}</span>
                  </div>
                </td>
                <td className="p-4 text-ink-soft max-w-xs truncate">{brand.description}</td>
                <td className="p-4 text-ink-soft">{brand._count.products}</td>
                <td className="p-4">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => openEdit(brand)} className="p-2 text-ink-soft hover:text-ink cursor-pointer">
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => handleDelete(brand)} className="p-2 text-ink-soft hover:text-red-600 cursor-pointer">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={open} onOpenChange={setOpen}>
        <ModalContent title={editing ? "Edit Brand" : "Add Brand"}>
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
              <Label>Logo</Label>
              <ImageUploader images={logo} onChange={(imgs) => setLogo(imgs.slice(-1))} max={1} />
            </div>
            <Button type="submit" size="lg" disabled={isPending} className="mt-2">
              {editing ? "Save Changes" : "Create Brand"}
            </Button>
          </form>
        </ModalContent>
      </Modal>
    </div>
  );
}
