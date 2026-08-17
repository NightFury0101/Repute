import type { Metadata } from "next";
import { SettingsClient } from "@/components/account/settings-client";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/db";

export const metadata: Metadata = {
  title: "Account Settings",
};

export default async function SettingsPage() {
  const sessionUser = await requireUser();
  const user = await prisma.user.findUniqueOrThrow({ where: { id: sessionUser.id } });

  return <SettingsClient user={user} />;
}
