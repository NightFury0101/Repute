"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function AdminLoginForm({ callbackUrl = "/admin" }: { callbackUrl?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const result = await signIn("credentials", { email, password, redirect: false });
    if (result?.error) {
      setError("Incorrect email or password.");
      setLoading(false);
      return;
    }
    const session = await fetch("/api/auth/session").then((r) => r.json());
    if (session?.user?.role !== "ADMIN") {
      setError("This account does not have admin access.");
      setLoading(false);
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full max-w-sm">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Admin Email</Label>
        <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@maldibay.com" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <Button type="submit" size="lg" disabled={loading} className="mt-2">
        {loading ? "Signing In…" : "Sign In to Dashboard"}
      </Button>
      {process.env.NEXT_PUBLIC_SHOW_DEMO_HINTS === "true" && (
        <div className="rounded-xl bg-warm-white/5 border border-warm-white/10 p-4 text-xs text-warm-white/50 leading-relaxed">
          Demo admin — sign in with the email in <code>ADMIN_SEED_EMAIL</code> and the password
          you set in <code>ADMIN_SEED_PASSWORD</code> when you seeded the database.
        </div>
      )}
    </form>
  );
}
