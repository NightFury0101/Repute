import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { BrandsClient } from "@/components/admin/brands-client";
import { getBrands } from "@/lib/data/brands";

export const metadata: Metadata = { title: "Brands" };

export default async function AdminBrandsPage() {
  const brands = await getBrands();
  return (
    <div>
      <AdminPageHeader title="Brands" description="Manage the brands carried in your catalog." />
      <BrandsClient brands={brands} />
    </div>
  );
}
