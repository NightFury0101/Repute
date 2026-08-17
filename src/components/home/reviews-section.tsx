import Link from "next/link";
import { Quote } from "lucide-react";
import { Container, SectionHeading } from "@/components/ui/container";
import { Rating } from "@/components/ui/rating";
import { AvatarInitials } from "@/components/ui/avatar-initials";
import { Reveal } from "@/components/ui/reveal";
import { getFeaturedReviews } from "@/lib/data/reviews";

export async function ReviewsSection() {
  const reviews = await getFeaturedReviews(6);
  if (!reviews.length) return null;

  return (
    <section className="py-20 sm:py-28 bg-cream">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="Loved by Our Community"
            title="What people are saying"
            align="center"
            className="mx-auto"
          />
        </Reveal>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review, i) => (
            <Reveal key={review.id} delay={i * 70}>
              <Link
                href={`/product/${review.product.slug}#reviews`}
                className="flex flex-col gap-4 h-full rounded-2xl bg-warm-white p-7 shadow-sm hover:shadow-lg transition-shadow duration-300"
              >
                <Quote className="text-blush-deep" size={28} strokeWidth={1.5} />
                <Rating value={review.rating} size={14} />
                {review.title && <p className="font-serif text-lg text-ink">{review.title}</p>}
                <p className="text-sm text-ink-soft leading-relaxed line-clamp-4">{review.comment}</p>
                <div className="mt-auto pt-4 flex items-center gap-3">
                  <AvatarInitials name={review.user.name ?? "Repute Customer"} size={36} />
                  <div>
                    <p className="text-sm font-medium text-ink">{review.user.name ?? "Verified Customer"}</p>
                    <p className="text-xs text-ink-mute">on {review.product.name}</p>
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
