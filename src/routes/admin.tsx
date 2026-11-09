import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  LayoutDashboard,
  Minus,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Users,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/brand/Logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CATEGORIES } from "@/lib/data";
import { useAuth } from "@/lib/auth/auth-context";
import { formatEventDate, formatNaira } from "@/lib/format";

type Section = "overview" | "users" | "events" | "payments";
type AdminData = Record<string, unknown>;

interface OrganizerConsoleData {
  organizer: Record<string, unknown>;
  events: Array<Record<string, unknown>>;
  summary: {
    totalEvents: number;
    publishedEvents: number;
    ticketsSold: number;
    ticketCapacity: number;
  };
}

interface AttendeeConsoleData {
  attendee: Record<string, unknown>;
  walletAdjustments: Array<Record<string, unknown>>;
}

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
  const [page, setPage] = useState(1);
  const [userSearch, setUserSearch] = useState("");
  const [debouncedUserSearch, setDebouncedUserSearch] = useState("");
  const sectionSearch = section === "users" ? debouncedUserSearch : "";
  const sectionData = data?.section === section ? data.value : {};
  const loading = busy || (!error && data?.section !== section);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedUserSearch(userSearch.trim()), 250);
    return () => window.clearTimeout(timer);
  }, [userSearch]);

  useEffect(() => {
    let active = true;
    setBusy(true);
    setError(null);
    const params = new URLSearchParams({ section });
    if (section === "users" || section === "events" || section === "payments") {
      params.set("page", String(page));
    }
    if (sectionSearch) params.set("q", sectionSearch);
    void fetch(`/api/admin?${params.toString()}`, { credentials: "same-origin" })
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
  }, [revision, section, page, sectionSearch]);

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

  async function adjustWallet(
    id: string,
    operation: "CREDIT" | "DEBIT",
    amount: number,
    note: string,
  ) {
    const response = await fetch("/api/admin", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ resource: "wallet", id, operation, amount, note }),
    });
    const result = (await response.json()) as { error?: string };
    if (!response.ok) throw new Error(result.error || "The wallet adjustment could not be saved.");
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
              setPage(1);
              setUserSearch("");
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
          searchValue={userSearch}
          onSearchChange={(value) => {
            setPage(1);
            setUserSearch(value);
          }}
          onWalletAdjustment={(id, operation, amount, note) =>
            adjustWallet(id, operation, amount, note)
          }
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
      {!loading &&
        !error &&
        (section === "users" || section === "events" || section === "payments") && (
          <Pagination data={sectionData} onPageChange={setPage} />
        )}
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
  searchValue,
  onSearchChange,
  onWalletAdjustment,
  onStatusChange,
}: {
  data: AdminData;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onWalletAdjustment: (
    id: string,
    operation: "CREDIT" | "DEBIT",
    amount: number,
    note: string,
  ) => Promise<void>;
  onStatusChange: (id: string, status: string) => void;
}) {
  const users = (data["users"] ?? []) as Array<Record<string, unknown>>;
  const [adjustment, setAdjustment] = useState<{
    user: Record<string, unknown>;
    operation: "CREDIT" | "DEBIT";
  } | null>(null);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [selectedOrganizer, setSelectedOrganizer] = useState<Record<string, unknown> | null>(null);
  const [organizerConsole, setOrganizerConsole] = useState<OrganizerConsoleData | null>(null);
  const [organizerLoading, setOrganizerLoading] = useState(false);
  const [organizerError, setOrganizerError] = useState<string | null>(null);
  const [selectedAttendee, setSelectedAttendee] = useState<Record<string, unknown> | null>(null);
  const [attendeeConsole, setAttendeeConsole] = useState<AttendeeConsoleData | null>(null);
  const [attendeeLoading, setAttendeeLoading] = useState(false);
  const [attendeeError, setAttendeeError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedOrganizer) return;
    let active = true;
    setOrganizerConsole(null);
    setOrganizerError(null);
    setOrganizerLoading(true);
    const organizerId = String(selectedOrganizer["_id"] ?? "");
    void fetch(`/api/admin?section=organizer&id=${encodeURIComponent(organizerId)}`, {
      credentials: "same-origin",
    })
      .then(async (response) => {
        const result = (await response.json()) as OrganizerConsoleData & { error?: string };
        if (!response.ok) throw new Error(result.error || "Could not load organizer details.");
        return result;
      })
      .then((result) => {
        if (active) setOrganizerConsole(result);
      })
      .catch((cause: unknown) => {
        if (active)
          setOrganizerError(
            cause instanceof Error ? cause.message : "Could not load organizer details.",
          );
      })
      .finally(() => {
        if (active) setOrganizerLoading(false);
      });
    return () => {
      active = false;
    };
  }, [selectedOrganizer]);

  useEffect(() => {
    if (!selectedAttendee) return;
    let active = true;
    setAttendeeConsole(null);
    setAttendeeError(null);
    setAttendeeLoading(true);
    const attendeeId = String(selectedAttendee["_id"] ?? "");
    void fetch(`/api/admin?section=attendee&id=${encodeURIComponent(attendeeId)}`, {
      credentials: "same-origin",
    })
      .then(async (response) => {
        const result = (await response.json()) as AttendeeConsoleData & { error?: string };
        if (!response.ok) throw new Error(result.error || "Could not load attendee details.");
        return result;
      })
      .then((result) => {
        if (active) setAttendeeConsole(result);
      })
      .catch((cause: unknown) => {
        if (active)
          setAttendeeError(
            cause instanceof Error ? cause.message : "Could not load attendee details.",
          );
      })
      .finally(() => {
        if (active) setAttendeeLoading(false);
      });
    return () => {
      active = false;
    };
  }, [selectedAttendee]);

  function openAdjustment(user: Record<string, unknown>, operation: "CREDIT" | "DEBIT") {
    setAmount("");
    setNote("");
    setAdjustment({ user, operation });
  }

  async function submitAdjustment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!adjustment) return;
    setSaving(true);
    try {
      await onWalletAdjustment(
        String(adjustment.user["_id"]),
        adjustment.operation,
        Number(amount),
        note,
      );
      toast.success(adjustment.operation === "CREDIT" ? "Funds added" : "Funds subtracted");
      setAdjustment(null);
      setAmount("");
      setNote("");
    } catch (cause) {
      toast.error(
        cause instanceof Error ? cause.message : "The wallet adjustment could not be saved.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full max-w-md">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            aria-label="Search users by name or email"
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search users by name or email"
            className="pl-9"
          />
        </div>
        <p className="text-sm text-muted-foreground">{Number(data["total"] ?? 0)} users</p>
      </div>
      <DataTable headers={["Name", "Email", "Wallet balance", "Role", "Status", "Action"]}>
        {users.map((item) => (
          <tr key={String(item["_id"])}>
            <td className="px-3 py-3 font-medium">{String(item["fullName"] ?? "")}</td>
            <td className="px-3 py-3">
              <div className="flex min-w-[220px] items-center gap-1.5">
                <span className="truncate">{String(item["email"] ?? "")}</span>
                {item["role"] !== "ADMIN" && (
                  <>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="size-7 shrink-0 text-brand-blue"
                      aria-label={`Add funds to ${String(item["email"] ?? "user")}`}
                      title="Add funds"
                      onClick={() => openAdjustment(item, "CREDIT")}
                    >
                      <Plus />
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="size-7 shrink-0 text-destructive"
                      aria-label={`Subtract funds from ${String(item["email"] ?? "user")}`}
                      title="Subtract funds"
                      onClick={() => openAdjustment(item, "DEBIT")}
                    >
                      <Minus />
                    </Button>
                  </>
                )}
                {item["role"] === "ORGANIZER" && (
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="size-7 shrink-0"
                    aria-label={`View organizer console for ${String(item["fullName"] ?? "organizer")}`}
                    title="View organizer console"
                    onClick={() => setSelectedOrganizer(item)}
                  >
                    <LayoutDashboard />
                  </Button>
                )}
                {item["role"] === "ATTENDEE" && (
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="size-7 shrink-0"
                    aria-label={`View attendee dashboard for ${String(item["fullName"] ?? "attendee")}`}
                    title="View attendee dashboard"
                    onClick={() => setSelectedAttendee(item)}
                  >
                    <UserRound />
                  </Button>
                )}
              </div>
            </td>
            <td className="px-3 py-3 tabular-nums">
              {formatNaira(Number(item["walletBalance"] ?? 0))}
            </td>
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
      {users.length === 0 && (
        <p className="py-8 text-center text-sm text-muted-foreground">
          {searchValue ? "No users match that search." : "No users found."}
        </p>
      )}
      <Dialog
        open={adjustment !== null}
        onOpenChange={(open) => {
          if (!open && !saving) setAdjustment(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {adjustment?.operation === "CREDIT" ? "Add funds" : "Subtract funds"}
            </DialogTitle>
            <DialogDescription>
              {adjustment?.user["email"] ? String(adjustment.user["email"]) : "Select a user"} ·
              Current balance
              {formatNaira(Number(adjustment?.user["walletBalance"] ?? 0))}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(event) => void submitAdjustment(event)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="wallet-adjustment-amount">Amount (₦)</Label>
              <Input
                id="wallet-adjustment-amount"
                type="number"
                min={1}
                max={100_000_000}
                step={1}
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="wallet-adjustment-note">Reason for adjustment</Label>
              <Input
                id="wallet-adjustment-note"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                maxLength={200}
                required
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={saving}
                onClick={() => setAdjustment(null)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving
                  ? "Saving…"
                  : adjustment?.operation === "CREDIT"
                    ? "Add funds"
                    : "Subtract funds"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog
        open={selectedOrganizer !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedOrganizer(null);
        }}
      >
        <DialogContent className="max-h-[90vh] max-w-5xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Organizer console</DialogTitle>
            <DialogDescription>
              {String(selectedOrganizer?.["fullName"] ?? "Organizer")} ·{" "}
              {String(selectedOrganizer?.["email"] ?? "")}
            </DialogDescription>
          </DialogHeader>
          {organizerLoading && (
            <p className="py-8 text-sm text-muted-foreground">Loading organizer details…</p>
          )}
          {organizerError && (
            <p role="alert" className="py-4 text-sm text-destructive">
              {organizerError}
            </p>
          )}
          {organizerConsole && <OrganizerConsoleView data={organizerConsole} />}
        </DialogContent>
      </Dialog>
      <Dialog
        open={selectedAttendee !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedAttendee(null);
        }}
      >
        <DialogContent className="max-h-[90vh] max-w-5xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>My EventPass</DialogTitle>
            <DialogDescription>
              {String(selectedAttendee?.["fullName"] ?? "Attendee")} ·{" "}
              {String(selectedAttendee?.["email"] ?? "")}
            </DialogDescription>
          </DialogHeader>
          {attendeeLoading && (
            <p className="py-8 text-sm text-muted-foreground">Loading attendee details…</p>
          )}
          {attendeeError && (
            <p role="alert" className="py-4 text-sm text-destructive">
              {attendeeError}
            </p>
          )}
          {attendeeConsole && <AttendeeConsoleView data={attendeeConsole} />}
        </DialogContent>
      </Dialog>
    </>
  );
}

function AttendeeConsoleView({ data }: { data: AttendeeConsoleData }) {
  const attendee = data.attendee;
  const adjustments = data.walletAdjustments;
  const balance = Number(attendee["walletBalance"] ?? 0);

  return (
    <Tabs defaultValue="overview">
      <TabsList className="flex h-auto w-full justify-start gap-1 overflow-x-auto">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="tickets">My Tickets</TabsTrigger>
        <TabsTrigger value="invitations">Invitations</TabsTrigger>
        <TabsTrigger value="wallet">Wallet</TabsTrigger>
        <TabsTrigger value="membership">TicketPass</TabsTrigger>
        <TabsTrigger value="transactions">Transactions</TabsTrigger>
        <TabsTrigger value="profile">Profile</TabsTrigger>
      </TabsList>
      <TabsContent value="overview" className="space-y-4 pt-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <AttendeeMetric label="Account status" value={String(attendee["status"] ?? "Unknown")} />
          <AttendeeMetric label="Wallet balance" value={formatNaira(balance)} />
          <AttendeeMetric label="Admin wallet adjustments" value={String(adjustments.length)} />
        </div>
        <AttendeeProfile attendee={attendee} />
        <AttendeeEmptyState>
          Ticket, invitation, and membership activity is not stored for this account yet.
        </AttendeeEmptyState>
      </TabsContent>
      <TabsContent value="tickets" className="pt-4">
        <AttendeeEmptyState>No ticket records are stored for this account yet.</AttendeeEmptyState>
      </TabsContent>
      <TabsContent value="invitations" className="pt-4">
        <AttendeeEmptyState>
          Invitation records are unavailable until the invitation service is connected.
        </AttendeeEmptyState>
      </TabsContent>
      <TabsContent value="wallet" className="space-y-3 pt-4">
        <div className="rounded-md border p-4">
          <p className="text-xs text-muted-foreground">Available balance</p>
          <p className="mt-1 text-2xl font-bold tabular-nums">{formatNaira(balance)}</p>
        </div>
        <p className="text-sm font-semibold">Admin adjustments</p>
        <WalletAdjustmentList adjustments={adjustments} />
      </TabsContent>
      <TabsContent value="membership" className="pt-4">
        <AttendeeEmptyState>
          TicketPass membership status and credentials are not stored in the account database.
        </AttendeeEmptyState>
      </TabsContent>
      <TabsContent value="transactions" className="space-y-3 pt-4">
        <WalletAdjustmentList adjustments={adjustments} />
        <p className="text-xs text-muted-foreground">
          Payment transaction history is unavailable until payments are connected.
        </p>
      </TabsContent>
      <TabsContent value="profile" className="pt-4">
        <AttendeeProfile attendee={attendee} detailed />
      </TabsContent>
    </Tabs>
  );
}

function AttendeeMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-l-2 border-brand-red py-2 pl-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-base font-semibold tabular-nums">{value}</p>
    </div>
  );
}

function AttendeeProfile({
  attendee,
  detailed = false,
}: {
  attendee: Record<string, unknown>;
  detailed?: boolean;
}) {
  const createdAt = attendee["createdAt"] ? new Date(String(attendee["createdAt"])) : null;

  return (
    <div className="grid gap-3 rounded-md border p-4 text-sm sm:grid-cols-2">
      <AttendeeDetail label="Full name" value={String(attendee["fullName"] ?? "Not provided")} />
      <AttendeeDetail label="Email" value={String(attendee["email"] ?? "Not provided")} />
      <AttendeeDetail label="Phone" value={String(attendee["phone"] ?? "Not provided")} />
      <AttendeeDetail label="Account status" value={String(attendee["status"] ?? "Unknown")} />
      {detailed && (
        <AttendeeDetail
          label="Account created"
          value={
            createdAt && !Number.isNaN(createdAt.getTime())
              ? createdAt.toLocaleDateString("en-NG")
              : "Unknown"
          }
        />
      )}
    </div>
  );
}

function AttendeeDetail({ label, value }: { label: string; value: string }) {
  return (
    <p className="min-w-0 break-words">
      <span className="text-muted-foreground">{label}: </span>
      {value}
    </p>
  );
}

function WalletAdjustmentList({ adjustments }: { adjustments: Array<Record<string, unknown>> }) {
  if (adjustments.length === 0) {
    return <AttendeeEmptyState>No admin wallet adjustments recorded.</AttendeeEmptyState>;
  }

  return (
    <div className="divide-y rounded-md border">
      {adjustments.map((adjustment) => (
        <div key={String(adjustment["id"])} className="grid gap-1 p-3 sm:grid-cols-[1fr_auto]">
          <div>
            <p className="text-sm font-medium">
              {String(adjustment["note"] ?? "Wallet adjustment")}
            </p>
            <p className="text-xs text-muted-foreground">
              {String(adjustment["operation"] ?? "")} · {String(adjustment["createdAt"] ?? "")}
            </p>
          </div>
          <p className="font-semibold tabular-nums">
            {adjustment["operation"] === "DEBIT" ? "−" : "+"}
            {formatNaira(Number(adjustment["amount"] ?? 0))}
          </p>
        </div>
      ))}
    </div>
  );
}

function AttendeeEmptyState({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
      {children}
    </p>
  );
}

function OrganizerConsoleView({ data }: { data: OrganizerConsoleData }) {
  const events = data.events;
  const seatedEvents = events.filter((event) => Boolean(event["seatingEnabled"]));

  return (
    <Tabs defaultValue="overview">
      <TabsList className="grid h-auto w-full grid-cols-3 gap-1 md:grid-cols-6">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="events">My Events</TabsTrigger>
        <TabsTrigger value="attendees">Attendees</TabsTrigger>
        <TabsTrigger value="seating">Seating</TabsTrigger>
        <TabsTrigger value="check-in">Check-in</TabsTrigger>
        <TabsTrigger value="revenue">Revenue</TabsTrigger>
      </TabsList>
      <TabsContent value="overview" className="space-y-5 pt-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <OrganizerMetric label="Total events" value={data.summary.totalEvents} />
          <OrganizerMetric label="Published events" value={data.summary.publishedEvents} />
          <OrganizerMetric label="Tickets sold" value={data.summary.ticketsSold} />
          <OrganizerMetric label="Ticket capacity" value={data.summary.ticketCapacity} />
        </div>
        <OrganizerProfile organizer={data.organizer} />
        <section>
          <h3 className="mb-3 text-sm font-semibold">Recent events</h3>
          {events.slice(0, 3).map((event) => (
            <OrganizerEventSummary key={String(event["_id"])} event={event} />
          ))}
          {events.length === 0 && <OrganizerEmptyState>No events created yet.</OrganizerEmptyState>}
        </section>
      </TabsContent>
      <TabsContent value="events" className="space-y-3 pt-4">
        {events.map((event) => (
          <OrganizerEventSummary key={String(event["_id"])} event={event} detailed />
        ))}
        {events.length === 0 && <OrganizerEmptyState>No events created yet.</OrganizerEmptyState>}
      </TabsContent>
      <TabsContent value="attendees" className="pt-4">
        <OrganizerEmptyState>
          Attendee records are unavailable until verified ticket issuance is connected.
        </OrganizerEmptyState>
      </TabsContent>
      <TabsContent value="seating" className="space-y-3 pt-4">
        {seatedEvents.map((event) => (
          <div key={String(event["_id"])} className="rounded-md border p-3">
            <p className="font-medium">{String(event["name"] ?? "Untitled event")}</p>
            <p className="mt-1 text-sm text-muted-foreground">No seat assignments recorded.</p>
          </div>
        ))}
        {seatedEvents.length === 0 && (
          <OrganizerEmptyState>No seating-enabled events were submitted.</OrganizerEmptyState>
        )}
      </TabsContent>
      <TabsContent value="check-in" className="pt-4">
        <OrganizerEmptyState>
          Check-in records are unavailable until ticket validation is connected.
        </OrganizerEmptyState>
      </TabsContent>
      <TabsContent value="revenue" className="pt-4">
        <OrganizerEmptyState>
          Verified payment records are unavailable, so revenue cannot be reported yet.
        </OrganizerEmptyState>
      </TabsContent>
    </Tabs>
  );
}

function OrganizerMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="border-l-2 border-brand-red py-2 pl-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-xl font-bold tabular-nums">{value.toLocaleString("en-NG")}</p>
    </div>
  );
}

function OrganizerProfile({ organizer }: { organizer: Record<string, unknown> }) {
  return (
    <div className="grid gap-3 rounded-md border p-3 text-sm sm:grid-cols-2">
      <p>
        <span className="text-muted-foreground">Organization: </span>
        {String(organizer["organizationName"] ?? "Not provided")}
      </p>
      <p>
        <span className="text-muted-foreground">Account status: </span>
        {String(organizer["status"] ?? "Unknown")}
      </p>
      <p>
        <span className="text-muted-foreground">Email: </span>
        {String(organizer["email"] ?? "")}
      </p>
      <p>
        <span className="text-muted-foreground">Wallet balance: </span>
        {formatNaira(Number(organizer["walletBalance"] ?? 0))}
      </p>
    </div>
  );
}

function OrganizerEventSummary({
  event,
  detailed = false,
}: {
  event: Record<string, unknown>;
  detailed?: boolean;
}) {
  const ticketTypes = Array.isArray(event["ticketTypes"])
    ? (event["ticketTypes"] as Array<Record<string, unknown>>)
    : [];
  const ticketsSold = ticketTypes.reduce((total, ticket) => total + Number(ticket["sold"] ?? 0), 0);
  const capacity = ticketTypes.reduce(
    (total, ticket) => total + Number(ticket["quantity"] ?? 0),
    0,
  );
  const date = String(event["date"] ?? "");

  return (
    <article className="grid gap-3 rounded-md border p-3 sm:grid-cols-[minmax(0,1fr)_auto]">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h4 className="font-semibold">{String(event["name"] ?? "Untitled event")}</h4>
          <Badge variant="outline">{String(event["status"] ?? "DRAFT")}</Badge>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          {date ? formatEventDate(date) : "Date not set"} ·{" "}
          {String(event["time"] ?? "Time not set")} · {String(event["venue"] ?? "Venue not set")},{" "}
          {String(event["city"] ?? "City not set")}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {ticketsSold.toLocaleString("en-NG")} sold · {capacity.toLocaleString("en-NG")} total
          capacity
        </p>
        {detailed && (
          <>
            <p className="mt-2 text-sm text-muted-foreground">
              {String(event["description"] ?? "No description")}
            </p>
            <div className="mt-3 space-y-1">
              {ticketTypes.map((ticket, index) => (
                <p key={String(ticket["id"] ?? index)} className="text-xs">
                  {String(ticket["name"] ?? "Ticket")} · {formatNaira(Number(ticket["price"] ?? 0))}{" "}
                  · {Number(ticket["quantity"] ?? 0).toLocaleString("en-NG")} capacity ·{" "}
                  {Number(ticket["sold"] ?? 0).toLocaleString("en-NG")} sold
                </p>
              ))}
              {ticketTypes.length === 0 && (
                <p className="text-xs text-muted-foreground">No ticket types recorded.</p>
              )}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge variant="secondary">
                TicketPass {event["acceptsTicketPass"] ? "accepted" : "not accepted"}
              </Badge>
              <Badge variant="secondary">
                Seating {event["seatingEnabled"] ? "enabled" : "disabled"}
              </Badge>
              <Badge variant="secondary">Presale {event["presale"] ? "enabled" : "disabled"}</Badge>
            </div>
          </>
        )}
      </div>
      {event["image"] && detailed && (
        <img
          src={String(event["image"])}
          alt={String(event["name"] ?? "Event")}
          className="max-h-36 w-full rounded-sm object-cover sm:w-48"
        />
      )}
    </article>
  );
}

function OrganizerEmptyState({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
      {children}
    </p>
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
  const [selectedEvent, setSelectedEvent] = useState<Record<string, unknown> | null>(null);
  return (
    <>
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
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => setSelectedEvent(item)}>
                  Overview
                </Button>
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
              </div>
            </td>
          </tr>
        ))}
      </DataTable>
      <Dialog
        open={selectedEvent !== null}
        onOpenChange={(open) => !open && setSelectedEvent(null)}
      >
        <DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto">
          {selectedEvent && <EventOverview event={selectedEvent} />}
        </DialogContent>
      </Dialog>
    </>
  );
}

