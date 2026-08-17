"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { ArrowRight } from "lucide-react";
import { subscribeNewsletter } from "@/lib/actions/newsletter";
import { cn } from "@/lib/utils";

export function NewsletterForm({ variant = "dark" }: { variant?: "dark" | "light" }) {
  const [email, setEmail] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const result = await subscribeNewsletter(email);
      if (result.success) {
        toast.success("You're on the list — welcome to Maldibay.");
        setEmail("");
      } else {
        toast.error(result.error);
      }
    });
  };

  const dark = variant === "dark";

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-md items-center gap-0">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Your email address"
        className={cn(
          "h-12 flex-1 rounded-l-full border px-5 text-sm focus:outline-none",
          dark
            ? "bg-transparent border-warm-white/30 text-warm-white placeholder:text-warm-white/50 focus:border-warm-white"
            : "bg-warm-white border-line text-ink placeholder:text-ink-mute focus:border-rose-gold"
        )}
      />
      <button
        type="submit"
        disabled={isPending}
        className={cn(
          "h-12 px-5 rounded-r-full flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50",
          dark ? "bg-warm-white text-ink hover:bg-blush" : "bg-ink text-warm-white hover:bg-ink-soft"
        )}
        aria-label="Subscribe"
      >
        <ArrowRight size={18} />
      </button>
    </form>
  );
}
