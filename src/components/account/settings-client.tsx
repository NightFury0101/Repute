"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateProfile, changePassword } from "@/lib/actions/account";
import type { User } from "@/generated/prisma/client";

export function SettingsClient({ user }: { user: User }) {
  const [name, setName] = useState(user.name ?? "");
  const [phone, setPhone] = useState(user.phone ?? "");
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  async function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSavingProfile(true);
    const result = await updateProfile({ name, phone });
    setSavingProfile(false);
    if (result.success) toast.success("Profile updated");
    else toast.error(result.error);
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSavingPassword(true);
    const result = await changePassword({ currentPassword, newPassword });
    setSavingPassword(false);
    if (result.success) {
      toast.success("Password updated");
      setCurrentPassword("");
      setNewPassword("");
    } else {
      toast.error(result.error);
    }
  }

  return (
    <div className="flex flex-col gap-12 max-w-lg">
      <form onSubmit={handleProfileSubmit} className="flex flex-col gap-5">
        <h2 className="font-serif text-2xl text-ink">Profile Information</h2>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Full Name</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Email Address</Label>
          <Input value={user.email} disabled />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="phone">Phone Number</Label>
          <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+960 777-1234" />
        </div>
        <Button type="submit" disabled={savingProfile} className="w-fit">
          {savingProfile ? "Saving…" : "Save Changes"}
        </Button>
      </form>

      {user.passwordHash && (
        <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-5 pt-8 border-t border-line">
          <h2 className="font-serif text-2xl text-ink">Change Password</h2>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              type="password"
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" variant="secondary" disabled={savingPassword} className="w-fit">
            {savingPassword ? "Updating…" : "Update Password"}
          </Button>
        </form>
      )}
    </div>
  );
}
