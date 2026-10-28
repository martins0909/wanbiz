import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { BadgeCheck, ShieldAlert, Sparkles } from "lucide-react";
import { QrPlaceholder } from "@/components/shared/QrPlaceholder";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MEMBERSHIP_BENEFITS, membershipQuery } from "@/lib/data";
import { formatNaira, formatShortDate } from "@/lib/format";
import { useCheckout } from "@/lib/payments/use-checkout";
import { useAuth } from "@/lib/auth/auth-context";

export const Route = createFileRoute("/membership")({
  head: () => ({
    meta: [
      { title: "Permanent TicketPass Membership — Wanbiz EventPass" },
      {
        name: "description",
        content:
          "Become an EventPass member and receive your permanent digital TicketPass credential for use at eligible events that accept TicketPass members.",
      },
      { property: "og:title", content: "Get Your Permanent EventPass TicketPass" },
      {
        property: "og:description",
        content: "Permanent membership ID, digital card, membership QR code and fast check-in at eligible events.",
      },
    ],
  }),
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(membershipQuery());
  },
  component: MembershipPage,
});

function MembershipPage() {
  const { data: membership } = useSuspenseQuery(membershipQuery());
  const { isAuthenticated, user, membershipStatus } = useAuth();
  const checkout = useCheckout();
  const status = isAuthenticated ? membershipStatus : membership.status;

  return (
    <>
      <section className="relative overflow-hidden bg-graphite text-graphite-foreground">
        <div className="pointer-events-none absolute -top-20 right-0 size-80 rounded-full bg-brand-blue/25 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 py-14 lg:px-8 lg:py-20">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[0.7rem] font-semibold tracking-[0.18em] uppercase">
            <Sparkles className="size-3.5 text-brand-blue" /> TicketPass Membership
          </p>
          <h1 className="mt-5 max-w-3xl text-3xl font-bold sm:text-4xl lg:text-5xl">
            Get Your Permanent EventPass TicketPass
          </h1>
          <p className="mt-4 max-w-2xl text-sm text-graphite-foreground/80 sm:text-base">
            Become an EventPass member and receive your permanent digital TicketPass membership credential. Use it at
            eligible events that accept TicketPass members.
          </p>
          <div className="mt-7 flex flex-col gap-2.5 sm:flex-row">
            <Button
              size="lg"
              className="bg-gradient-brand text-primary-foreground"
              disabled={checkout.pending || status === "ACTIVE"}
              onClick={() => void checkout.buyMembership()}
            >
              {status === "ACTIVE" ? "You're a Member" : checkout.pending ? "Opening Paystack…" : "Become a Member"}
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
          <p className="mt-6 max-w-2xl rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-graphite-foreground/70">
            TicketPass is a membership and access credential. Each organizer or event decides whether TicketPass
            membership is accepted — it does not automatically guarantee entry to every EventPass event.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-12 lg:grid-cols-[1.3fr_1fr] lg:px-8">
        <div>
          <h2 className="text-2xl font-bold">Membership benefits</h2>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {MEMBERSHIP_BENEFITS.map((benefit) => (
              <li key={benefit} className="flex items-start gap-2.5 rounded-2xl border border-border bg-card p-4 text-sm">
                <BadgeCheck className="mt-0.5 size-4 shrink-0 text-brand-red" />
                {benefit}
              </li>
            ))}
          </ul>

          <div className="mt-8 rounded-2xl border border-border bg-card p-5">
            <h3 className="text-base font-bold">Membership status</h3>
            <div className="mt-4 space-y-3 text-sm">
              <StatusRow label="NOT A MEMBER" active={status === "NOT_A_MEMBER"} description="You have not activated a TicketPass yet." />
              <StatusRow label="ACTIVE" active={status === "ACTIVE"} description="Your permanent TicketPass is valid at eligible events." />
              <StatusRow
                label="SUSPENDED"
                active={status === "SUSPENDED"}
                description="Membership temporarily restricted. Contact support to restore it."
              />
            </div>
          </div>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="ticket-stub rounded-3xl bg-gradient-brand p-1 shadow-ticket">
            <div className="rounded-[1.4rem] bg-card p-6">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[0.65rem] tracking-[0.2em] text-muted-foreground uppercase">EventPass Permanent</p>
                  <p className="font-display text-xl font-bold">TicketPass</p>
                </div>
                <Badge className={status === "ACTIVE" ? "bg-brand-blue text-primary-foreground" : "bg-secondary text-secondary-foreground"}>
                  {status.replace(/_/g, " ")}
                </Badge>
              </div>
              <div className="mt-6 flex justify-center">
                <QrPlaceholder label={status === "ACTIVE" ? "Membership QR ready" : "QR issued after activation"} />
              </div>
              <dl className="mt-6 space-y-3 text-sm">
                <Row label="Member" value={status === "ACTIVE" ? (user?.fullName ?? "EventPass Member") : "—"} />
                <Row label="Membership ID" value={status === "ACTIVE" ? "EP-MEM-004821" : "—"} />
                <Row label="Date joined" value={status === "ACTIVE" ? formatShortDate(new Date().toISOString()) : "—"} />
                <Row label="Eligible events" value={`${membership.eligibleEventsCount}`} />
                <Row label="Membership fee" value={formatNaira(membership.price)} />
              </dl>
              <Button asChild variant="outline" className="mt-5 w-full">
                <Link to="/dashboard/membership">Open my membership</Link>
              </Button>
            </div>
          </div>
        </aside>
      </section>
    </>
  );
}

function StatusRow({ label, description, active }: { label: string; description: string; active: boolean }) {
  return (
    <div
      className={`grid grid-cols-[auto_minmax(0,1fr)] gap-3 rounded-xl border p-3 ${
        active ? "border-brand-red bg-brand-red/5" : "border-border"
      }`}
    >
      {active ? (
        <BadgeCheck className="mt-0.5 size-4 shrink-0 text-brand-red" />
      ) : (
        <ShieldAlert className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      )}
      <div className="min-w-0">
        <p className="text-xs font-bold tracking-wide">{label}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 border-b border-border pb-2 last:border-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="truncate font-medium">{value}</dd>
    </div>
  );
}
