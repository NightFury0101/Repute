"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Select, Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateOrderStatus } from "@/lib/actions/admin-orders";
import { ORDER_STATUSES, ORDER_STATUS_LABELS, type OrderStatus } from "@/lib/constants";

export function OrderStatusUpdater({
  orderId,
  currentStatus,
  trackingNumber,
}: {
  orderId: string;
  currentStatus: string;
  trackingNumber: string | null;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [tracking, setTracking] = useState(trackingNumber ?? "");
  const [note, setNote] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleUpdate() {
    startTransition(async () => {
      const result = await updateOrderStatus(orderId, status as OrderStatus, note, tracking);
      if (result.success) {
        toast.success("Order status updated");
        setNote("");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <div className="rounded-2xl border border-line bg-warm-white p-6 flex flex-col gap-4">
      <h3 className="font-serif text-xl text-ink">Update Order Status</h3>
      <div className="flex flex-col gap-1.5">
        <Label>Status</Label>
        <Select value={status} onChange={(e) => setStatus(e.target.value)}>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {ORDER_STATUS_LABELS[s]}
            </option>
          ))}
        </Select>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>Tracking Number</Label>
        <Input value={tracking} onChange={(e) => setTracking(e.target.value)} placeholder="e.g. TRK1234567" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>Note (optional)</Label>
        <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Internal note for this status change" />
      </div>
      <Button onClick={handleUpdate} disabled={isPending}>
        {isPending ? "Updating…" : "Update Status"}
      </Button>
    </div>
  );
}
