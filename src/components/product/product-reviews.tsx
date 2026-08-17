import { ThumbsUp, BadgeCheck } from "lucide-react";
import { Rating } from "@/components/ui/rating";
import { AvatarInitials } from "@/components/ui/avatar-initials";
import { WriteReviewForm } from "@/components/product/write-review-form";
import { fromJsonArray } from "@/lib/json";
import { formatDate } from "@/lib/utils";
import type { ProductDetail } from "@/lib/data/products";

export function ProductReviews({ product }: { product: ProductDetail }) {
  const reviews = product.reviews;
  const histogram = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));
  const maxCount = Math.max(1, ...histogram.map((h) => h.count));

  return (
    <div id="reviews" className="scroll-mt-24">
      <h2 className="font-serif text-3xl text-ink mb-8">Reviews</h2>

      <div className="grid lg:grid-cols-[280px_1fr] gap-12">
        <div>
          <div className="flex items-baseline gap-3">
            <span className="font-serif text-5xl">{product.rating.toFixed(1)}</span>
            <span className="text-ink-mute text-sm">/ 5</span>
          </div>
          <Rating value={product.rating} size={18} className="mt-2" />
          <p className="text-sm text-ink-mute mt-1">
            Based on {product.reviewCount} review{product.reviewCount === 1 ? "" : "s"}
          </p>

          <div className="flex flex-col gap-1.5 mt-6">
            {histogram.map((h) => (
              <div key={h.star} className="flex items-center gap-2 text-xs text-ink-soft">
                <span className="w-3">{h.star}</span>
                <div className="flex-1 h-1.5 rounded-full bg-ivory overflow-hidden">
                  <div
                    className="h-full bg-rose-gold rounded-full"
                    style={{ width: `${(h.count / maxCount) * 100}%` }}
                  />
                </div>
                <span className="w-5 text-right">{h.count}</span>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <WriteReviewForm productId={product.id} />
          </div>
        </div>

        <div className="flex flex-col gap-8">
          {reviews.length === 0 ? (
            <p className="text-ink-soft">Be the first to review this product.</p>
          ) : (
            reviews.map((review) => {
              const images = fromJsonArray(review.images);
              return (
                <div key={review.id} className="pb-8 border-b border-line last:border-0">
                  <div className="flex items-start gap-3">
                    <AvatarInitials name={review.user.name ?? "Repute Customer"} size={40} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium text-ink">{review.user.name ?? "Verified Customer"}</p>
                        {review.isVerified && (
                          <span className="flex items-center gap-1 text-[0.65rem] text-emerald-700">
                            <BadgeCheck size={12} /> Verified Purchase
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-ink-mute">{formatDate(review.createdAt)}</p>
                    </div>
                  </div>
                  <Rating value={review.rating} size={13} className="mt-3" />
                  {review.title && <p className="font-medium text-ink mt-2">{review.title}</p>}
                  <p className="text-ink-soft leading-relaxed mt-1.5">{review.comment}</p>
                  {images.length > 0 && (
                    <div className="flex gap-2 mt-3">
                      {images.map((url) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img key={url} src={url} alt="Review" className="h-16 w-16 rounded-lg object-cover" />
                      ))}
                    </div>
                  )}
                  <button className="flex items-center gap-1.5 text-xs text-ink-mute hover:text-ink mt-3 cursor-pointer">
                    <ThumbsUp size={13} /> Helpful ({review.helpfulCount})
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
