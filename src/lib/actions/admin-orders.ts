"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/constants";

export interface AdminOrderFilters {
  status?: string;
  query?: string;
}

export async function getAdminOrders(filters: AdminOrderFilters = {}) {
  await requireAdmin();
  return prisma.order.findMany({
    where: {
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.query
        ? {
            OR: [
              { orderNumber: { contains: filters.query } },
              { email: { contains: filters.query } },
              { shippingName: { contains: filters.query } },
              { user: { name: { contains: filters.query } } },
            ],
          }
        : {}),
    },
    include: { user: true, items: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getAdminOrderById(id: string) {
  await requireAdmin();
  return prisma.order.findUnique({
    where: { id },
    include: {
      items: { include: { product: { include: { images: { take: 1 } } } } },
      statusHistory: { orderBy: { createdAt: "asc" } },
      user: true,
      address: true,
    },
  });
}

export async function updateOrderStatus(id: string, status: OrderStatus, note?: string, trackingNumber?: string) {
  await requireAdmin();
  if (!ORDER_STATUSES.includes(status)) {
    return { success: false as const, error: "Invalid status." };
  }
  await prisma.order.update({
    where: { id },
    data: {
      status,
      ...(trackingNumber !== undefined ? { trackingNumber: trackingNumber || null } : {}),
      statusHistory: { create: { status, note: note || null } },
    },
  });
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/account/orders");
  return { success: true as const };
}
