"use client";

import { useState, useTransition } from "react";
import { Plus, MapPin, Star, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Modal, ModalContent } from "@/components/ui/modal";
import { Input, Label, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { upsertAddress, deleteAddress, setDefaultAddress } from "@/lib/actions/addresses";
import { cn } from "@/lib/utils";
import type { Address } from "@/generated/prisma/client";

export function AddressesClient({ addresses }: { addresses: Address[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Address | null>(null);
  const [isPending, startTransition] = useTransition();

  function openNew() {
    setEditing(null);
    setOpen(true);
  }

  function openEdit(address: Address) {
    setEditing(address);
    setOpen(true);
  }

  async function handleSubmit(formData: FormData) {
    const payload = {
      id: editing?.id,
      label: String(formData.get("label") || "Home"),
      fullName: String(formData.get("fullName") || ""),
      phone: String(formData.get("phone") || ""),
      line1: String(formData.get("line1") || ""),
      line2: String(formData.get("line2") || ""),
      city: String(formData.get("city") || ""),
      state: String(formData.get("state") || ""),
      postalCode: String(formData.get("postalCode") || ""),
      country: String(formData.get("country") || "Maldives"),
      isDefault: formData.get("isDefault") === "on",
    };
    const result = await upsertAddress(payload);
    if (result.success) {
      toast.success(editing ? "Address updated" : "Address added");
      setOpen(false);
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteAddress(id);
      toast.success("Address removed");
      router.refresh();
    });
  }

  function handleSetDefault(id: string) {
    startTransition(async () => {
      await setDefaultAddress(id);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex justify-end">
        <Button onClick={openNew}>
          <Plus size={16} /> Add Address
        </Button>
      </div>

      {addresses.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <MapPin size={36} className="text-ink-mute" strokeWidth={1.2} />
          <p className="text-ink-soft">No saved addresses yet.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {addresses.map((address) => (
            <div key={address.id} className={cn("rounded-2xl border p-5 flex flex-col gap-2", address.isDefault ? "border-ink" : "border-line")}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-ink">{address.label}</span>
                {address.isDefault && <span className="text-[0.65rem] text-rose-gold-dark flex items-center gap-1"><Star size={11} className="fill-rose-gold-dark" /> Default</span>}
              </div>
              <p className="text-sm text-ink-soft leading-relaxed">
                {address.fullName}
                <br />
                {address.line1}
                {address.line2 ? `, ${address.line2}` : ""}
                <br />
                {address.city}, {address.postalCode}
                <br />
                {address.country}
                <br />
                {address.phone}
              </p>
              <div className="flex items-center gap-4 mt-2">
                <button onClick={() => openEdit(address)} className="text-xs text-ink flex items-center gap-1 hover:underline cursor-pointer">
                  <Pencil size={12} /> Edit
                </button>
                {!address.isDefault && (
                  <button
                    onClick={() => handleSetDefault(address.id)}
                    disabled={isPending}
                    className="text-xs text-ink-soft hover:text-ink cursor-pointer"
                  >
                    Set as Default
                  </button>
                )}
                <button
                  onClick={() => handleDelete(address.id)}
                  disabled={isPending}
                  className="text-xs text-red-600 flex items-center gap-1 hover:underline cursor-pointer ml-auto"
                >
                  <Trash2 size={12} /> Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={open} onOpenChange={setOpen}>
        <ModalContent title={editing ? "Edit Address" : "Add New Address"}>
          <form action={handleSubmit} className="flex flex-col gap-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="label">Label</Label>
                <Select id="label" name="label" defaultValue={editing?.label ?? "Home"}>
                  <option>Home</option>
                  <option>Work</option>
                  <option>Other</option>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="fullName">Full Name</Label>
                <Input id="fullName" name="fullName" required defaultValue={editing?.fullName} />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" required defaultValue={editing?.phone} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="line1">Address Line 1</Label>
              <Input id="line1" name="line1" required defaultValue={editing?.line1} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="line2">Address Line 2</Label>
              <Input id="line2" name="line2" defaultValue={editing?.line2 ?? ""} />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="city">City</Label>
                <Input id="city" name="city" required defaultValue={editing?.city} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="state">State / Atoll</Label>
                <Input id="state" name="state" defaultValue={editing?.state ?? ""} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="postalCode">Postal Code</Label>
                <Input id="postalCode" name="postalCode" required defaultValue={editing?.postalCode} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="country">Country</Label>
                <Input id="country" name="country" required defaultValue={editing?.country ?? "Maldives"} />
              </div>
            </div>
            <label className="flex items-center gap-2.5 text-sm text-ink-soft cursor-pointer">
              <input type="checkbox" name="isDefault" defaultChecked={editing?.isDefault} className="h-4 w-4" />
              Set as default address
            </label>
            <Button type="submit" size="lg" className="mt-2">
              {editing ? "Save Changes" : "Add Address"}
            </Button>
          </form>
        </ModalContent>
      </Modal>
    </div>
  );
}
