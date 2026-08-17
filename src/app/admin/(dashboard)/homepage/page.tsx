import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { HomepageSettingsForm } from "@/components/admin/homepage-settings-form";
import { BannersClient } from "@/components/admin/banners-client";
import { FeaturedProductsPicker } from "@/components/admin/featured-products-picker";
import { getHomepageSettings, getAllBannersAdmin } from "@/lib/data/settings";
import { getAdminProducts } from "@/lib/data/products";

export const metadata: Metadata = { title: "Homepage CMS" };

export default async function AdminHomepagePage() {
  const [settings, banners, products] = await Promise.all([
    getHomepageSettings(),
    getAllBannersAdmin(),
    getAdminProducts({ status: "active" }),
  ]);

  return (
    <div>
      <AdminPageHeader
        title="Homepage CMS"
        description="Control what appears on your storefront homepage — no code required."
      />
      <div className="flex flex-col gap-6 max-w-3xl">
        <HomepageSettingsForm settings={settings} />
        <BannersClient banners={banners} />
        <FeaturedProductsPicker products={products} />
      </div>
    </div>
  );
}
