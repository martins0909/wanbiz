import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { eventsQuery } from "@/lib/data";
import { formatNaira, formatShortDate } from "@/lib/format";

export const Route = createFileRoute("/organizer/events")({
  head: () => ({
    meta: [
      { title: "My events — Wanbiz EventPass Organizer" },
      { name: "description", content: "Manage your EventPass events, ticket inventory and pricing in Naira." },
      { property: "og:title", content: "Manage your EventPass events" },
      { property: "og:description", content: "Ticket inventory, pricing and event settings." },
    ],
  }),
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(eventsQuery());
  },
  component: OrganizerEvents,
});

function OrganizerEvents() {
  const { data: events } = useSuspenseQuery(eventsQuery());
  const mine = events.slice(0, 5);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold">My events</h2>
          <p className="mt-1 text-sm text-muted-foreground">Ticket inventory and settings for each event.</p>
        </div>
        <Button asChild size="sm" className="bg-gradient-brand text-primary-foreground">
          <Link to="/create-event">New event</Link>
        </Button>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {mine.map((event) => (
          <div key={event.id} className="overflow-hidden rounded-2xl border border-border bg-card">
            <img
              src={event.image}
              alt={event.name}
              width={1280}
              height={720}
              loading="lazy"
              className="aspect-[16/9] w-full object-cover"
            />
            <div className="space-y-2 p-4">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                <p className="min-w-0 truncate font-semibold">{event.name}</p>
                {event.acceptsTicketPass && <Badge className="bg-brand-blue text-primary-foreground">TicketPass</Badge>}
              </div>
              <p className="text-xs text-muted-foreground">
                {formatShortDate(event.date)} · {event.city}
              </p>
              <p className="text-xs text-muted-foreground">
                From {formatNaira(event.startingPrice)} · {event.ticketsAvailable.toLocaleString("en-NG")} left
              </p>
              <div className="flex gap-2 pt-2">
                <Button asChild size="sm" variant="outline">
                  <Link to="/events/$eventSlug" params={{ eventSlug: event.slug }}>
                    Public page
                  </Link>
                </Button>
                <Button asChild size="sm" variant="ghost">
                  <Link to="/organizer/attendees">Attendees</Link>
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
