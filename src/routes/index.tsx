import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  MapPin,
  Search,
  Sparkles,
  Ticket,
  Users,
} from "lucide-react";
import { useState } from "react";
import { CategoryIcon } from "@/components/events/CategoryIcon";
import { EventCard } from "@/components/events/EventCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { categoriesQuery, featuredEventsQuery, presalesQuery } from "@/lib/data";
import { formatNaira, formatShortDate } from "@/lib/format";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Wanbiz EventPass — Discover. Buy. Invite. Experience." },
      {
        name: "description",
        content:
          "Find amazing Nigerian events, secure your ticket in Naira, invite your friends and enjoy seamless QR event access with Wanbiz EventPass.",
      },
      { property: "og:title", content: "Wanbiz EventPass — Discover. Buy. Invite. Experience." },
      {
        property: "og:description",
        content: "Nigeria's event ticketing platform: tickets, presales, invitations, wallet and TicketPass membership.",
      },
    ],
  }),
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(featuredEventsQuery()),
      context.queryClient.ensureQueryData(categoriesQuery()),
      context.queryClient.ensureQueryData(presalesQuery()),
    ]);
  },
  component: HomePage,
});

function HeroSearch() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");

  return (
    <form
      className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-md sm:p-5"
      onSubmit={(e) => {
        e.preventDefault();
        void navigate({ to: "/events", search: { q, location, date, category: "all" } });
      }}
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="q" className="text-[0.7rem] tracking-wide text-graphite-foreground/70 uppercase">
            Event name
          </Label>
          <Input
            id="q"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Lagos Live Fest"
            className="border-white/15 bg-background/95 text-foreground"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="location" className="text-[0.7rem] tracking-wide text-graphite-foreground/70 uppercase">
            Location
          </Label>
          <Input
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Lagos, Abuja…"
            className="border-white/15 bg-background/95 text-foreground"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="date" className="text-[0.7rem] tracking-wide text-graphite-foreground/70 uppercase">
            Date
          </Label>
          <Input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border-white/15 bg-background/95 text-foreground"
          />
        </div>
      </div>
      <div className="mt-4 flex flex-col gap-2.5 sm:flex-row">
        <Button type="submit" size="lg" className="bg-gradient-brand text-primary-foreground sm:flex-1">
          <Search className="size-4" /> Search Events
        </Button>
        <Button asChild size="lg" variant="secondary" className="sm:flex-1">
          <Link to="/events">Explore Events</Link>
        </Button>
        <Button
          asChild
          size="lg"
          variant="outline"
          className="border-white/25 bg-transparent text-graphite-foreground hover:bg-white/10 hover:text-graphite-foreground sm:flex-1"
        >
          <Link to="/create-event">Create an Event</Link>
        </Button>
      </div>
    </form>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  action?: { label: string; to: "/events" | "/categories" | "/presales" };
}) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
      <div className="min-w-0">
        <p className="text-xs font-semibold tracking-[0.2em] text-brand-red uppercase">{eyebrow}</p>
        <h2 className="mt-2 text-2xl font-bold sm:text-3xl">{title}</h2>
        {description && <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{description}</p>}
      </div>
      {action && (
        <Button asChild variant="ghost" size="sm" className="shrink-0">
          <Link to={action.to}>
            {action.label} <ArrowRight className="size-4" />
          </Link>
        </Button>
      )}
    </div>
  );
}

