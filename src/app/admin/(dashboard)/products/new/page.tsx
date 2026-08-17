import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ProductForm } from "@/components/admin/product-form";
import { getAllCategoriesAdmin } from "@/lib/data/categories";
import { getBrands } from "@/lib/data/brands";

export const metadata: Metadata = { title: "Add Product" };

export default async function NewProductPage() {
  const [categories, brands] = await Promise.all([getAllCategoriesAdmin(), getBrands()]);

  return (
    <div>
      <AdminPageHeader title="Add Product" description="Publish a new product to your storefront." />
      <ProductForm categories={categories} brands={brands} />
    </div>
  );
}