function EventOverview({ event }: { event: Record<string, unknown> }) {
  const ticketTypes = Array.isArray(event["ticketTypes"])
    ? (event["ticketTypes"] as Array<Record<string, unknown>>)
    : [];
  const payoutDetails =
    event["payoutDetails"] && typeof event["payoutDetails"] === "object"
      ? (event["payoutDetails"] as Record<string, unknown>)
      : {};
  const category = CATEGORIES.find((item) => item.slug === event["category"]);
  const image = String(event["image"] ?? "");
  const value = (key: string) => String(event[key] ?? "Not provided");

  return (
    <>
      <DialogHeader>
        <DialogTitle>Event overview</DialogTitle>
        <DialogDescription>
          {value("name")} · {value("ownerEmail")}
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-6 text-sm">
        <section className="space-y-3">
          <h3 className="font-semibold">Event details</h3>
          {image ? (
            <img
              src={image}
              alt={value("name")}
              className="max-h-64 w-full rounded-md object-cover"
            />
          ) : (
            <p className="text-muted-foreground">No event image provided.</p>
          )}
          <div className="grid gap-3 sm:grid-cols-2">
            <EventDetail label="Event name" value={value("name")} />
            <EventDetail label="Category" value={category?.name ?? value("category")} />
            <EventDetail
              label="Date and start time"
              value={`${event["date"] ? formatEventDate(String(event["date"])) : "Not provided"} · ${value("time")}`}
            />
            <EventDetail label="Venue" value={value("venue")} />
            <EventDetail label="City" value={value("city")} />
            <EventDetail label="Status" value={value("status")} />
            <EventDetail
              label="Description"
              value={value("description")}
              className="sm:col-span-2"
            />
          </div>
        </section>
        <section className="space-y-3">
          <h3 className="font-semibold">Ticket types</h3>
          {ticketTypes.length ? (
            <div className="divide-y rounded-md border">
              {ticketTypes.map((ticket, index) => (
                <div key={String(ticket["id"] ?? index)} className="grid gap-2 p-3 sm:grid-cols-3">
                  <EventDetail label="Ticket" value={String(ticket["name"] ?? "Not provided")} />
                  <EventDetail label="Price" value={formatNaira(Number(ticket["price"] ?? 0))} />
                  <EventDetail
                    label="Quantity"
                    value={String(ticket["quantity"] ?? "Not provided")}
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No ticket types provided.</p>
          )}
        </section>
        <section className="space-y-3">
          <h3 className="font-semibold">Event options</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <EventDetail
              label="Accepts TicketPass members"
              value={event["acceptsTicketPass"] ? "Yes" : "No"}
            />
            <EventDetail label="Seating enabled" value={event["seatingEnabled"] ? "Yes" : "No"} />
            <EventDetail
              label="Presale sponsorship campaign"
              value={event["presale"] ? "Yes" : "No"}
            />
          </div>
        </section>
        <section className="space-y-3">
          <h3 className="font-semibold">Payout details</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <EventDetail
              label="Bank name"
              value={String(payoutDetails["bankName"] ?? "Not provided")}
            />
            <EventDetail
              label="Account number"
              value={String(payoutDetails["accountNumber"] ?? "Not provided")}
            />
          </div>
        </section>
      </div>
    </>
  );
}

function EventDetail({
  label,
  value,
  className = "",
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="whitespace-pre-wrap break-words">{value}</p>
    </div>
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

function Pagination({
  data,
  onPageChange,
}: {
  data: AdminData;
  onPageChange: (page: number) => void;
}) {
  const page = Number(data["page"] ?? 1);
  const pageSize = Number(data["pageSize"] ?? 20);
  const total = Number(data["total"] ?? 0);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const firstItem = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const lastItem = Math.min(page * pageSize, total);

  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-muted-foreground">
        Showing {firstItem}–{lastItem} of {total}
      </p>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          aria-label="Previous page"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="size-4" /> Previous
        </Button>
        <span className="min-w-20 text-center text-sm tabular-nums">
          {page} / {totalPages}
        </span>
        <Button
          type="button"
          size="sm"
          variant="outline"
          aria-label="Next page"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
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
