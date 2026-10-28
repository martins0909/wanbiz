import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { IdCard, Mail, Ticket, Wallet } from "lucide-react";
import { StatCard } from "@/components/shared/StatCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { invitationsQuery, membershipQuery, ticketsQuery, walletQuery } from "@/lib/data";
import { formatNaira, formatShortDate } from "@/lib/format";
import { useAuth } from "@/lib/auth/auth-context";

export const Route = createFileRoute("/dashboard/")({
  head: () => ({
    meta: [
      { title: "My dashboard — Wanbiz EventPass" },
      { name: "description", content: "Your EventPass overview: upcoming tickets, invitations, wallet balance and TicketPass membership." },
      { property: "og:title", content: "My EventPass dashboard" },
      { property: "og:description", content: "Tickets, invitations, wallet and membership in one place." },
    ],
  }),
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(ticketsQuery()),
      context.queryClient.ensureQueryData(invitationsQuery()),
      context.queryClient.ensureQueryData(walletQuery()),
      context.queryClient.ensureQueryData(membershipQuery()),
    ]);
  },
  component: DashboardOverview,
});

function DashboardOverview() {
  const { data: tickets } = useSuspenseQuery(ticketsQuery());
  const { data: invitations } = useSuspenseQuery(invitationsQuery());
  const { data: wallet } = useSuspenseQuery(walletQuery());
  const { data: membership } = useSuspenseQuery(membershipQuery());
  const { membershipStatus, isAuthenticated } = useAuth();
  const status = isAuthenticated ? membershipStatus : membership.status;

  const upcoming = tickets.filter((ticket) => ticket.status === "ACTIVE");
  const pendingInvites = invitations.filter((invite) => invite.status === "PENDING");

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Active tickets" value={`${upcoming.length}`} icon={Ticket} />
        <StatCard label="Wallet balance" value={formatNaira(wallet.balance)} icon={Wallet} />
        <StatCard label="Pending invitations" value={`${pendingInvites.length}`} icon={Mail} />
        <StatCard label="TicketPass" value={status.replace(/_/g, " ")} icon={IdCard} />
      </div>

      <section>
        <div className="flex items-end justify-between gap-3">
          <h2 className="text-lg font-bold">Upcoming tickets</h2>
          <Button asChild variant="ghost" size="sm">
            <Link to="/dashboard/tickets">View all</Link>
          </Button>
        </div>
        <div className="mt-4 space-y-3">
          {upcoming.slice(0, 3).map((ticket) => (
            <Link
              key={ticket.id}
              to="/dashboard/tickets/$ticketId"
              params={{ ticketId: ticket.id }}
              className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-brand-blue/60"
            >
              <div className="min-w-0">
                <p className="truncate font-semibold">{ticket.eventName}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatShortDate(ticket.eventDate)} · {ticket.venue}, {ticket.city}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {ticket.ticketTypeName} · {ticket.seat ?? "Seat assigned at check-in"}
                </p>
              </div>
              <Badge className="bg-brand-blue text-primary-foreground">{ticket.status}</Badge>
            </Link>
          ))}
          {upcoming.length === 0 && (
            <p className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              No active tickets yet. <Link to="/events" className="font-semibold text-brand-red">Browse events</Link>
            </p>
          )}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="text-base font-bold">Invitations</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Your wallet is charged only after a recipient accepts the invitation.
          </p>
          <Button asChild variant="outline" className="mt-4">
            <Link to="/dashboard/invitations">Manage invitations</Link>
          </Button>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="text-base font-bold">TicketPass membership</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            TicketPass is an access credential. Each organizer decides whether it is accepted at their event.
          </p>
          <Button asChild variant="outline" className="mt-4">
            <Link to="/dashboard/membership">Open membership</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
