"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Input, Textarea, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { submitContactForm } from "@/lib/actions/newsletter";

export function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    const result = await submitContactForm(form);
    setLoading(false);
    if (result.success) {
      setSent(true);
      toast.success("Message sent — we'll be in touch soon.");
    } else {
      setErrors(result.fieldErrors ?? {});
      toast.error(result.error);
    }
  }

  if (sent) {
    return (
      <div className="rounded-2xl bg-ivory p-8 text-center">
        <p className="font-serif text-2xl text-ink">Thank you!</p>
        <p className="text-ink-soft mt-2">We&apos;ve received your message and will respond within 1–2 business days.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="grid sm:grid-cols-2 gap-5">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Name</Label>
          <Input id="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          {errors.name && <p className="text-xs text-red-600">{errors.name}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          {errors.email && <p className="text-xs text-red-600">{errors.email}</p>}
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="subject">Subject</Label>
        <Input id="subject" required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
        {errors.subject && <p className="text-xs text-red-600">{errors.subject}</p>}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="message">Message</Label>
        <Textarea id="message" rows={5} required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
        {errors.message && <p className="text-xs text-red-600">{errors.message}</p>}
      </div>
      <Button type="submit" size="lg" disabled={loading} className="w-fit">
        {loading ? "Sending…" : "Send Message"}
      </Button>
    </form>
  );
}
