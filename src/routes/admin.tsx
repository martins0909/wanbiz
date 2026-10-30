import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CalendarDays, CreditCard, RefreshCw, ShieldCheck, Users } from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/brand/Logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth/auth-context";
import { formatNaira } from "@/lib/format";

type Section = "overview" | "users" | "events" | "payments";
type AdminData = Record<string, unknown>;

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — Wanbiz EventPass" }] }),
  component: AdminPage,
});

function AdminPage() {
  const { user, isLoading } = useAuth();
  if (isLoading)
    return <p className="mx-auto max-w-7xl px-4 py-12 text-sm text-muted-foreground">Loading…</p>;
  return user?.role === "ADMIN" ? <AdminDashboard user={user} /> : <AdminLogin />;
}

function AdminLogin() {
  const { login, logout, user } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const form = new FormData(event.currentTarget);
    try {
      if (user) await logout();
      const account = await login(
        String(form.get("email") ?? ""),
        String(form.get("password") ?? ""),
      );
      if (account.role !== "ADMIN") {
        await logout();
        throw new Error("This account does not have administrator access.");
      }
      toast.success("Administrator signed in");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "We could not sign you in.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md px-4 py-16">
      <div className="flex justify-center">
        <Logo />
      </div>
      <section className="mt-8 rounded-lg border border-border bg-card p-6 sm:p-8">
        <h1 className="text-2xl font-bold">Administrator sign in</h1>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="admin-email">Admin email</Label>
            <Input id="admin-email" name="email" type="email" autoComplete="username" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="admin-password">Password</Label>
            <Input
              id="admin-password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" disabled={busy} className="w-full">
            {busy ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </section>
    </div>
  );
}

function AdminDashboard({ user }: { user: NonNullable<ReturnType<typeof useAuth>["user"]> }) {
  const { logout } = useAuth();
  const [section, setSection] = useState<Section>("overview");
  const [data, setData] = useState<{ section: Section; value: AdminData } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [revision, setRevision] = useState(0);
  const sectionData = data?.section === section ? data.value : {};
  const loading = busy || (!error && data?.section !== section);

  useEffect(() => {
    let active = true;
    setBusy(true);
    setError(null);
    void fetch(`/api/admin?section=${section}`, { credentials: "same-origin" })
      .then(async (response) => {
        const result = (await response.json()) as AdminData & { error?: string };
        if (!response.ok) throw new Error(result.error || "Could not load admin data.");
        return result;
      })
      .then((result) => {
        if (active) setData({ section, value: result });
      })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : "Could not load admin data.");
      })
      .finally(() => {
        if (active) setBusy(false);
      });
    return () => {
      active = false;
    };
  }, [revision, section]);

  async function changeStatus(resource: "user" | "event", id: string, status: string) {
    const response = await fetch("/api/admin", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ resource, id, status }),
    });
    const result = (await response.json()) as { error?: string };
    if (!response.ok) throw new Error(result.error || "The change could not be saved.");
    setRevision((current) => current + 1);
  }

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5">
        <div className="flex items-center gap-3">
          <ShieldCheck className="size-6 text-brand-red" />
          <div>
            <h1 className="text-xl font-bold">Admin dashboard</h1>
            <p className="text-sm text-muted-foreground">Signed in as {user.email}</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => void logout()}>
          Sign out
        </Button>
      </div>

      <nav
        className="flex gap-1 overflow-x-auto border-b border-border py-3"
        aria-label="Admin sections"
      >
        {(
          [
            ["overview", "Overview", ShieldCheck],
            ["users", "Users", Users],
            ["events", "Events", CalendarDays],
            ["payments", "Payments", CreditCard],
          ] as const
        ).map(([id, label, Icon]) => (
          <button
            key={id}
            type="button"
            onClick={() => {
              setError(null);
              setSection(id);
            }}
            aria-current={section === id ? "page" : undefined}
            className={`inline-flex min-h-10 items-center gap-2 border-b-2 px-3 text-sm font-medium ${section === id ? "border-brand-red text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            <Icon className="size-4" />
            {label}
          </button>
        ))}
        <Button
          variant="ghost"
          size="icon"
          className="ml-auto shrink-0"
          aria-label="Refresh dashboard"
          title="Refresh dashboard"
          onClick={() => setRevision((current) => current + 1)}
        >
          <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </nav>

      {error && (
        <p role="alert" className="mt-5 text-sm text-destructive">
          {error}
        </p>
      )}
      {loading && <p className="py-8 text-sm text-muted-foreground">Loading…</p>}
      {!loading && !error && section === "overview" && <Overview data={sectionData} />}
      {!loading && !error && section === "users" && (
        <UsersTable
          data={sectionData}
          onStatusChange={(id, status) => void changeStatus("user", id, status).catch(setError)}
        />
      )}
      {!loading && !error && section === "events" && (
        <EventsTable
          data={sectionData}
          onStatusChange={(id, status) => void changeStatus("event", id, status).catch(setError)}
        />
      )}
      {!loading && !error && section === "payments" && <PaymentsTable data={sectionData} />}
    </section>
  );
}

function Overview({ data }: { data: AdminData }) {
  const metrics = [
    ["Users", data["users"] ?? 0, Users],
    ["Events", data["events"] ?? 0, CalendarDays],
    ["Payments", data["payments"] ?? 0, CreditCard],
    ["Successful payments", data["paidPayments"] ?? 0, ShieldCheck],
  ] as const;
  return (
    <div className="grid gap-6 py-6 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map(([label, value, Icon]) => (
        <div key={label} className="border-l-2 border-brand-red py-2 pl-4">
          <Icon className="size-5 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold tabular-nums">{String(value)}</p>
        </div>
      ))}
    </div>
  );
}

function UsersTable({
  data,
  onStatusChange,
}: {
  data: AdminData;
  onStatusChange: (id: string, status: string) => void;
}) {
  const users = (data["users"] ?? []) as Array<Record<string, unknown>>;
  return (
    <DataTable headers={["Name", "Email", "Role", "Status", "Action"]}>
      {users.map((item) => (
        <tr key={String(item["_id"])}>
          <td className="px-3 py-3 font-medium">{String(item["fullName"] ?? "")}</td>
          <td className="px-3 py-3">{String(item["email"] ?? "")}</td>
          <td className="px-3 py-3">{String(item["role"] ?? "")}</td>
          <td className="px-3 py-3">
            <Badge variant="outline">{String(item["status"] ?? "ACTIVE")}</Badge>
          </td>
          <td className="px-3 py-3">
            {item["role"] !== "ADMIN" && (
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  onStatusChange(
                    String(item["_id"]),
                    item["status"] === "SUSPENDED" ? "ACTIVE" : "SUSPENDED",
                  )
                }
              >
                {item["status"] === "SUSPENDED" ? "Reactivate" : "Suspend"}
              </Button>
            )}
          </td>
        </tr>
      ))}
    </DataTable>
  );
}

function EventsTable({
  data,
  onStatusChange,
}: {
  data: AdminData;
  onStatusChange: (id: string, status: string) => void;
}) {
  const events = (data["events"] ?? []) as Array<Record<string, unknown>>;
  return (
    <DataTable headers={["Event", "Organizer", "Date", "Status", "Action"]}>
      {events.map((item) => (
        <tr key={String(item["_id"])}>
          <td className="px-3 py-3 font-medium">{String(item["name"] ?? "")}</td>
          <td className="px-3 py-3">{String(item["ownerEmail"] ?? "")}</td>
          <td className="px-3 py-3">{String(item["date"] ?? "")}</td>
          <td className="px-3 py-3">
            <Badge variant="outline">{String(item["status"] ?? "DRAFT")}</Badge>
          </td>
          <td className="px-3 py-3">
            {item["status"] !== "CANCELLED" && (
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  onStatusChange(
                    String(item["_id"]),
                    item["status"] === "PUBLISHED" ? "DRAFT" : "PUBLISHED",
                  )
                }
              >
                {item["status"] === "PUBLISHED" ? "Unpublish" : "Publish"}
              </Button>
            )}
          </td>
        </tr>
      ))}
    </DataTable>
  );
}

function PaymentsTable({ data }: { data: AdminData }) {
  const payments = (data["payments"] ?? []) as Array<Record<string, unknown>>;
  return (
    <DataTable headers={["Reference", "Amount", "Status", "Paid at"]}>
      {payments.map((item) => (
        <tr key={String(item["_id"])}>
          <td className="px-3 py-3 font-mono text-xs">
            {String(item["transaction_reference"] ?? item["reference"] ?? item["_id"])}
          </td>
          <td className="px-3 py-3">{formatNaira(Number(item["amount"] ?? 0))}</td>
          <td className="px-3 py-3">
            <Badge variant="outline">{String(item["status"] ?? "UNKNOWN")}</Badge>
          </td>
          <td className="px-3 py-3">{String(item["paid_at"] ?? item["createdAt"] ?? "")}</td>
        </tr>
      ))}
    </DataTable>
  );
}

function DataTable({ headers, children }: { headers: string[]; children: React.ReactNode }) {
  return (
    <div className="mt-5 overflow-x-auto">
      <table className="w-full min-w-[720px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-border text-xs text-muted-foreground">
            {headers.map((header) => (
              <th key={header} className="px-3 py-2 font-medium">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">{children}</tbody>
      </table>
    </div>
  );
}
