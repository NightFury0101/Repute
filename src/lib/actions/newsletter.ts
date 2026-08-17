"use server";

import { z } from "zod";
import { prisma } from "@/lib/db";
import type { ActionResult } from "@/lib/actions/auth";
import { contactSchema } from "@/lib/validations";

const emailSchema = z.string().email();

export async function subscribeNewsletter(email: string): Promise<ActionResult> {
  const parsed = emailSchema.safeParse(email);
  if (!parsed.success) {
    return { success: false, error: "Enter a valid email address." };
  }
  try {
    await prisma.newsletter.upsert({
      where: { email: parsed.data.toLowerCase() },
      update: {},
      create: { email: parsed.data.toLowerCase() },
    });
    return { success: true, data: undefined };
  } catch {
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

export async function submitContactForm(input: unknown): Promise<ActionResult> {
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] = issue.message;
    return { success: false, error: "Please check the form for errors.", fieldErrors };
  }
  // In production this would email support / create a support ticket.
  // For now we just acknowledge receipt — no external mail provider is configured.
  return { success: true, data: undefined };
}
