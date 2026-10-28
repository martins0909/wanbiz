import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { CalendarDays, MapPin } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { presalesQuery } from "@/lib/data";
import { formatNaira, formatShortDate } from "@/lib/format";
import type { PresaleStatus } from "@/lib/types";

const statusStyles: Record<PresaleStatus, string> = {
  LIVE: "bg-brand-red text-primary-foreground",
  UPCOMING: "bg-secondary text-secondary-foreground",
  FUNDED: "bg-brand-blue text-primary-foreground",
  CLOSED: "bg-muted text-muted-foreground",
};

export const Route = createFileRoute("/presales/")({
  head: () => ({
    meta: [
      { title: "Ticket Presale Sponsorship — Wanbiz EventPass" },
      {
        name: "description",
        content:
          "Support Nigerian events during presale sponsorship campaigns and receive your ticket after payment verification.",
      },
      { property: "og:title", content: "Support Events. Get Your Ticket Early." },
      { property: "og:description", content: "Browse live presale sponsorship campaigns on Wanbiz EventPass." },
    ],
  }),
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(presalesQuery());
  },
  component: PresalesPage,
});

function PresalesPage() {
  const { data: presales } = useSuspenseQuery(presalesQuery());

  return (
    <>
      <PageHeader
        eyebrow="Ticket Presale Sponsorship"
        title="Support Events. Get Your Ticket Early."
        description="Purchase tickets during an event's presale sponsorship campaign and receive your ticket after successful payment verification."
      />
      <section className="mx-auto grid max-w-7xl gap-5 px-4 py-10 sm:grid-cols-2 lg:grid-cols-3 lg:px-8">
        {presales.map((presale) => {
          const percent = Math.min(100, Math.round((presale.raisedAmount / presale.goalAmount) * 100));
          return (
            <Link
              key={presale.id}
              to="/presales/$presaleId"
              params={{ presaleId: presale.id }}
              className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-ticket transition-transform hover:-translate-y-1"
            >
              <div className="relative aspect-[16/10]">
                <img
                  src={presale.image}
                  alt={presale.eventName}
                  width={1280}
                  height={800}
                  loading="lazy"
                  className="size-full object-cover"
                />
                <Badge className={`absolute top-3 left-3 ${statusStyles[presale.status]}`}>{presale.status}</Badge>
              </div>
              <div className="flex flex-1 flex-col gap-3 p-4">
                <h2 className="line-clamp-2 text-base font-bold">{presale.eventName}</h2>
                <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="size-3.5" /> {presale.city}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CalendarDays className="size-3.5" /> {formatShortDate(presale.date)}
                  </span>
                </p>
                <Progress value={percent} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {formatNaira(presale.raisedAmount)} raised of {formatNaira(presale.goalAmount)} · {percent}%
                </p>
                <div className="mt-auto flex items-end justify-between gap-3 pt-2">
                  <div>
                    <p className="text-[0.65rem] tracking-wide text-muted-foreground uppercase">Presale price</p>
                    <p className="font-display text-lg font-bold">{formatNaira(presale.presalePrice)}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">{presale.supporters} supporters</p>
                </div>
              </div>
            </Link>
          );
        })}
      </section>
    </>
  );
}
