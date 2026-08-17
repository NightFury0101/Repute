import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ProductForm } from "@/components/admin/product-form";
import { getAllCategoriesAdmin } from "@/lib/data/categories";
import { getBrands } from "@/lib/data/brands";
import { getProductByIdAdmin } from "@/lib/data/products";

export const metadata: Metadata = { title: "Edit Product" };

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [categories, brands, product] = await Promise.all([
    getAllCategoriesAdmin(),
    getBrands(),
    getProductByIdAdmin(id),
  ]);

  if (!product) notFound();

  return (
    <div>
      <AdminPageHeader title="Edit Product" description={product.name} />
      <ProductForm categories={categories} brands={brands} product={product} />
    </div>
  );
}
