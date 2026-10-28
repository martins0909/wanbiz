import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { CalendarRange, Ticket, TrendingUp, Users } from "lucide-react";
import { StatCard } from "@/components/shared/StatCard";
import { Button } from "@/components/ui/button";
import { eventsQuery } from "@/lib/data";
import { formatNaira, formatShortDate } from "@/lib/format";

export const Route = createFileRoute("/organizer/")({
  head: () => ({
    meta: [
      { title: "Organizer overview — Wanbiz EventPass" },
      { name: "description", content: "Track ticket sales, attendees and revenue in Naira across your EventPass events." },
      { property: "og:title", content: "EventPass organizer console" },
      { property: "og:description", content: "Sales, attendees, seating, check-in and revenue in one console." },
    ],
  }),
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(eventsQuery());
  },
  component: OrganizerOverview,
});

function OrganizerOverview() {
  const { data: events } = useSuspenseQuery(eventsQuery());
  const mine = events.slice(0, 3);
  const sold = mine.reduce((total, event) => total + (event.ticketsTotal - event.ticketsAvailable), 0);
  const revenue = mine.reduce(
    (total, event) => total + (event.ticketsTotal - event.ticketsAvailable) * event.startingPrice,
    0,
  );

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Live events" value={`${mine.length}`} icon={CalendarRange} />
        <StatCard label="Tickets sold" value={sold.toLocaleString("en-NG")} icon={Ticket} tone="blue" />
        <StatCard label="Gross revenue" value={formatNaira(revenue)} icon={TrendingUp} tone="red" />
        <StatCard label="Unique attendees" value={Math.round(sold * 0.82).toLocaleString("en-NG")} icon={Users} />
      </div>

      <section>
        <div className="flex items-end justify-between gap-3">
          <h2 className="text-lg font-bold">Your events</h2>
          <Button asChild variant="ghost" size="sm">
            <Link to="/organizer/events">View all</Link>
          </Button>
        </div>
        <div className="mt-4 space-y-3">
          {mine.map((event) => (
            <div
              key={event.id}
              className="grid gap-3 rounded-2xl border border-border bg-card p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
            >
              <div className="min-w-0">
                <p className="truncate font-semibold">{event.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatShortDate(event.date)} · {event.venue}, {event.city}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {(event.ticketsTotal - event.ticketsAvailable).toLocaleString("en-NG")} of{" "}
                  {event.ticketsTotal.toLocaleString("en-NG")} tickets sold
                </p>
              </div>
              <Button asChild size="sm" variant="outline">
                <Link to="/events/$eventSlug" params={{ eventSlug: event.slug }}>
                  View public page
                </Link>
              </Button>
            </div>
          ))}
        </div>
      </section>

      <p className="rounded-2xl border border-border bg-secondary/50 p-4 text-xs text-muted-foreground">
        Live sales figures, payouts and QR check-in become available after verified payment and ticket records are connected.
      </p>
    </div>
  );
}
