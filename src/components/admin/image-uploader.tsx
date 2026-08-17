"use client";

import { useState } from "react";
import Image from "next/image";
import { Upload, X, Loader2, GripVertical } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export interface UploadedImage {
  url: string;
  alt?: string;
}

export function ImageUploader({
  images,
  onChange,
  max = 8,
}: {
  images: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
  max?: number;
}) {
  const [uploading, setUploading] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || !files.length) return;
    setUploading(true);
    try {
      const remaining = max - images.length;
      const toUpload = Array.from(files).slice(0, remaining);
      const uploaded: UploadedImage[] = [];
      for (const file of toUpload) {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (res.ok) uploaded.push({ url: data.url });
        else toast.error(data.error ?? "Upload failed");
      }
      onChange([...images, ...uploaded]);
    } finally {
      setUploading(false);
    }
  }

  function removeAt(index: number) {
    onChange(images.filter((_, i) => i !== index));
  }

  function handleDrop(index: number) {
    if (dragIndex === null || dragIndex === index) return;
    const next = [...images];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(index, 0, moved);
    onChange(next);
    setDragIndex(null);
  }

  return (
    <div className="flex flex-wrap gap-3">
      {images.map((img, i) => (
        <div
          key={img.url + i}
          draggable
          onDragStart={() => setDragIndex(i)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => handleDrop(i)}
          className="relative h-24 w-24 rounded-xl overflow-hidden border border-line group cursor-move"
        >
          <Image src={img.url} alt={img.alt ?? ""} fill className="object-cover" sizes="96px" />
          <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/40 transition-colors" />
          <button
            type="button"
            onClick={() => removeAt(i)}
            className="absolute top-1 right-1 h-6 w-6 rounded-full bg-warm-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
          >
            <X size={13} />
          </button>
          <div className="absolute bottom-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity text-warm-white">
            <GripVertical size={14} />
          </div>
          {i === 0 && (
            <span className="absolute bottom-1 right-1 text-[0.6rem] bg-ink text-warm-white px-1.5 py-0.5 rounded-full">
              Main
            </span>
          )}
        </div>
      ))}
      {images.length < max && (
        <label
          className={cn(
            "h-24 w-24 rounded-xl border border-dashed border-line flex flex-col items-center justify-center gap-1 cursor-pointer text-ink-mute hover:border-ink hover:text-ink transition-colors",
            uploading && "opacity-50 pointer-events-none"
          )}
        >
          {uploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
          <span className="text-[0.6rem]">Upload</span>
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            disabled={uploading}
            onChange={(e) => handleFiles(e.target.files)}
          />
        </label>
      )}
    </div>
  );
}
