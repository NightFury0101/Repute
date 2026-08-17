import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { DiscountsClient } from "@/components/admin/discounts-client";
import { getAdminDiscounts } from "@/lib/actions/admin-discounts";
import { getAllCategoriesAdmin } from "@/lib/data/categories";

export const metadata: Metadata = { title: "Discounts" };

export default async function AdminDiscountsPage() {
  const [discounts, categories] = await Promise.all([getAdminDiscounts(), getAllCategoriesAdmin()]);
  return (
    <div>
      <AdminPageHeader title="Discounts" description="Manage promo codes and time-limited promotions." />
      <DiscountsClient discounts={discounts} categories={categories} />
    </div>
  );
}
