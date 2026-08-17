import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Sign In",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-16 px-5">
      <div className="flex flex-col items-center gap-8 w-full">
        <div className="text-center">
          <Link href="/" className="font-serif text-3xl text-ink">
            Maldibay
          </Link>
          <h1 className="font-serif text-2xl mt-6 text-ink">Welcome Back</h1>
          <p className="text-ink-soft text-sm mt-2">Sign in to access your account, orders and wishlist.</p>
        </div>
        <LoginForm callbackUrl={callbackUrl ?? "/account"} />
      </div>
    </div>
  );
}
