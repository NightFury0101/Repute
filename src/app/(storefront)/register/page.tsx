import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Create Account",
};

export default async function RegisterPage({
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
            Repute
          </Link>
          <h1 className="font-serif text-2xl mt-6 text-ink">Create Your Account</h1>
          <p className="text-ink-soft text-sm mt-2">Join Repute for faster checkout, order tracking and more.</p>
        </div>
        <RegisterForm callbackUrl={callbackUrl ?? "/account"} />
      </div>
    </div>
  );
}
