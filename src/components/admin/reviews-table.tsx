"use client";

import { useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { toast } from "sonner";
import { Check, EyeOff, Trash2 } from "lucide-react";
import { Rating } from "@/components/ui/rating";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/input";
import { setReviewStatus, deleteReview } from "@/lib/actions/admin-reviews";
import { formatDate } from "@/lib/utils";
import { REVIEW_STATUSES } from "@/lib/constants";
import type { Prisma } from "@/generated/prisma/client";

type ReviewRow = Prisma.ReviewGetPayload<{
  include: { user: true; product: { include: { images: true } } };
}>;

const STATUS_VARIANT: Record<string, "success" | "muted" | "warning"> = {
  PENDING: "warning",
  APPROVED: "success",
  HIDDEN: "muted",
};

export function ReviewsTable({ reviews }: { reviews: ReviewRow[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function setStatusFilter(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set("status", value);
    else params.delete("status");
    router.push(`${pathname}?${params.toString()}`);
  }

  function handleStatus(id: string, status: "PENDING" | "APPROVED" | "HIDDEN") {
    startTransition(async () => {
      await setReviewStatus(id, status);
      toast.success(`Review ${status.toLowerCase()}`);
      router.refresh();
    });
  }

  function handleDelete(id: string) {
    if (!confirm("Delete this review permanently?")) return;
    startTransition(async () => {
      await deleteReview(id);
      toast.success("Review deleted");
      router.refresh();
    });
  }

  return (
    <div>
      <div className="mb-6">
        <Select value={searchParams.get("status") ?? ""} onChange={(e) => setStatusFilter(e.target.value)} className="w-auto min-w-[200px]">
          <option value="">All Statuses</option>
          {REVIEW_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.charAt(0) + s.slice(1).toLowerCase()}
            </option>
          ))}
        </Select>
      </div>

      <div className="flex flex-col gap-4">
        {reviews.map((review) => (
          <div key={review.id} className="rounded-2xl border border-line bg-warm-white p-5 flex gap-4">
            <div className="relative h-14 w-12 rounded-lg overflow-hidden bg-cream shrink-0">
              {review.product.images[0] && (
                <Image src={review.product.images[0].url} alt={review.product.name} fill className="object-cover" sizes="50px" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <Link href={`/product/${review.product.slug}`} target="_blank" className="text-sm font-medium text-ink hover:underline">
                    {review.product.name}
                  </Link>
                  <p className="text-xs text-ink-mute mt-0.5">
                    {review.user.name ?? "Customer"} · {formatDate(review.createdAt)}
                  </p>
                </div>
                <Badge variant={STATUS_VARIANT[review.status]}>{review.status}</Badge>
              </div>
              <Rating value={review.rating} size={13} className="mt-2" />
              {review.title && <p className="text-sm font-medium text-ink mt-1.5">{review.title}</p>}
              <p className="text-sm text-ink-soft mt-1 leading-relaxed">{review.comment}</p>
              <div className="flex items-center gap-4 mt-3">
                {review.status !== "APPROVED" && (
                  <button onClick={() => handleStatus(review.id, "APPROVED")} disabled={isPending} className="text-xs text-emerald-700 flex items-center gap-1 hover:underline cursor-pointer">
                    <Check size={12} /> Approve
                  </button>
                )}
                {review.status !== "HIDDEN" && (
                  <button onClick={() => handleStatus(review.id, "HIDDEN")} disabled={isPending} className="text-xs text-ink-soft flex items-center gap-1 hover:underline cursor-pointer">
                    <EyeOff size={12} /> Hide
                  </button>
                )}
                <button onClick={() => handleDelete(review.id)} disabled={isPending} className="text-xs text-red-600 flex items-center gap-1 hover:underline cursor-pointer">
                  <Trash2 size={12} /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
        {reviews.length === 0 && <p className="text-center text-ink-mute py-12">No reviews found.</p>}
      </div>
    </div>
  );
}
