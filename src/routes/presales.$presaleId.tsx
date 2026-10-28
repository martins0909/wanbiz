import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { CalendarDays, MapPin, ShieldCheck, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { presaleQuery } from "@/lib/data";
import { formatNaira, formatShortDate } from "@/lib/format";
import { notifyPaymentsComingSoon } from "@/lib/payments/notify";

export const Route = createFileRoute("/presales/$presaleId")({
  loader: async ({ context, params }) => {
    const presale = await context.queryClient.ensureQueryData(presaleQuery(params.presaleId));
    if (!presale) throw notFound();
    return { name: presale.eventName, description: presale.description };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Presale unavailable — Wanbiz EventPass" }, { name: "robots", content: "noindex" }] };
    }
    return {
      meta: [
        { title: `${loaderData.name} Presale — Wanbiz EventPass` },
        { name: "description", content: loaderData.description.slice(0, 155) },
        { property: "og:title", content: `${loaderData.name} Presale — Wanbiz EventPass` },
        { property: "og:description", content: loaderData.description.slice(0, 155) },
      ],
    };
  },
  component: PresaleDetailPage,
  notFoundComponent: () => (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="text-2xl font-bold">Presale campaign not found</h1>
      <Button asChild className="mt-6 bg-gradient-brand text-primary-foreground">
        <Link to="/presales">Explore presales</Link>
      </Button>
    </div>
  ),
});

function PresaleDetailPage() {
  const { presaleId } = Route.useParams();
  const { data: presale } = useSuspenseQuery(presaleQuery(presaleId));
  if (!presale) return null;

  const percent = Math.min(100, Math.round((presale.raisedAmount / presale.goalAmount) * 100));
  const canSupport = presale.status === "LIVE";

  return (
    <>
      <section className="relative bg-graphite text-graphite-foreground">
        <img
          src={presale.image}
          alt={presale.eventName}
          width={1280}
          height={800}
          className="absolute inset-0 size-full object-cover opacity-25"
        />
        <div className="relative mx-auto max-w-7xl px-4 py-14 lg:px-8">
          <Badge className="bg-brand-red text-primary-foreground">{presale.status}</Badge>
          <h1 className="mt-4 max-w-3xl text-3xl font-bold sm:text-4xl">{presale.eventName}</h1>
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-graphite-foreground/80">
            <span className="flex items-center gap-2">
              <MapPin className="size-4" /> {presale.city}
            </span>
            <span className="flex items-center gap-2">
              <CalendarDays className="size-4" /> {formatShortDate(presale.date)}
            </span>
            <span className="flex items-center gap-2">
              <Users className="size-4" /> {presale.supporters} supporters
            </span>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-10 lg:grid-cols-[1.4fr_1fr] lg:px-8">
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold">About this campaign</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{presale.description}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5">
            <h2 className="text-base font-bold">How presale sponsorship works</h2>
            <ol className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>1. Choose the presale ticket and pay the presale price.</li>
              <li>2. Your payment is verified against the campaign.</li>
              <li>3. Your digital ticket with QR code is issued once verification succeeds.</li>
              <li>4. If a campaign closes without funding, verified contributions are refunded.</li>
            </ol>
          </div>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="ticket-stub rounded-2xl border border-border bg-card p-5 shadow-ticket">
            <Progress value={percent} className="h-2.5" />
            <p className="mt-3 font-display text-2xl font-bold">{formatNaira(presale.raisedAmount)}</p>
            <p className="text-xs text-muted-foreground">
              raised of {formatNaira(presale.goalAmount)} goal · closes {formatShortDate(presale.closesOn)}
            </p>
            <div className="mt-5 rounded-xl bg-secondary/60 p-3">
              <p className="text-xs tracking-wide text-muted-foreground uppercase">Presale ticket</p>
              <p className="font-display text-xl font-bold">
                {formatNaira(presale.presalePrice)}{" "}
                <span className="text-sm font-normal text-muted-foreground line-through">
                  {formatNaira(presale.regularPrice)}
                </span>
              </p>
            </div>
            <Button
              size="lg"
              disabled={!canSupport}
              className="mt-4 w-full bg-gradient-brand text-primary-foreground"
              onClick={() => notifyPaymentsComingSoon("PRESALE_CONTRIBUTION", `${presale.eventName} presale support saved.`)}
            >
              {canSupport ? "Support this presale" : "Presale not open"}
            </Button>
            <p className="mt-4 flex gap-2 text-[0.7rem] leading-relaxed text-muted-foreground">
              <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-brand-blue" />
              Tickets are issued only after successful payment verification.
            </p>
          </div>
        </aside>
      </section>
    </>
  );
}
