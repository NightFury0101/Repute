"use client";

import { useState, useTransition } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Star, ImagePlus, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea, Input, Label } from "@/components/ui/input";
import { submitReview } from "@/lib/actions/reviews";
import { cn } from "@/lib/utils";

export function WriteReviewForm({ productId }: { productId: string }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(false);

  if (!open) {
    return (
      <Button variant="secondary" onClick={() => (session?.user ? setOpen(true) : router.push("/login?callbackUrl=/product"))}>
        Write a Review
      </Button>
    );
  }

  if (submitted) {
    return (
      <div className="rounded-2xl bg-ivory p-6 text-sm text-ink-soft">
        Thanks for your review! It&apos;s been submitted and will appear once approved by our team.
      </div>
    );
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading(true);
    try {
      for (const file of files.slice(0, 5 - images.length)) {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (res.ok) setImages((prev) => [...prev, data.url]);
        else toast.error(data.error ?? "Upload failed");
      }
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Please select a star rating.");
      return;
    }
    startTransition(async () => {
      const result = await submitReview({ productId, rating, title, comment, images });
      if (result.success) {
        setSubmitted(true);
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-line p-6 flex flex-col gap-5 max-w-xl">
      <h4 className="font-serif text-xl">Write a Review</h4>

      <div>
        <Label>Your Rating</Label>
        <div className="flex items-center gap-1 mt-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <button
              key={i}
              type="button"
              onMouseEnter={() => setHoverRating(i)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(i)}
              className="cursor-pointer p-0.5"
              aria-label={`${i} star`}
            >
              <Star
                size={26}
                className={cn(
                  (hoverRating || rating) >= i ? "fill-rose-gold text-rose-gold" : "text-ink-mute/40"
                )}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="review-title">Title (optional)</Label>
        <Input id="review-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Sum it up in a few words" />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="review-comment">Your Review</Label>
        <Textarea
          id="review-comment"
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="What did you like or dislike? How did you use it?"
          required
          minLength={10}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Photos (optional)</Label>
        <div className="flex flex-wrap gap-2 mt-1">
          {images.map((url) => (
            <div key={url} className="relative h-16 w-16 rounded-lg overflow-hidden group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="Review upload" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => setImages((prev) => prev.filter((u) => u !== url))}
                className="absolute inset-0 bg-ink/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
          ))}
          {images.length < 5 && (
            <label className="h-16 w-16 rounded-lg border border-dashed border-line flex items-center justify-center cursor-pointer text-ink-mute hover:border-ink hover:text-ink transition-colors">
              {uploading ? <Loader2 size={18} className="animate-spin" /> : <ImagePlus size={18} />}
              <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" disabled={uploading} />
            </label>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Submitting…" : "Submit Review"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
