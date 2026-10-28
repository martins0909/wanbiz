import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AuthShell } from "@/routes/login";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth/auth-context";
import { z } from "zod";

export const Route = createFileRoute("/reset-password")({
  validateSearch: z.object({ token: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "Set a new password — Wanbiz EventPass" },
      { name: "description", content: "Choose a new password for your Wanbiz EventPass account." },
      { property: "og:title", content: "Set a new EventPass password" },
      { property: "og:description", content: "Choose a new password for your Wanbiz EventPass account." },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const { resetPassword } = useAuth();
  const { token = "" } = Route.useSearch();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");
    if (password.length < 8) return setError("Password must be at least 8 characters.");
    if (password !== String(form.get("confirm") ?? "")) return setError("Passwords do not match.");
    setBusy(true);
    if (!token) return setError("Open the recovery link from your email to reset your password.");
    setBusy(true);
    try {
      await resetPassword(password, token);
      toast.success("Password updated. Please sign in.");
      await navigate({ to: "/login" });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "We could not reset your password.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell title="Set a new password" subtitle="Choose a strong password of at least 8 characters.">
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password">New password</Label>
          <Input id="password" name="password" type="password" autoComplete="new-password" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm">Confirm new password</Label>
          <Input id="confirm" name="confirm" type="password" autoComplete="new-password" required />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" size="lg" disabled={busy} className="w-full bg-gradient-brand text-primary-foreground">
          {busy ? "Updating…" : "Update password"}
        </Button>
      </form>
    </AuthShell>
  );
}
