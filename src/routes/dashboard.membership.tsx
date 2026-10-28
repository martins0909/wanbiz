import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { QrPlaceholder } from "@/components/shared/QrPlaceholder";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { membershipQuery } from "@/lib/data";
import { formatNaira, formatShortDate } from "@/lib/format";
import { notifyPaymentsComingSoon } from "@/lib/payments/notify";
import { useAuth } from "@/lib/auth/auth-context";

export const Route = createFileRoute("/dashboard/membership")({
  head: () => ({
    meta: [
      { title: "My TicketPass — Wanbiz EventPass" },
      { name: "description", content: "Your permanent EventPass TicketPass membership card, membership ID and QR credential." },
      { property: "og:title", content: "My EventPass TicketPass" },
      { property: "og:description", content: "Permanent membership card, ID and QR credential." },
    ],
  }),
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(membershipQuery());
  },
  component: MembershipDashboardPage,
});

function MembershipDashboardPage() {
  const { data: membership } = useSuspenseQuery(membershipQuery());
  const { isAuthenticated, membershipStatus, setMembershipStatus, user } = useAuth();
  const status = isAuthenticated ? membershipStatus : membership.status;
  const active = status === "ACTIVE";

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-5">
          <div>
            <h2 className="text-lg font-bold">TicketPass membership</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              TicketPass is a membership and access credential. Each organizer or event decides whether TicketPass
              membership is accepted, so it does not automatically guarantee entry to every event.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold">Status</p>
              <Badge className={active ? "bg-brand-blue text-primary-foreground" : "bg-secondary text-secondary-foreground"}>
                {status.replace(/_/g, " ")}
              </Badge>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              {status === "ACTIVE"
                ? `Your TicketPass is active and valid at ${membership.eligibleEventsCount} eligible events.`
                : status === "SUSPENDED"
                  ? "Your membership is temporarily suspended. Contact support to restore access."
                  : `You are not a member yet. Membership costs ${formatNaira(membership.price)}.`}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {!active && (
                <Button
                  className="bg-gradient-brand text-primary-foreground"
                  onClick={() => {
                    notifyPaymentsComingSoon("MEMBERSHIP", "Your TicketPass request has been saved.");
                    if (isAuthenticated) setMembershipStatus("ACTIVE");
                  }}
                >
                  Become a Member
                </Button>
              )}
              <Button asChild variant="outline">
                <Link to="/membership">Membership benefits</Link>
              </Button>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="text-base font-bold">Membership history</h3>
            <ul className="mt-3 space-y-2 text-sm">
              {membership.history.map((entry) => (
                <li key={entry.id} className="flex justify-between gap-3 border-b border-border pb-2 last:border-0">
                  <span className="min-w-0 truncate text-muted-foreground">{entry.label}</span>
                  <span className="shrink-0 font-medium">{formatShortDate(entry.date)}</span>
                </li>
              ))}
              {membership.history.length === 0 && (
                <li className="text-muted-foreground">No membership activity yet.</li>
              )}
            </ul>
          </div>
        </div>

        <aside className="ticket-stub rounded-3xl bg-gradient-brand p-1 shadow-ticket lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-[1.4rem] bg-card p-5">
            <p className="text-[0.65rem] tracking-[0.2em] text-muted-foreground uppercase">EventPass Permanent</p>
            <p className="font-display text-xl font-bold">TicketPass</p>
            <div className="mt-5 flex justify-center">
              <QrPlaceholder label={active ? "Membership QR ready" : "QR issued after activation"} />
            </div>
            <dl className="mt-5 space-y-2.5 text-sm">
              <Row label="Member" value={active ? (user?.fullName ?? membership.memberName ?? "EventPass Member") : "—"} />
              <Row label="Membership ID" value={active ? (membership.membershipId ?? "EP-MEM-004821") : "—"} />
              <Row label="Joined" value={membership.joinedAt ? formatShortDate(membership.joinedAt) : active ? "Today" : "—"} />
            </dl>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 border-b border-border pb-2 last:border-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="min-w-0 truncate font-medium">{value}</dd>
    </div>
  );
}
