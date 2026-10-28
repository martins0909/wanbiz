import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { CategoryIcon } from "@/components/events/CategoryIcon";
import { PageHeader } from "@/components/shared/PageHeader";
import { categoriesQuery } from "@/lib/data";

export const Route = createFileRoute("/categories/")({
  head: () => ({
    meta: [
      { title: "Event Categories — Wanbiz EventPass" },
      {
        name: "description",
        content: "Concerts, parties, conferences, weddings, sports, business, entertainment, religious and networking events.",
      },
      { property: "og:title", content: "Event Categories — Wanbiz EventPass" },
      { property: "og:description", content: "Browse Nigerian events by category on Wanbiz EventPass." },
    ],
  }),
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(categoriesQuery());
  },
  component: CategoriesPage,
});

function CategoriesPage() {
  const { data: categories } = useSuspenseQuery(categoriesQuery());

  return (
    <>
      <PageHeader
        eyebrow="Browse"
        title="Categories"
        description="Pick a category to see everything happening in it right now."
      />
      <section className="mx-auto grid max-w-7xl gap-4 px-4 py-10 sm:grid-cols-2 lg:grid-cols-3 lg:px-8">
        {categories.map((category) => (
          <Link
            key={category.slug}
            to="/categories/$categorySlug"
            params={{ categorySlug: category.slug }}
            className="group grid grid-cols-[auto_minmax(0,1fr)] items-start gap-4 rounded-2xl border border-border bg-card p-5 shadow-ticket transition-colors hover:border-brand-blue/60"
          >
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-gradient-brand text-primary-foreground">
              <CategoryIcon name={category.icon} className="size-6" />
            </span>
            <span className="min-w-0">
              <span className="block font-display text-lg font-bold">{category.name}</span>
              <span className="mt-1 block text-sm text-muted-foreground">{category.description}</span>
              <span className="mt-2 block text-xs font-semibold text-brand-red">
                {category.eventCount} {category.eventCount === 1 ? "event" : "events"}
              </span>
            </span>
          </Link>
        ))}
      </section>
    </>
  );
}
