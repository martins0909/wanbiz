import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { EventCard } from "@/components/events/EventCard";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { CATEGORIES, eventsQuery } from "@/lib/data";
import type { EventCategorySlug } from "@/lib/types";

export const Route = createFileRoute("/categories/$categorySlug")({
  loader: async ({ context, params }) => {
    const category = CATEGORIES.find((item) => item.slug === params.categorySlug);
    await context.queryClient.ensureQueryData(
      eventsQuery({ category: params.categorySlug as EventCategorySlug }),
    );
    return { name: category?.name ?? "Category", description: category?.description ?? "" };
  },
  head: ({ loaderData }) => {
    const name = loaderData?.name ?? "Events";
    const description = loaderData?.description ?? "Browse events by category on Wanbiz EventPass.";
    return {
      meta: [
        { title: `${name} Events in Nigeria — Wanbiz EventPass` },
        { name: "description", content: `${description}. Buy tickets in Naira on Wanbiz EventPass.` },
        { property: "og:title", content: `${name} Events — Wanbiz EventPass` },
        { property: "og:description", content: description },
      ],
    };
  },
  component: CategoryDetailPage,
});

function CategoryDetailPage() {
  const { categorySlug } = Route.useParams();
  const category = CATEGORIES.find((item) => item.slug === categorySlug);
  const { data: events } = useSuspenseQuery(eventsQuery({ category: categorySlug as EventCategorySlug }));

  return (
    <>
      <PageHeader
        eyebrow="Category"
        title={category?.name ?? "Events"}
        description={category?.description ?? "Events in this category."}
        actions={
          <Button asChild variant="outline" className="border-white/25 bg-transparent text-graphite-foreground hover:bg-white/10 hover:text-graphite-foreground">
            <Link to="/categories">All categories</Link>
          </Button>
        }
      />
      <section className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
        {events.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center">
            <p className="font-semibold">No events in this category yet</p>
            <p className="mt-1 text-sm text-muted-foreground">Check back soon, or explore other categories.</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