function HomePage() {
  const { data: featured } = useSuspenseQuery(featuredEventsQuery());
  const { data: categories } = useSuspenseQuery(categoriesQuery());
  const { data: presales } = useSuspenseQuery(presalesQuery());
  const livePresales = presales.filter((p) => p.status === "LIVE").slice(0, 2);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-graphite text-graphite-foreground">
        <div className="pointer-events-none absolute -top-24 -right-24 size-[26rem] rounded-full bg-brand-red/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-20 size-[24rem] rounded-full bg-brand-blue/25 blur-3xl" />
        <div className="relative mx-auto max-w-5xl px-4 py-14 lg:px-8 lg:py-20">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[0.7rem] font-medium tracking-wide uppercase">
            <Sparkles className="size-3.5 text-brand-blue" /> Nigeria's event pass
          </span>
          <h1 className="mt-5 text-4xl leading-[1.05] font-bold sm:text-5xl lg:text-6xl">
            Discover. Buy. <span className="text-brand-red">Invite.</span>{" "}
            <span className="text-brand-blue">Experience.</span>
          </h1>
          <p className="mt-4 max-w-2xl text-sm text-graphite-foreground/75 sm:text-lg">
            Find amazing events, secure your ticket, invite your friends and enjoy seamless event access.
          </p>
          <HeroSearch />
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-14 lg:px-8">
        <SectionHeading
          eyebrow="Browse"
          title="Categories"
          description="Every kind of Nigerian gathering, from arena concerts to family weddings."
          action={{ label: "All categories", to: "/categories" }}
        />
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {categories.map((category) => (
            <Link
              key={category.slug}
              to="/categories/$categorySlug"
              params={{ categorySlug: category.slug }}
              className="group rounded-2xl border border-border bg-card p-4 transition-colors hover:border-brand-blue/50 hover:bg-secondary/60"
            >
              <span className="grid size-10 place-items-center rounded-xl bg-gradient-brand text-primary-foreground">
                <CategoryIcon name={category.icon} className="size-5" />
              </span>
              <p className="mt-3 text-sm font-semibold">{category.name}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{category.eventCount} events</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured events */}
      <section className="mx-auto max-w-7xl px-4 pb-14 lg:px-8">
        <SectionHeading
          eyebrow="Featured"
          title="Events selling now"
          description="Handpicked events with tickets available today."
          action={{ label: "See all events", to: "/events" }}
        />
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </section>

      {/* TicketPass membership */}
      <section className="bg-graphite py-16 text-graphite-foreground">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 lg:grid-cols-[1.15fr_0.85fr] lg:px-8">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-brand-blue uppercase">TicketPass Membership</p>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">Get Your Permanent EventPass TicketPass</h2>
            <p className="mt-4 max-w-2xl text-sm text-graphite-foreground/75 sm:text-base">
              Become an EventPass member and receive your permanent digital TicketPass membership credential. Use it at
              eligible events that accept TicketPass members.
            </p>
            <p className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-graphite-foreground/70">
              TicketPass is a membership and access credential. Each organizer or event decides whether TicketPass
              membership is accepted — membership does not automatically guarantee entry to every EventPass event.
            </p>
            <div className="mt-7 flex flex-col gap-2.5 sm:flex-row">
              <Button asChild size="lg" className="bg-gradient-brand text-primary-foreground">
                <Link to="/membership">Get TicketPass</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/25 bg-transparent text-graphite-foreground hover:bg-white/10 hover:text-graphite-foreground"
              >
                <Link to="/how-it-works">Learn More</Link>
              </Button>
            </div>
          </div>

          <div className="ticket-stub rounded-3xl bg-gradient-brand p-1 shadow-ticket">
            <div className="rounded-[1.4rem] bg-graphite p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[0.65rem] tracking-[0.2em] text-graphite-foreground/60 uppercase">
                    EventPass Permanent
                  </p>
                  <p className="font-display text-xl font-bold">TicketPass</p>
                </div>
                <BadgeCheck className="size-8 text-brand-blue" />
              </div>
              <dl className="mt-8 space-y-3 text-sm">
                <div className="flex justify-between gap-3 border-b border-white/10 pb-2">
                  <dt className="text-graphite-foreground/60">Membership ID</dt>
                  <dd className="font-mono">EP-••••-••••</dd>
                </div>
                <div className="flex justify-between gap-3 border-b border-white/10 pb-2">
                  <dt className="text-graphite-foreground/60">Status</dt>
                  <dd className="text-brand-blue">Ready to activate</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-graphite-foreground/60">Eligible events</dt>
                  <dd>{featured.filter((e) => e.acceptsTicketPass).length}+ and growing</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </section>

      {/* Invite a friend */}
      <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
        <div className="grid gap-8 rounded-3xl border border-border bg-card p-6 shadow-ticket lg:grid-cols-2 lg:p-10">
          <div>
            <span className="grid size-11 place-items-center rounded-2xl bg-brand-red/10 text-brand-red">
              <Users className="size-5" />
            </span>
            <h2 className="mt-4 text-2xl font-bold sm:text-3xl">Invite a Friend. Make Memories Together.</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Use your EventPass wallet to invite a friend. Your wallet is charged only after the recipient accepts.
            </p>
            <Button asChild size="lg" className="mt-6 bg-gradient-brand text-primary-foreground">
              <Link to="/dashboard/invitations">Invite a Friend</Link>
            </Button>
          </div>
          <ol className="space-y-4 rounded-2xl bg-secondary/60 p-5 text-sm">
            {[
              "Pick an event and a ticket type.",
              "Send the invitation by email or phone number.",
              "We place a hold — nothing leaves your wallet yet.",
              "Your friend accepts, the ticket is issued and your wallet is charged.",
            ].map((step, index) => (
              <li key={step} className="flex gap-3">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-gradient-brand text-[0.7rem] font-bold text-primary-foreground">
                  {index + 1}
                </span>
                <span className="text-muted-foreground">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Presales */}
      <section className="mx-auto max-w-7xl px-4 pb-16 lg:px-8">
        <SectionHeading
          eyebrow="Ticket Presale Sponsorship"
          title="Support Events. Get Your Ticket Early."
          description="Purchase tickets during an event's presale sponsorship campaign and receive your ticket after successful payment verification."
          action={{ label: "Explore presales", to: "/presales" }}
        />
        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          {livePresales.map((presale) => {
            const percent = Math.min(100, Math.round((presale.raisedAmount / presale.goalAmount) * 100));
            return (
              <Link
                key={presale.id}
                to="/presales/$presaleId"
                params={{ presaleId: presale.id }}
                className="grid grid-cols-[7rem_minmax(0,1fr)] gap-4 overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-ticket transition-colors hover:border-brand-red/50 sm:grid-cols-[10rem_minmax(0,1fr)]"
              >
                <img
                  src={presale.image}
                  alt={presale.eventName}
                  width={1280}
                  height={800}
                  loading="lazy"
                  className="size-full rounded-xl object-cover"
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold">{presale.eventName}</p>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="size-3.5" /> {presale.city} ·{" "}
                    <CalendarDays className="size-3.5" /> {formatShortDate(presale.date)}
                  </p>
                  <Progress value={percent} className="mt-3 h-2" />
                  <p className="mt-2 text-xs text-muted-foreground">
                    {formatNaira(presale.raisedAmount)} of {formatNaira(presale.goalAmount)} · {presale.supporters}{" "}
                    supporters
                  </p>
                  <p className="mt-1.5 text-xs font-semibold text-brand-red">
                    Presale {formatNaira(presale.presalePrice)}{" "}
                    <span className="font-normal text-muted-foreground line-through">
                      {formatNaira(presale.regularPrice)}
                    </span>
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Organizers */}
      <section className="mx-auto max-w-7xl px-4 pb-20 lg:px-8">
        <div className="overflow-hidden rounded-3xl bg-gradient-brand p-1 shadow-ticket">
          <div className="grid gap-8 rounded-[1.4rem] bg-card p-6 lg:grid-cols-[1fr_1fr] lg:p-10">
            <div>
              <span className="grid size-11 place-items-center rounded-2xl bg-brand-blue/10 text-brand-blue">
                <Ticket className="size-5" />
              </span>
              <h2 className="mt-4 text-2xl font-bold sm:text-3xl">Create and Grow Your Event With EventPass</h2>
              <p className="mt-3 text-sm text-muted-foreground">
                Publish your event, sell tickets in Naira and run the door with QR check-in.
              </p>
              <Button asChild size="lg" className="mt-6 bg-gradient-brand text-primary-foreground">
                <Link to="/create-event">Create an Event</Link>
              </Button>
            </div>
            <ul className="grid gap-2.5 sm:grid-cols-2">
              {[
                "Sell tickets",
                "Create presale campaigns",
                "Accept TicketPass members",
                "Manage attendees",
                "Manage seats",
                "Scan tickets",
                "Monitor revenue",
              ].map((benefit) => (
                <li key={benefit} className="flex items-center gap-2 rounded-xl bg-secondary/60 px-3 py-2.5 text-sm">
                  <BadgeCheck className="size-4 shrink-0 text-brand-red" />
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
