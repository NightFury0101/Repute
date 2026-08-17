import "server-only";
import { prisma } from "@/lib/db";
import { subDays, startOfDay, format } from "date-fns";

export async function getDashboardAnalytics() {
  const since30 = startOfDay(subDays(new Date(), 29));

  const [orders, customers, lowStock, recentOrders, products] = await Promise.all([
    prisma.order.findMany({
      where: { createdAt: { gte: since30 } },
      select: { total: true, createdAt: true, status: true },
    }),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.product.findMany({
      where: { isActive: true },
      select: { id: true, name: true, sku: true, stock: true, lowStockAt: true },
    }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { user: true, items: true },
    }),
    prisma.product.findMany({
      select: { id: true, name: true, images: { take: 1 }, orderItems: { select: { quantity: true } } },
    }),
  ]);

  const validOrders = orders.filter((o) => o.status !== "CANCELLED");
  const totalRevenue = validOrders.reduce((sum, o) => sum + o.total, 0);
  const totalOrders = validOrders.length;
  const avgOrderValue = totalOrders ? totalRevenue / totalOrders : 0;

  const salesByDay = new Map<string, number>();
  for (let i = 29; i >= 0; i--) {
    const day = format(subDays(new Date(), i), "yyyy-MM-dd");
    salesByDay.set(day, 0);
  }
  for (const o of validOrders) {
    const day = format(o.createdAt, "yyyy-MM-dd");
    if (salesByDay.has(day)) {
      salesByDay.set(day, (salesByDay.get(day) ?? 0) + o.total);
    }
  }
  const salesOverTime = Array.from(salesByDay.entries()).map(([date, total]) => ({
    date,
    total: Math.round(total * 100) / 100,
  }));

  const lowStockProducts = lowStock
    .filter((p) => p.stock <= p.lowStockAt)
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 8);
  const outOfStockCount = lowStock.filter((p) => p.stock === 0).length;

  const bestSelling = products
    .map((p) => ({
      id: p.id,
      name: p.name,
      image: p.images[0]?.url ?? null,
      unitsSold: p.orderItems.reduce((s, i) => s + i.quantity, 0),
    }))
    .filter((p) => p.unitsSold > 0)
    .sort((a, b) => b.unitsSold - a.unitsSold)
    .slice(0, 6);

  return {
    totalRevenue,
    totalOrders,
    avgOrderValue,
    totalCustomers: customers,
    salesOverTime,
    lowStockProducts,
    outOfStockCount,
    bestSelling,
    recentOrders,
  };
}
