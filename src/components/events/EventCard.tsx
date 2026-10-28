import { Link } from "@tanstack/react-router";
import { CalendarDays, MapPin, Ticket } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatEventDate, formatNaira } from "@/lib/format";
import type { EventRecord } from "@/lib/types";

export function EventCard({ event }: { event: EventRecord }) {
  const soldOut = event.ticketsAvailable === 0;

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-ticket transition-transform hover:-translate-y-1">
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={event.image}
          alt={event.name}
          width={1280}
          height={800}
          loading="lazy"
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <Badge className="bg-background/90 text-foreground capitalize">{event.category}</Badge>
          {event.acceptsTicketPass && <Badge className="bg-brand-blue text-primary-foreground">TicketPass</Badge>}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <h3 className="line-clamp-2 text-base leading-snug font-bold">{event.name}</h3>
        <div className="space-y-1.5 text-xs text-muted-foreground">
          <p className="flex items-center gap-1.5">
            <CalendarDays className="size-3.5 shrink-0" />
            {formatEventDate(event.date)} · {event.time}
          </p>
          <p className="flex min-w-0 items-center gap-1.5">
            <MapPin className="size-3.5 shrink-0" />
            <span className="truncate">
              {event.venue}, {event.city}
            </span>
          </p>
          <p className="flex items-center gap-1.5">
            <Ticket className="size-3.5 shrink-0" />
            {soldOut ? "Sold out" : `${event.ticketsAvailable.toLocaleString()} tickets available`}
          </p>
        </div>

        <div className="mt-auto flex items-end justify-between gap-3 pt-2">
          <div>
            <p className="text-[0.65rem] tracking-wide text-muted-foreground uppercase">Starting from</p>
            <p className="font-display text-lg font-bold">
              {event.startingPrice === 0 ? "Free" : formatNaira(event.startingPrice)}
            </p>
          </div>
          <Button asChild size="sm" className="bg-gradient-brand text-primary-foreground" disabled={soldOut}>
            <Link to="/events/$eventSlug" params={{ eventSlug: event.slug }}>
              Get Ticket
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
