"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { Input, Textarea, Label, Select } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ImageUploader, type UploadedImage } from "@/components/admin/image-uploader";
import { TagInput } from "@/components/admin/tag-input";
import { saveProduct } from "@/lib/actions/admin-products";
import { SKIN_TYPES } from "@/lib/constants";
import { fromJsonArray } from "@/lib/json";
import type { ProductDetail } from "@/lib/data/products";
import type { Category, Brand } from "@/generated/prisma/client";

interface VariantDraft {
  id?: string;
  type: "shade" | "size";
  name: string;
  swatch: string;
  priceOverride: string;
  stock: string;
}

export function ProductForm({
  categories,
  brands,
  product,
}: {
  categories: Category[];
  brands: Brand[];
  product?: ProductDetail;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState(product?.name ?? "");
  const [brandId, setBrandId] = useState(product?.brandId ?? brands[0]?.id ?? "");
  const [categoryId, setCategoryId] = useState(product?.categoryId ?? categories[0]?.id ?? "");
  const [sku, setSku] = useState(product?.sku ?? "");
  const [productType, setProductType] = useState(product?.productType ?? "");
  const [shortDescription, setShortDescription] = useState(product?.shortDescription ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [ingredients, setIngredients] = useState(product?.ingredients ?? "");
  const [howToUse, setHowToUse] = useState(product?.howToUse ?? "");
  const [benefits, setBenefits] = useState<string[]>(fromJsonArray(product?.benefits));
  const [skinType, setSkinType] = useState<string[]>(fromJsonArray(product?.skinType));
  const [tags, setTags] = useState<string[]>(product?.tags.map((t) => t.tag.name) ?? []);
  const [price, setPrice] = useState(product ? String(product.price) : "");
  const [discountPrice, setDiscountPrice] = useState(product?.discountPrice ? String(product.discountPrice) : "");
  const [stock, setStock] = useState(product ? String(product.stock) : "0");
  const [lowStockAt, setLowStockAt] = useState(product ? String(product.lowStockAt) : "10");
  const [isFeatured, setIsFeatured] = useState(product?.isFeatured ?? false);
  const [isBestSeller, setIsBestSeller] = useState(product?.isBestSeller ?? false);
  const [isNewArrival, setIsNewArrival] = useState(product?.isNewArrival ?? false);
  const [isActive, setIsActive] = useState(product?.isActive ?? true);
  const [images, setImages] = useState<UploadedImage[]>(
    product?.images.map((i) => ({ url: i.url, alt: i.alt ?? undefined })) ?? []
  );
  const [variants, setVariants] = useState<VariantDraft[]>(
    product?.variants.map((v) => ({
      id: v.id,
      type: v.type as "shade" | "size",
      name: v.name,
      swatch: v.swatch ?? "",
      priceOverride: v.priceOverride ? String(v.priceOverride) : "",
      stock: String(v.stock),
    })) ?? []
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  function addVariant(type: "shade" | "size") {
    setVariants((v) => [...v, { type, name: "", swatch: "", priceOverride: "", stock: "0" }]);
  }
  function updateVariant(index: number, patch: Partial<VariantDraft>) {
    setVariants((v) => v.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }
  function removeVariant(index: number) {
    setVariants((v) => v.filter((_, i) => i !== index));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    const payload = {
      id: product?.id,
      name,
      brandId,
      categoryId,
      sku,
      shortDescription,
      description,
      ingredients,
      howToUse,
      benefits,
      skinType,
      productType,
      tags,
      price,
      discountPrice: discountPrice || null,
      stock,
      lowStockAt,
      isFeatured,
      isBestSeller,
      isNewArrival,
      isActive,
      images: images.map((img) => ({ url: img.url, alt: img.alt ?? name })),
      variants: variants
        .filter((v) => v.name.trim())
        .map((v) => ({
          id: v.id,
          type: v.type,
          name: v.name,
          swatch: v.swatch || undefined,
          priceOverride: v.priceOverride || null,
          stock: v.stock,
        })),
    };

    startTransition(async () => {
      const result = await saveProduct(payload);
      if (result.success) {
        toast.success(product ? "Product updated" : "Product created");
        router.push("/admin/products");
        router.refresh();
      } else {
        setErrors(result.fieldErrors ?? {});
        toast.error(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8 max-w-4xl">
      <Section title="Basic Information">
        <div className="grid sm:grid-cols-2 gap-5">
          <Field label="Product Name" error={errors.name}>
            <Input value={name} onChange={(e) => setName(e.target.value)} required />
          </Field>
          <Field label="SKU" error={errors.sku}>
            <Input value={sku} onChange={(e) => setSku(e.target.value)} required />
          </Field>
          <Field label="Brand" error={errors.brandId}>
            <Select value={brandId} onChange={(e) => setBrandId(e.target.value)} required>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Category" error={errors.categoryId}>
            <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Product Type" hint="e.g. Lipstick, Serum, Shampoo">
            <Input value={productType} onChange={(e) => setProductType(e.target.value)} />
          </Field>
        </div>
        <Field label="Short Description" hint="Shown on product cards and previews">
          <Input value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} maxLength={160} />
        </Field>
        <Field label="Full Description">
          <Textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
        </Field>
      </Section>

      <Section title="Pricing & Stock">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <Field label="Price ($)" error={errors.price}>
            <Input type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required />
          </Field>
          <Field label="Discount Price ($)" hint="Optional">
            <Input type="number" min="0" step="0.01" value={discountPrice} onChange={(e) => setDiscountPrice(e.target.value)} />
          </Field>
          <Field label="Stock Quantity" error={errors.stock}>
            <Input type="number" min="0" value={stock} onChange={(e) => setStock(e.target.value)} required />
          </Field>
          <Field label="Low Stock Threshold">
            <Input type="number" min="0" value={lowStockAt} onChange={(e) => setLowStockAt(e.target.value)} />
          </Field>
        </div>
      </Section>

      <Section title="Images">
        <ImageUploader images={images} onChange={setImages} />
      </Section>

      <Section title="Ingredients & Usage">
        <Field label="Ingredients">
          <Textarea rows={3} value={ingredients} onChange={(e) => setIngredients(e.target.value)} />
        </Field>
        <Field label="How to Use">
          <Textarea rows={3} value={howToUse} onChange={(e) => setHowToUse(e.target.value)} />
        </Field>
        <Field label="Benefits" hint="Press Enter to add each benefit">
          <TagInput values={benefits} onChange={setBenefits} placeholder="e.g. Brightens skin tone" />
        </Field>
        <Field label="Skin / Hair Type">
          <div className="flex flex-wrap gap-2">
            {SKIN_TYPES.map((st) => (
              <label key={st} className="flex items-center gap-2 text-sm cursor-pointer">
                <Checkbox
                  checked={skinType.includes(st)}
                  onCheckedChange={() =>
                    setSkinType((prev) => (prev.includes(st) ? prev.filter((s) => s !== st) : [...prev, st]))
                  }
                />
                {st}
              </label>
            ))}
          </div>
        </Field>
        <Field label="Tags" hint="Press Enter to add each tag">
          <TagInput values={tags} onChange={setTags} placeholder="e.g. Vegan, Cruelty-Free" />
        </Field>
      </Section>

      <Section title="Variants (Shade / Size)">
        <div className="flex flex-col gap-3">
          {variants.map((v, i) => (
            <div key={i} className="grid grid-cols-[90px_1fr_90px_110px_90px_36px] gap-2 items-center">
              <Select value={v.type} onChange={(e) => updateVariant(i, { type: e.target.value as "shade" | "size" })}>
                <option value="shade">Shade</option>
                <option value="size">Size</option>
              </Select>
              <Input placeholder="Name (e.g. Rosewood, 50ml)" value={v.name} onChange={(e) => updateVariant(i, { name: e.target.value })} />
              {v.type === "shade" ? (
                <Input type="color" value={v.swatch || "#cccccc"} onChange={(e) => updateVariant(i, { swatch: e.target.value })} className="p-1 h-12" />
              ) : (
                <div />
              )}
              <Input placeholder="Price override" type="number" step="0.01" value={v.priceOverride} onChange={(e) => updateVariant(i, { priceOverride: e.target.value })} />
              <Input placeholder="Stock" type="number" value={v.stock} onChange={(e) => updateVariant(i, { stock: e.target.value })} />
              <button type="button" onClick={() => removeVariant(i)} className="text-red-600 hover:text-red-700 cursor-pointer flex justify-center">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-3 mt-2">
          <Button type="button" variant="secondary" size="sm" onClick={() => addVariant("shade")}>
            <Plus size={14} /> Add Shade
          </Button>
          <Button type="button" variant="secondary" size="sm" onClick={() => addVariant("size")}>
            <Plus size={14} /> Add Size
          </Button>
        </div>
      </Section>

      <Section title="Visibility">
        <div className="grid sm:grid-cols-2 gap-3">
          <label className="flex items-center gap-2.5 text-sm cursor-pointer">
            <Checkbox checked={isFeatured} onCheckedChange={(v) => setIsFeatured(!!v)} /> Featured
          </label>
          <label className="flex items-center gap-2.5 text-sm cursor-pointer">
            <Checkbox checked={isBestSeller} onCheckedChange={(v) => setIsBestSeller(!!v)} /> Best Seller
          </label>
          <label className="flex items-center gap-2.5 text-sm cursor-pointer">
            <Checkbox checked={isNewArrival} onCheckedChange={(v) => setIsNewArrival(!!v)} /> New Arrival
          </label>
          <label className="flex items-center gap-2.5 text-sm cursor-pointer">
            <Checkbox checked={isActive} onCheckedChange={(v) => setIsActive(!!v)} /> Active (visible on storefront)
          </label>
        </div>
      </Section>

      <div className="flex items-center gap-3 sticky bottom-0 bg-ivory py-4 -mx-1 px-1">
        <Button type="submit" size="lg" disabled={isPending}>
          {isPending ? "Publishing…" : product ? "Save Changes" : "Publish Product"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.push("/admin/products")}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-warm-white rounded-2xl border border-line p-6 sm:p-8 flex flex-col gap-5">
      <h2 className="font-serif text-xl text-ink">{title}</h2>
      {children}
    </div>
  );
}

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      {children}
      {hint && !error && <p className="text-xs text-ink-mute">{hint}</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
