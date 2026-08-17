import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSearchBar } from "@/components/admin/admin-search-bar";
import { ReviewsTable } from "@/components/admin/reviews-table";
import { getAdminReviews } from "@/lib/data/reviews";

export const metadata: Metadata = { title: "Reviews" };

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const { q, status } = await searchParams;
  const reviews = await getAdminReviews({ query: q, status });

  return (
    <div>
      <AdminPageHeader title="Reviews" description={`${reviews.length} reviews`} />
      <div className="mb-6">
        <AdminSearchBar placeholder="Search reviews…" />
      </div>
      <ReviewsTable reviews={reviews} />
    </div>
  );
}
