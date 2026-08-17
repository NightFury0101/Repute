import type { Metadata } from "next";
import { Lock } from "lucide-react";
import { AdminLoginForm } from "@/components/admin/admin-login-form";

export const metadata: Metadata = {
  title: "Admin Sign In",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center py-16 px-5">
      <div className="flex flex-col items-center gap-8 w-full">
        <div className="text-center">
          <div className="h-12 w-12 rounded-full bg-warm-white/10 flex items-center justify-center mx-auto mb-5">
            <Lock size={18} className="text-warm-white" />
          </div>
          <p className="font-serif text-2xl text-warm-white">Maldibay Admin</p>
          <p className="text-warm-white/50 text-sm mt-2">Sign in to manage your store.</p>
        </div>
        <AdminLoginForm callbackUrl={callbackUrl ?? "/admin"} />
      </div>
    </div>
  );
}
