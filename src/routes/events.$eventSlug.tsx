import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { BadgeCheck, CalendarDays, Clock, MapPin, Ticket, UserPlus, Users } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { eventQuery } from "@/lib/data";
import { formatEventDate, formatNaira } from "@/lib/format";
import { notifyPaymentsComingSoon } from "@/lib/payments/notify";
import { useCheckout } from "@/lib/payments/use-checkout";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/events/$eventSlug")({
  loader: async ({ context, params }) => {
    const event = await context.queryClient.ensureQueryData(eventQuery(params.eventSlug));
    if (!event) throw notFound();
    return { name: event.name, description: event.description };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Event unavailable — Wanbiz EventPass" }, { name: "robots", content: "noindex" }],
      };
    }
    return {
      meta: [
        { title: `${loaderData.name} — Wanbiz EventPass` },
        { name: "description", content: loaderData.description.slice(0, 155) },
        { property: "og:title", content: `${loaderData.name} — Wanbiz EventPass` },
        { property: "og:description", content: loaderData.description.slice(0, 155) },
      ],
    };
  },
  component: EventDetailPage,
  notFoundComponent: EventNotFound,
});

function EventNotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="text-2xl font-bold">Event not found</h1>
      <p className="mt-2 text-sm text-muted-foreground">This event may have ended or been unpublished.</p>
      <Button asChild className="mt-6 bg-gradient-brand text-primary-foreground">
        <Link to="/events">Browse events</Link>
      </Button>
    </div>
  );
}

function EventDetailPage() {
  const { eventSlug } = Route.useParams();
  const { data: event } = useSuspenseQuery(eventQuery(eventSlug));
  const [selected, setSelected] = useState(0);
  const checkout = useCheckout();

  if (!event) return <EventNotFound />;
  const ticketType = event.ticketTypes[selected]!;

  return (
    <>
      <section className="relative bg-graphite text-graphite-foreground">
        <img
          src={event.image}
          alt={event.name}
          width={1280}
          height={800}
          className="absolute inset-0 size-full object-cover opacity-30"
        />
        <div className="relative mx-auto max-w-7xl px-4 py-14 lg:px-8 lg:py-20">
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-brand-red text-primary-foreground capitalize">{event.category}</Badge>
            {event.acceptsTicketPass && <Badge className="bg-brand-blue text-primary-foreground">Accepts TicketPass</Badge>}
            {event.seatingEnabled && <Badge variant="secondary">Seat assigned at check-in</Badge>}
          </div>
          <h1 className="mt-4 max-w-3xl text-3xl font-bold sm:text-4xl lg:text-5xl">{event.name}</h1>
          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-graphite-foreground/80">
            <span className="flex items-center gap-2">
              <CalendarDays className="size-4" /> {formatEventDate(event.date)}
            </span>
            <span className="flex items-center gap-2">
              <Clock className="size-4" /> {event.time}
            </span>
            <span className="flex items-center gap-2">
              <MapPin className="size-4" /> {event.venue}, {event.city}
            </span>
            <span className="flex items-center gap-2">
              <Users className="size-4" /> By {event.organizerName}
            </span>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-10 lg:grid-cols-[1.4fr_1fr] lg:px-8">
        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-bold">About this event</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{event.description}</p>
          </div>

          <div>
            <h2 className="text-xl font-bold">Ticket types</h2>
            <div className="mt-4 space-y-3">
              {event.ticketTypes.map((type, index) => {
                const remaining = type.quantity - type.sold;
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setSelected(index)}
                    className={cn(
                      "grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-4 rounded-2xl border p-4 text-left transition-colors",
                      selected === index ? "border-brand-red bg-brand-red/5" : "border-border bg-card hover:bg-secondary/60",
                    )}
                  >
                    <div className="min-w-0">
                      <p className="font-semibold">{type.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {remaining > 0 ? `${remaining.toLocaleString()} left` : "Sold out"} · {type.perks.join(" · ")}
                      </p>
                    </div>
                    <p className="font-display text-lg font-bold whitespace-nowrap">
                      {type.price === 0 ? "Free" : formatNaira(type.price)}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5">
            <h2 className="text-base font-bold">Entry and check-in</h2>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <BadgeCheck className="mt-0.5 size-4 shrink-0 text-brand-blue" /> Digital ticket with QR code issued after
                payment verification.
              </li>
              <li className="flex gap-2">
                <BadgeCheck className="mt-0.5 size-4 shrink-0 text-brand-blue" />
                {event.seatingEnabled
                  ? "A seat is automatically assigned when you check in."
                  : "Open standing — no seat allocation for this event."}
              </li>
              <li className="flex gap-2">
                <BadgeCheck className="mt-0.5 size-4 shrink-0 text-brand-blue" />
                {event.acceptsTicketPass
                  ? "This organizer accepts EventPass TicketPass members."
                  : "This organizer does not accept TicketPass membership for entry."}
              </li>
            </ul>
          </div>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="ticket-stub rounded-2xl border border-border bg-card p-5 shadow-ticket">
            <p className="text-xs tracking-wide text-muted-foreground uppercase">Selected ticket</p>
            <p className="mt-1 text-lg font-bold">{ticketType.name}</p>
            <p className="font-display text-3xl font-bold">
              {ticketType.price === 0 ? "Free" : formatNaira(ticketType.price)}
            </p>
            <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Ticket className="size-3.5" /> {event.ticketsAvailable.toLocaleString()} of{" "}
              {event.ticketsTotal.toLocaleString()} tickets left
            </p>

            <div className="mt-5 space-y-2.5">
              <Button
                size="lg"
                className="w-full bg-gradient-brand text-primary-foreground"
                disabled={checkout.pending}
                onClick={() =>
                  ticketType.price === 0
                    ? notifyPaymentsComingSoon("TICKET_PURCHASE", `${event.name} · ${ticketType.name} reserved.`)
                    : void checkout.buyTicket(eventSlug, ticketType.id)
                }
              >
                {checkout.pending ? "Opening Paystack…" : "Get Ticket"}
              </Button>
              <Button asChild size="lg" variant="outline" className="w-full">
                <Link to="/dashboard/invitations">
                  <UserPlus className="size-4" /> Invite a friend
                </Link>
              </Button>
            </div>
            <p className="mt-4 text-[0.7rem] leading-relaxed text-muted-foreground">
              Paystack checkout is being connected. Ticket issuing, receipts and QR codes activate with it.
            </p>
          </div>
        </aside>
      </section>
    </>
  );
}
