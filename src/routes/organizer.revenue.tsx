import { createFileRoute } from "@tanstack/react-router";
import { BarChart3, Banknote, TrendingUp } from "lucide-react";
import { StatCard } from "@/components/shared/StatCard";
import { formatNaira } from "@/lib/format";

export const Route = createFileRoute("/organizer/revenue")({
  head: () => ({
    meta: [
      { title: "Revenue — Wanbiz EventPass Organizer" },
      { name: "description", content: "Track gross sales, platform fees and payouts in Nigerian Naira." },
      { property: "og:title", content: "EventPass revenue reporting" },
      { property: "og:description", content: "Gross sales, fees and payouts in Naira." },
    ],
  }),
  component: OrganizerRevenue,
});

const breakdown = [
  { label: "Ticket sales", amount: 8450000 },
  { label: "Presale sponsorship", amount: 1250000 },
  { label: "Invitations accepted", amount: 320000 },
  { label: "Platform fees", amount: -505000 },
];

const monthly = [
  { month: "Apr", value: 42 },
  { month: "May", value: 58 },
  { month: "Jun", value: 71 },
  { month: "Jul", value: 64 },
  { month: "Aug", value: 88 },
  { month: "Sep", value: 96 },
];

function OrganizerRevenue() {
  const gross = breakdown.filter((row) => row.amount > 0).reduce((total, row) => total + row.amount, 0);
  const net = breakdown.reduce((total, row) => total + row.amount, 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Gross revenue" value={formatNaira(gross)} icon={TrendingUp} tone="red" />
        <StatCard label="Net payable" value={formatNaira(net)} icon={Banknote} tone="blue" />
        <StatCard label="Settlement" value="Weekly" icon={BarChart3} hint="Paystack payouts" />
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <h2 className="text-base font-bold">Monthly sales trend</h2>
        <div className="mt-5 flex h-40 items-end gap-3">
          {monthly.map((point) => (
            <div key={point.month} className="flex min-w-0 flex-1 flex-col items-center gap-2">
              <div className="w-full rounded-t-lg bg-gradient-brand" style={{ height: `${point.value}%` }} />
              <span className="text-xs text-muted-foreground">{point.month}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <h2 className="text-base font-bold">Breakdown</h2>
        <dl className="mt-4 space-y-2.5 text-sm">
          {breakdown.map((row) => (
            <div key={row.label} className="flex justify-between gap-3 border-b border-border pb-2 last:border-0">
              <dt className="text-muted-foreground">{row.label}</dt>
              <dd className={`font-semibold ${row.amount < 0 ? "text-brand-red" : ""}`}>{formatNaira(row.amount)}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
