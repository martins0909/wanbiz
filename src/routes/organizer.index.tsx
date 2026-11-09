import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { CalendarRange, Ticket } from "lucide-react";
import { StatCard } from "@/components/shared/StatCard";
import { Button } from "@/components/ui/button";
import { organizerEventsQuery } from "@/lib/data/organizer";
import { formatShortDate } from "@/lib/format";

export const Route = createFileRoute("/organizer/")({
  head: () => ({
    meta: [
      { title: "Organizer overview — Wanbiz EventPass" },
      {
        name: "description",
        content: "Track ticket sales, attendees and revenue in Naira across your EventPass events.",
      },
      { property: "og:title", content: "EventPass organizer console" },
      {
        property: "og:description",
        content: "Sales, attendees, seating, check-in and revenue in one console.",
      },
    ],
  }),
  component: OrganizerOverview,
});

function OrganizerOverview() {
  const { data: events = [], isPending, error } = useQuery(organizerEventsQuery());
  const mine = events.slice(0, 3);
  const published = events.filter((event) => event.status === "PUBLISHED").length;
  const sold = events.reduce(
    (total, event) => total + event.ticketTypes.reduce((count, ticket) => count + ticket.sold, 0),
    0,
  );
  const capacity = events.reduce(
    (total, event) =>
      total + event.ticketTypes.reduce((count, ticket) => count + ticket.quantity, 0),
    0,
  );

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Published events" value={`${published}`} icon={CalendarRange} />
        <StatCard
          label="Tickets sold"
          value={sold.toLocaleString("en-NG")}
          icon={Ticket}
          tone="blue"
        />
        <StatCard label="Ticket capacity" value={capacity.toLocaleString("en-NG")} icon={Ticket} />
      </div>

      <section>
        <div className="flex items-end justify-between gap-3">
          <h2 className="text-lg font-bold">Your events</h2>
          <Button asChild variant="ghost" size="sm">
            <Link to="/organizer/events">View all</Link>
          </Button>
        </div>
        {isPending && <p className="mt-4 text-sm text-muted-foreground">Loading your events…</p>}
        {error && (
          <p role="alert" className="mt-4 text-sm text-destructive">
            {error.message}
          </p>
        )}
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
                  {event.ticketTypes
                    .reduce((total, ticket) => total + ticket.sold, 0)
                    .toLocaleString("en-NG")}{" "}
                  tickets sold
                </p>
              </div>
              {event.status === "PUBLISHED" && (
                <Button asChild size="sm" variant="outline">
                  <Link to="/events/$eventSlug" params={{ eventSlug: event.slug }}>
                    View public page
                  </Link>
                </Button>
              )}
            </div>
          ))}
          {!isPending && !error && mine.length === 0 && (
            <div className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
              You have not created any events yet.
              <Button asChild variant="link" className="px-1">
                <Link to="/create-event">Create an event</Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      <p className="rounded-2xl border border-border bg-secondary/50 p-4 text-xs text-muted-foreground">
        Revenue, attendee details, and check-in counts will appear when verified payment and ticket
        records are connected.
      </p>
    </div>
  );
}
