import "server-only";
import { prisma } from "@/lib/db";

export async function recomputeProductRating(productId: string) {
  const agg = await prisma.review.aggregate({
    where: { productId, status: "APPROVED" },
    _avg: { rating: true },
    _count: { rating: true },
  });
  await prisma.product.update({
    where: { id: productId },
    data: {
      rating: agg._avg.rating ?? 0,
      reviewCount: agg._count.rating,
    },
  });
}

export async function getFeaturedReviews(take = 6) {
  return prisma.review.findMany({
    where: { status: "APPROVED", rating: { gte: 4 } },
    include: { user: true, product: { select: { name: true, slug: true } } },
    orderBy: [{ helpfulCount: "desc" }, { createdAt: "desc" }],
    take,
  });
}

export async function getReviewsForProduct(productId: string) {
  return prisma.review.findMany({
    where: { productId, status: "APPROVED" },
    include: { user: true },
    orderBy: { createdAt: "desc" },
  });
}

export interface AdminReviewFilters {
  status?: string;
  query?: string;
}

export async function getAdminReviews(filters: AdminReviewFilters = {}) {
  return prisma.review.findMany({
    where: {
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.query
        ? {
            OR: [
              { comment: { contains: filters.query } },
              { title: { contains: filters.query } },
              { product: { name: { contains: filters.query } } },
              { user: { name: { contains: filters.query } } },
            ],
          }
        : {}),
    },
    include: { user: true, product: { include: { images: { take: 1 } } } },
    orderBy: { createdAt: "desc" },
  });
}
