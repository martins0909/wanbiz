import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { ticketsQuery } from "@/lib/data";
import { formatNaira, formatShortDate } from "@/lib/format";
import type { TicketStatus } from "@/lib/types";

const statusStyles: Record<TicketStatus, string> = {
  ACTIVE: "bg-brand-blue text-primary-foreground",
  USED: "bg-secondary text-secondary-foreground",
  TRANSFERRED: "bg-brand-red text-primary-foreground",
  CANCELLED: "bg-muted text-muted-foreground",
};

export const Route = createFileRoute("/dashboard/tickets/")({
  head: () => ({
    meta: [
      { title: "My tickets — Wanbiz EventPass" },
      { name: "description", content: "All your EventPass digital tickets with QR codes, seats and receipts." },
      { property: "og:title", content: "My EventPass tickets" },
      { property: "og:description", content: "Digital tickets, QR codes, seats and receipts." },
    ],
  }),
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(ticketsQuery());
  },
  component: TicketsPage,
});

function TicketsPage() {
  const { data: tickets } = useSuspenseQuery(ticketsQuery());

  return (
    <div>
      <h2 className="text-lg font-bold">My tickets</h2>
      <p className="mt-1 text-sm text-muted-foreground">Tap a ticket to view its QR code, seat and receipt.</p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {tickets.map((ticket) => (
          <Link
            key={ticket.id}
            to="/dashboard/tickets/$ticketId"
            params={{ ticketId: ticket.id }}
            className="ticket-stub overflow-hidden rounded-2xl border border-border bg-card shadow-ticket transition-transform hover:-translate-y-1"
          >
            <img
              src={ticket.image}
              alt={ticket.eventName}
              width={1280}
              height={720}
              loading="lazy"
              className="aspect-[16/9] w-full object-cover"
            />
            <div className="space-y-2 p-4">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                <p className="min-w-0 truncate font-semibold">{ticket.eventName}</p>
                <Badge className={statusStyles[ticket.status]}>{ticket.status}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {formatShortDate(ticket.eventDate)} · {ticket.venue}, {ticket.city}
              </p>
              <p className="text-xs text-muted-foreground">
                {ticket.ticketTypeName} · {formatNaira(ticket.price)} · {ticket.seat ?? "Seat at check-in"}
              </p>
              <p className="font-mono text-[0.7rem] text-muted-foreground">{ticket.reference}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
