"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Modal, ModalContent } from "@/components/ui/modal";
import { Input, Label, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ImageUploader, type UploadedImage } from "@/components/admin/image-uploader";
import { saveBanner, deleteBanner } from "@/lib/actions/admin-settings";
import type { Banner } from "@/generated/prisma/client";

export function BannersClient({ banners }: { banners: Banner[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Banner | null>(null);
  const [isPending, startTransition] = useTransition();
  const [image, setImage] = useState<UploadedImage[]>([]);
  const [form, setForm] = useState({
    placement: "promo" as "hero" | "promo" | "collection",
    title: "",
    subtitle: "",
    ctaLabel: "",
    ctaLink: "",
    isActive: true,
  });

  function openNew() {
    setEditing(null);
    setImage([]);
    setForm({ placement: "promo", title: "", subtitle: "", ctaLabel: "", ctaLink: "", isActive: true });
    setOpen(true);
  }

  function openEdit(banner: Banner) {
    setEditing(banner);
    setImage(banner.image ? [{ url: banner.image }] : []);
    setForm({
      placement: banner.placement as "hero" | "promo" | "collection",
      title: banner.title,
      subtitle: banner.subtitle ?? "",
      ctaLabel: banner.ctaLabel ?? "",
      ctaLink: banner.ctaLink ?? "",
      isActive: banner.isActive,
    });
    setOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await saveBanner({ id: editing?.id, ...form, image: image[0]?.url ?? "" });
      if (result.success) {
        toast.success(editing ? "Banner updated" : "Banner created");
        setOpen(false);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  function handleDelete(id: string) {
    if (!confirm("Delete this banner?")) return;
    startTransition(async () => {
      await deleteBanner(id);
      toast.success("Banner deleted");
      router.refresh();
    });
  }

  return (
    <section className="rounded-2xl border border-line bg-warm-white p-6 sm:p-8 flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-xl text-ink">Promotional Banners</h3>
        <Button size="sm" onClick={openNew}>
          <Plus size={14} /> Add Banner
        </Button>
      </div>

      <div className="flex flex-col gap-3">
        {banners.map((banner) => (
          <div key={banner.id} className="flex items-center gap-4 rounded-xl border border-line p-3">
            <div className="relative h-14 w-20 rounded-lg overflow-hidden bg-cream shrink-0">
              {banner.image && <Image src={banner.image} alt={banner.title} fill className="object-cover" sizes="80px" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-ink truncate">{banner.title}</p>
                <Badge variant="muted">{banner.placement}</Badge>
                {!banner.isActive && <Badge variant="sale">Inactive</Badge>}
              </div>
              <p className="text-xs text-ink-mute truncate">{banner.subtitle}</p>
            </div>
            <button onClick={() => openEdit(banner)} className="p-2 text-ink-soft hover:text-ink cursor-pointer">
              <Pencil size={15} />
            </button>
            <button onClick={() => handleDelete(banner.id)} className="p-2 text-ink-soft hover:text-red-600 cursor-pointer">
              <Trash2 size={15} />
            </button>
          </div>
        ))}
        {banners.length === 0 && <p className="text-sm text-ink-mute">No banners yet.</p>}
      </div>

      <Modal open={open} onOpenChange={setOpen}>
        <ModalContent title={editing ? "Edit Banner" : "Add Banner"}>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>Placement</Label>
              <Select value={form.placement} onChange={(e) => setForm({ ...form, placement: e.target.value as typeof form.placement })}>
                <option value="promo">Promotional Section</option>
                <option value="hero">Hero</option>
                <option value="collection">Collection</option>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Image</Label>
              <ImageUploader images={image} onChange={(imgs) => setImage(imgs.slice(-1))} max={1} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Title</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Subtitle</Label>
              <Input value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label>Button Label</Label>
                <Input value={form.ctaLabel} onChange={(e) => setForm({ ...form, ctaLabel: e.target.value })} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Button Link</Label>
                <Input value={form.ctaLink} onChange={(e) => setForm({ ...form, ctaLink: e.target.value })} />
              </div>
            </div>
            <label className="flex items-center gap-2.5 text-sm cursor-pointer">
              <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="h-4 w-4" />
              Active
            </label>
            <Button type="submit" size="lg" disabled={isPending} className="mt-2">
              {editing ? "Save Changes" : "Create Banner"}
            </Button>
          </form>
        </ModalContent>
      </Modal>
    </section>
  );
}
