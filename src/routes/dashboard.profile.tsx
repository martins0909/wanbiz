import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth/auth-context";

export const Route = createFileRoute("/dashboard/profile")({
  head: () => ({
    meta: [
      { title: "Profile settings — Wanbiz EventPass" },
      { name: "description", content: "Update your EventPass name, email, phone number and password." },
      { property: "og:title", content: "EventPass profile settings" },
      { property: "og:description", content: "Manage your account details and password." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, updateProfile, isAuthenticated } = useAuth();
  const [saving, setSaving] = useState(false);

  function onSaveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSaving(true);
    updateProfile({
      fullName: String(form.get("fullName") ?? ""),
      email: String(form.get("email") ?? ""),
      phone: String(form.get("phone") ?? ""),
    });
    setSaving(false);
    toast.success("Profile updated");
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold">Profile</h2>
        <p className="mt-1 text-sm text-muted-foreground">Keep your details current so tickets and receipts reach you.</p>
      </div>

      {!isAuthenticated && (
        <p className="rounded-2xl border border-border bg-secondary/50 p-4 text-sm text-muted-foreground">
          Sign in to edit your own profile. The fields below are a preview.
        </p>
      )}

      <form onSubmit={onSaveProfile} className="grid gap-4 rounded-2xl border border-border bg-card p-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full name</Label>
          <Input id="fullName" name="fullName" defaultValue={user?.fullName ?? ""} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" defaultValue={user?.email ?? ""} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone number</Label>
          <Input id="phone" name="phone" type="tel" defaultValue={user?.phone ?? ""} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="role">Account type</Label>
          <Input id="role" value={user?.role ?? "ATTENDEE"} readOnly className="bg-secondary/60" />
        </div>
        <div className="sm:col-span-2">
          <Button type="submit" disabled={saving} className="bg-gradient-brand text-primary-foreground">
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </form>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          toast.success("Password change request saved");
          (event.target as HTMLFormElement).reset();
        }}
        className="grid gap-4 rounded-2xl border border-border bg-card p-5 sm:grid-cols-2"
      >
        <div className="sm:col-span-2">
          <h3 className="text-base font-bold">Change password</h3>
          <p className="mt-1 text-sm text-muted-foreground">Passwords are never stored in the browser.</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="currentPassword">Current password</Label>
          <Input id="currentPassword" name="currentPassword" type="password" autoComplete="current-password" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="newPassword">New password</Label>
          <Input id="newPassword" name="newPassword" type="password" autoComplete="new-password" required />
        </div>
        <div className="sm:col-span-2">
          <Button type="submit" variant="outline">
            Update password
          </Button>
        </div>
      </form>
    </div>
  );
}
