import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { CategoriesClient } from "@/components/admin/categories-client";
import { getAllCategoriesAdmin } from "@/lib/data/categories";

export const metadata: Metadata = { title: "Categories" };

export default async function AdminCategoriesPage() {
  const categories = await getAllCategoriesAdmin();
  return (
    <div>
      <AdminPageHeader title="Categories" description="Organize your storefront navigation and shop pages." />
      <CategoriesClient categories={categories} />
    </div>
  );
}
