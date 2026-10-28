import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { walletQuery } from "@/lib/data";
import { formatNaira, formatShortDate } from "@/lib/format";

export const Route = createFileRoute("/dashboard/transactions")({
  head: () => ({
    meta: [
      { title: "Transactions — Wanbiz EventPass" },
      { name: "description", content: "Every EventPass payment, wallet top-up, invitation charge and refund in Naira." },
      { property: "og:title", content: "EventPass transactions" },
      { property: "og:description", content: "Full payment and wallet history in Naira." },
    ],
  }),
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(walletQuery());
  },
  component: TransactionsPage,
});

function TransactionsPage() {
  const { data: wallet } = useSuspenseQuery(walletQuery());

  return (
    <div>
      <h2 className="text-lg font-bold">Transaction history</h2>
      <p className="mt-1 text-sm text-muted-foreground">All amounts are in Nigerian Naira (₦).</p>

      <div className="mt-5 overflow-hidden rounded-2xl border border-border bg-card">
        <div className="hidden grid-cols-[minmax(0,1fr)_120px_120px_110px] gap-4 border-b border-border px-4 py-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase sm:grid">
          <span>Description</span>
          <span>Type</span>
          <span>Amount</span>
          <span>Status</span>
        </div>
        {wallet.transactions.map((transaction) => (
          <div
            key={transaction.id}
            className="grid gap-2 border-b border-border px-4 py-3 last:border-0 sm:grid-cols-[minmax(0,1fr)_120px_120px_110px] sm:items-center sm:gap-4"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{transaction.description}</p>
              <p className="text-xs text-muted-foreground">{formatShortDate(transaction.createdAt)}</p>
            </div>
            <p className="text-xs text-muted-foreground">{transaction.type.replace(/_/g, " ")}</p>
            <p className={`text-sm font-semibold ${transaction.direction === "CREDIT" ? "text-brand-blue" : "text-brand-red"}`}>
              {transaction.direction === "CREDIT" ? "+" : "−"}
              {formatNaira(transaction.amount)}
            </p>
            <Badge
              variant="outline"
              className={transaction.status === "PAID" ? "border-brand-blue text-brand-blue" : "text-muted-foreground"}
            >
              {transaction.status}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}
