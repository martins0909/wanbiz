import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AuthShell } from "@/routes/login";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useAuth } from "@/lib/auth/auth-context";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create your account — Wanbiz EventPass" },
      {
        name: "description",
        content: "Register as an attendee to buy tickets in Naira, or as an organizer to sell tickets on Wanbiz EventPass.",
      },
      { property: "og:title", content: "Create your Wanbiz EventPass account" },
      { property: "og:description", content: "Attendee and organizer registration for Nigeria's event ticketing platform." },
    ],
  }),
  component: RegisterPage,
});

type Role = "ATTENDEE" | "ORGANIZER";

function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>("ATTENDEE");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = new FormData(event.currentTarget);
    const fullName = String(form.get("fullName") ?? "").trim();
    const email = String(form.get("email") ?? "").trim().toLowerCase();
    const phone = String(form.get("phone") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const confirm = String(form.get("confirm") ?? "");

    if (fullName.length < 2) return setError("Enter your full name.");
    if (!email.includes("@")) return setError("Enter a valid email address.");
    if (phone.replace(/\D/g, "").length < 10) return setError("Enter a valid Nigerian phone number.");
    if (password.length < 8) return setError("Password must be at least 8 characters.");
    if (password !== confirm) return setError("Passwords do not match.");

    setBusy(true);
    try {
      const user = await register({
        fullName,
        email,
        phone,
        password,
        role,
        ...(role === "ORGANIZER"
          ? {
              organizationName: String(form.get("organizationName") ?? "").trim(),
              businessEmail: String(form.get("businessEmail") ?? "").trim(),
              businessPhone: String(form.get("businessPhone") ?? "").trim(),
            }
          : {}),
      });
      toast.success("Account created. Welcome to EventPass.");
      await navigate({ to: user.role === "ORGANIZER" ? "/organizer" : "/dashboard" });
    } catch {
      setError("We could not create your account. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Choose how you want to use EventPass. You can attend events or sell tickets."
      footer={
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-brand-red hover:underline">
            Sign in
          </Link>
        </p>
      }
    >
      <Tabs value={role} onValueChange={(value) => setRole(value as Role)}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="ATTENDEE">Attendee</TabsTrigger>
          <TabsTrigger value="ORGANIZER">Organizer</TabsTrigger>
        </TabsList>
      </Tabs>

      <form onSubmit={onSubmit} className="mt-5 space-y-4">
        <Field id="fullName" label="Full name" autoComplete="name" />
        <Field id="email" label="Email address" type="email" autoComplete="email" />
        <Field id="phone" label="Phone number" type="tel" autoComplete="tel" placeholder="080 0000 0000" />
        {role === "ORGANIZER" && (
          <>
            <Field id="organizationName" label="Organization name" />
            <Field id="businessEmail" label="Business email" type="email" />
            <Field id="businessPhone" label="Business phone" type="tel" />
          </>
        )}
        <Field id="password" label="Password" type="password" autoComplete="new-password" />
        <Field id="confirm" label="Confirm password" type="password" autoComplete="new-password" />
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" size="lg" disabled={busy} className="w-full bg-gradient-brand text-primary-foreground">
          {busy ? "Creating account…" : `Create ${role === "ORGANIZER" ? "organizer" : "attendee"} account`}
        </Button>
        <p className="text-xs text-muted-foreground">
          Administrator access is granted internally and can never be selected during registration.
        </p>
      </form>
    </AuthShell>
  );
}

function Field({
  id,
  label,
  type = "text",
  autoComplete,
  placeholder,
}: {
  id: string;
  label: string;
  type?: string;
  autoComplete?: string;
  placeholder?: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} name={id} type={type} autoComplete={autoComplete} placeholder={placeholder} required />
    </div>
  );
}
