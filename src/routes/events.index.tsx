import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Search, SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { EventCard } from "@/components/events/EventCard";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CATEGORIES, eventsQuery } from "@/lib/data";
import type { EventCategorySlug } from "@/lib/types";

interface EventSearch {
  q?: string | undefined;
  location?: string | undefined;
  date?: string | undefined;
  category?: EventCategorySlug | "all" | undefined;
}

export const Route = createFileRoute("/events/")({
  validateSearch: (search: Record<string, unknown>): EventSearch => ({
    q: typeof search["q"] === "string" ? search["q"] : "",
    location: typeof search["location"] === "string" ? search["location"] : "",
    date: typeof search["date"] === "string" ? search["date"] : "",
    category: (typeof search["category"] === "string" ? search["category"] : "all") as EventSearch["category"],
  }),
  head: () => ({
    meta: [
      { title: "Browse Events — Wanbiz EventPass" },
      {
        name: "description",
        content: "Search Nigerian concerts, conferences, parties, weddings and more. Buy tickets in Naira instantly.",
      },
      { property: "og:title", content: "Browse Events — Wanbiz EventPass" },
      { property: "og:description", content: "Search and filter events across Nigeria and secure your ticket." },
    ],
  }),
  component: EventsPage,
});

function EventsPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const [form, setForm] = useState({
    q: search.q ?? "",
    location: search.location ?? "",
    date: search.date ?? "",
    category: search.category ?? ("all" as const),
  });
  const { data: events } = useSuspenseQuery(
    eventsQuery({ query: search.q ?? "", location: search.location ?? "", date: search.date ?? "", category: search.category ?? "all" }),
  );

  return (
    <>
      <PageHeader
        eyebrow="Discover"
        title="Events"
        description="Every live event on Wanbiz EventPass. Filter by name, city, date or category."
      />

      <section className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <form
          className="rounded-2xl border border-border bg-card p-4 shadow-ticket"
          onSubmit={(e) => {
            e.preventDefault();
            void navigate({ search: form });
          }}
        >
          <div className="flex items-center gap-2 text-sm font-semibold">
            <SlidersHorizontal className="size-4 text-brand-red" /> Filter events
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1.5">
              <Label htmlFor="q">Event name</Label>
              <Input id="q" value={form.q} onChange={(e) => setForm({ ...form, q: e.target.value })} placeholder="Search events" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="Lagos, Abuja…"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="category">Category</Label>
              <Select
                value={form.category ?? "all"}
                onValueChange={(value) =>
                  setForm({ ...form, category: value as NonNullable<EventSearch["category"]> })
                }
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category.slug} value={category.slug}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Button type="submit" className="bg-gradient-brand text-primary-foreground sm:w-40">
              <Search className="size-4" /> Search Events
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                const reset = { q: "", location: "", date: "", category: "all" as const };
                setForm(reset);
                void navigate({ search: reset });
              }}
            >
              Clear filters
            </Button>
          </div>
        </form>

        <p className="mt-6 text-sm text-muted-foreground">
          {events.length} {events.length === 1 ? "event" : "events"} found
        </p>

        {events.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-border p-10 text-center">
            <p className="font-semibold">No events match your search</p>
            <p className="mt-1 text-sm text-muted-foreground">Try a different city, date or category.</p>
          </div>
        ) : (
          <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
