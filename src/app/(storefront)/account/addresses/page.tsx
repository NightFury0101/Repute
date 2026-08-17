import type { Metadata } from "next";
import { AddressesClient } from "@/components/account/addresses-client";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/db";

export const metadata: Metadata = {
  title: "My Addresses",
};

export default async function AddressesPage() {
  const user = await requireUser();
  const addresses = await prisma.address.findMany({
    where: { userId: user.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });

  return <AddressesClient addresses={addresses} />;
}
