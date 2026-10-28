import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { QrPlaceholder } from "@/components/shared/QrPlaceholder";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ticketQuery } from "@/lib/data";
import { formatEventDate, formatNaira } from "@/lib/format";

export const Route = createFileRoute("/dashboard/tickets/$ticketId")({
  loader: async ({ context, params }) => {
    const ticket = await context.queryClient.ensureQueryData(ticketQuery(params.ticketId));
    if (!ticket) throw notFound();
    return { name: ticket.eventName };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Ticket unavailable — Wanbiz EventPass" }, { name: "robots", content: "noindex" }] };
    }
    return {
      meta: [
        { title: `Ticket · ${loaderData.name} — Wanbiz EventPass` },
        { name: "description", content: `Your digital EventPass ticket and QR code for ${loaderData.name}.` },
        { name: "robots", content: "noindex" },
        { property: "og:title", content: `Ticket · ${loaderData.name}` },
        { property: "og:description", content: "Your digital EventPass ticket and QR code." },
      ],
    };
  },
  component: TicketDetailPage,
  notFoundComponent: () => (
    <div className="py-16 text-center">
      <p className="font-semibold">Ticket not found</p>
      <Button asChild className="mt-5 bg-gradient-brand text-primary-foreground">
        <Link to="/dashboard/tickets">Back to my tickets</Link>
      </Button>
    </div>
  ),
});

function TicketDetailPage() {
  const { ticketId } = Route.useParams();
  const { data: ticket } = useSuspenseQuery(ticketQuery(ticketId));
  if (!ticket) return null;

  return (
    <div className="space-y-6">
      <Link to="/dashboard/tickets" className="text-sm font-medium text-brand-blue hover:underline">
        ← Back to my tickets
      </Link>

      <div className="ticket-stub overflow-hidden rounded-3xl border border-border bg-card shadow-ticket">
        <img src={ticket.image} alt={ticket.eventName} width={1280} height={640} className="aspect-[2/1] w-full object-cover" />
        <div className="grid gap-6 p-6 sm:grid-cols-[minmax(0,1fr)_auto]">
          <div className="min-w-0 space-y-4">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
              <h1 className="min-w-0 font-display text-xl font-bold">{ticket.eventName}</h1>
              <Badge className="bg-brand-blue text-primary-foreground">{ticket.status}</Badge>
            </div>
            <dl className="space-y-2.5 text-sm">
              <Row label="Date" value={formatEventDate(ticket.eventDate)} />
              <Row label="Venue" value={`${ticket.venue}, ${ticket.city}`} />
              <Row label="Ticket type" value={ticket.ticketTypeName} />
              <Row label="Amount paid" value={formatNaira(ticket.price)} />
              <Row label="Seat" value={ticket.seat ?? "Assigned automatically at check-in"} />
              <Row label="Reference" value={ticket.reference} />
              <Row label="Checked in" value={ticket.checkedInAt ? formatEventDate(ticket.checkedInAt) : "Not yet"} />
            </dl>
          </div>
          <div className="flex flex-col items-center gap-3">
            <QrPlaceholder label="Present this QR code at the gate" />
            <Button variant="outline" size="sm" className="w-full">
              Download receipt
            </Button>
            <Button variant="outline" size="sm" className="w-full">
              Transfer ticket
            </Button>
          </div>
        </div>
      </div>

      <p className="rounded-2xl border border-border bg-secondary/50 p-4 text-xs text-muted-foreground">
        Receipt downloads, ticket transfers and live QR scanning will be available after ticket issuance is connected to
        verified payments. Ticket data shown here is currently demo content.
      </p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-4 border-b border-border pb-2 last:border-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="min-w-0 text-right font-medium break-words">{value}</dd>
    </div>
  );
}
