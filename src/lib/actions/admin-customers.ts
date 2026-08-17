"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/session";

export async function getAdminCustomers(query?: string) {
  await requireAdmin();
  return prisma.user.findMany({
    where: {
      role: "CUSTOMER",
      ...(query
        ? { OR: [{ name: { contains: query } }, { email: { contains: query } }] }
        : {}),
    },
    include: { _count: { select: { orders: true } }, orders: { select: { total: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getAdminCustomerById(id: string) {
  await requireAdmin();
  return prisma.user.findUnique({
    where: { id },
    include: {
      orders: { orderBy: { createdAt: "desc" }, include: { items: true } },
      addresses: true,
    },
  });
}

export async function setCustomerStatus(id: string, status: "ACTIVE" | "DISABLED") {
  await requireAdmin();
  await prisma.user.update({ where: { id }, data: { status } });
  revalidatePath("/admin/customers");
  return { success: true as const };
}
