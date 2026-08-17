"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Input, Textarea, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ImageUploader, type UploadedImage } from "@/components/admin/image-uploader";
import { updateHomepageSettings } from "@/lib/actions/admin-settings";
import type { HomepageSettings } from "@/lib/data/settings";

export function HomepageSettingsForm({ settings }: { settings: HomepageSettings }) {
  const [form, setForm] = useState(settings);
  const [heroImage, setHeroImage] = useState<UploadedImage[]>(settings.heroImage ? [{ url: settings.heroImage }] : []);
  const [collectionImage, setCollectionImage] = useState<UploadedImage[]>(
    settings.featuredCollectionImage ? [{ url: settings.featuredCollectionImage }] : []
  );
  const [isPending, startTransition] = useTransition();

  function set<K extends keyof HomepageSettings>(key: K, value: HomepageSettings[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await updateHomepageSettings({
        ...form,
        heroImage: heroImage[0]?.url ?? form.heroImage,
        featuredCollectionImage: collectionImage[0]?.url ?? form.featuredCollectionImage,
      });
      if (result.success) toast.success("Homepage updated — changes are live.");
      else toast.error(result.error);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      <section className="rounded-2xl border border-line bg-warm-white p-6 sm:p-8 flex flex-col gap-5">
        <h3 className="font-serif text-xl text-ink">Hero Section</h3>
        <div className="flex flex-col gap-1.5">
          <Label>Hero Product Image</Label>
          <p className="text-xs text-ink-mute">
            The hero floats this as a product cutout — a transparent PNG works best.
          </p>
          <ImageUploader images={heroImage} onChange={(imgs) => setHeroImage(imgs.slice(-1))} max={1} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Title</Label>
          <p className="text-xs text-ink-mute">
            Start a new line before the last phrase to highlight it in the accent color.
          </p>
          <Input value={form.heroTitle} onChange={(e) => set("heroTitle", e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Subtitle</Label>
          <Textarea rows={2} value={form.heroSubtitle} onChange={(e) => set("heroSubtitle", e.target.value)} />
        </div>
        <div className="grid sm:grid-cols-2 gap-5">
          <div className="flex flex-col gap-1.5">
            <Label>Primary Button Label</Label>
            <Input value={form.heroCtaLabel} onChange={(e) => set("heroCtaLabel", e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Primary Button Link</Label>
            <Input value={form.heroCtaLink} onChange={(e) => set("heroCtaLink", e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Secondary Button Label</Label>
            <Input value={form.heroCtaLabel2} onChange={(e) => set("heroCtaLabel2", e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Secondary Button Link</Label>
            <Input value={form.heroCtaLink2} onChange={(e) => set("heroCtaLink2", e.target.value)} />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-line bg-warm-white p-6 sm:p-8 flex flex-col gap-5">
        <h3 className="font-serif text-xl text-ink">Featured Collection Section</h3>
        <div className="flex flex-col gap-1.5">
          <Label>Collection Image</Label>
          <ImageUploader images={collectionImage} onChange={(imgs) => setCollectionImage(imgs.slice(-1))} max={1} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Title</Label>
          <Input value={form.featuredCollectionTitle} onChange={(e) => set("featuredCollectionTitle", e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Subtitle</Label>
          <Textarea rows={2} value={form.featuredCollectionSubtitle} onChange={(e) => set("featuredCollectionSubtitle", e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Link</Label>
          <Input value={form.featuredCollectionLink} onChange={(e) => set("featuredCollectionLink", e.target.value)} />
        </div>
      </section>

      <Button type="submit" size="lg" disabled={isPending} className="w-fit">
        {isPending ? "Saving…" : "Save & Publish Changes"}
      </Button>
    </form>
  );
}
