import { Link, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AuthShell } from "@/routes/login";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth/auth-context";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Reset your password — Wanbiz EventPass" },
      { name: "description", content: "Request a password recovery link for your Wanbiz EventPass account." },
      { property: "og:title", content: "Reset your EventPass password" },
      { property: "og:description", content: "Request a recovery link for your Wanbiz EventPass account." },
    ],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const { requestPasswordReset } = useAuth();
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = String(new FormData(event.currentTarget).get("email") ?? "").trim();
    setBusy(true);
    setError(null);
    try {
      await requestPasswordReset(email);
      setSent(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "We could not send a recovery email.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell
      title="Forgot your password?"
      subtitle="Enter the email on your account and we will send a recovery link."
      footer={
        <p className="text-sm text-muted-foreground">
          <Link to="/login" className="font-semibold text-brand-red hover:underline">
            Back to sign in
          </Link>
        </p>
      }
    >
      {sent ? (
        <div className="space-y-4">
          <p className="rounded-xl border border-border bg-secondary/60 p-4 text-sm">
            If an EventPass account exists for that email, a recovery link is on its way.
          </p>
          <Button asChild variant="outline" className="w-full">
            <Link to="/reset-password">Continue to reset form</Link>
          </Button>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input id="email" name="email" type="email" autoComplete="email" required />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" size="lg" disabled={busy} className="w-full bg-gradient-brand text-primary-foreground">
            {busy ? "Sending…" : "Send recovery link"}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
