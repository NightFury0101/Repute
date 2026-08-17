import type { Metadata } from "next";
import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSearchBar } from "@/components/admin/admin-search-bar";
import { Badge } from "@/components/ui/badge";
import { AvatarInitials } from "@/components/ui/avatar-initials";
import { getAdminCustomers } from "@/lib/actions/admin-customers";
import { formatDate, formatPrice } from "@/lib/utils";

export const metadata: Metadata = { title: "Customers" };

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const customers = await getAdminCustomers(q);

  return (
    <div>
      <AdminPageHeader title="Customers" description={`${customers.length} registered customers`} />
      <div className="mb-6">
        <AdminSearchBar placeholder="Search by name or email…" />
      </div>

      <div className="overflow-x-auto rounded-2xl border border-line bg-warm-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs uppercase tracking-wider text-ink-mute">
              <th className="p-4 font-medium">Customer</th>
              <th className="p-4 font-medium">Joined</th>
              <th className="p-4 font-medium">Orders</th>
              <th className="p-4 font-medium">Lifetime Spend</th>
              <th className="p-4 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer.id} className="border-b border-line last:border-0 hover:bg-ivory/50">
                <td className="p-4">
                  <Link href={`/admin/customers/${customer.id}`} className="flex items-center gap-3">
                    <AvatarInitials name={customer.name ?? customer.email} size={32} />
                    <div>
                      <p className="text-ink font-medium">{customer.name ?? "—"}</p>
                      <p className="text-xs text-ink-mute">{customer.email}</p>
                    </div>
                  </Link>
                </td>
                <td className="p-4 text-ink-soft">{formatDate(customer.createdAt)}</td>
                <td className="p-4 text-ink-soft">{customer._count.orders}</td>
                <td className="p-4 text-ink-soft">
                  {formatPrice(customer.orders.reduce((s, o) => s + o.total, 0))}
                </td>
                <td className="p-4">
                  <Badge variant={customer.status === "ACTIVE" ? "success" : "sale"}>{customer.status}</Badge>
                </td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-ink-mute">
                  No customers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
