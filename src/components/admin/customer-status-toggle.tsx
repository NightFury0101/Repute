"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Ban, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { setCustomerStatus } from "@/lib/actions/admin-customers";

export function CustomerStatusToggle({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    const next = status === "ACTIVE" ? "DISABLED" : "ACTIVE";
    if (next === "DISABLED" && !confirm("Disable this customer's account? They will not be able to sign in.")) return;
    startTransition(async () => {
      await setCustomerStatus(id, next);
      toast.success(next === "ACTIVE" ? "Account re-enabled" : "Account disabled");
      router.refresh();
    });
  }

  return (
    <Button variant={status === "ACTIVE" ? "destructive" : "secondary"} onClick={handleToggle} disabled={isPending}>
      {status === "ACTIVE" ? (
        <>
          <Ban size={15} /> Disable Account
        </>
      ) : (
        <>
          <CheckCircle size={15} /> Re-enable Account
        </>
      )}
    </Button>
  );
}
