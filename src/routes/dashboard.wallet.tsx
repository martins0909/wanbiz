import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowDownLeft, ArrowUpRight, Clock, Wallet } from "lucide-react";
import { StatCard } from "@/components/shared/StatCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { walletQuery } from "@/lib/data";
import { formatNaira, formatShortDate } from "@/lib/format";
import { notifyPaymentsComingSoon } from "@/lib/payments/notify";

export const Route = createFileRoute("/dashboard/wallet")({
  head: () => ({
    meta: [
      { title: "Wallet — Wanbiz EventPass" },
      { name: "description", content: "Fund your EventPass wallet in Naira, track holds and pay for tickets and invitations." },
      { property: "og:title", content: "EventPass wallet" },
      { property: "og:description", content: "Naira balance, funding and transaction history." },
    ],
  }),
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(walletQuery());
  },
  component: WalletPage,
});

function WalletPage() {
  const { data: wallet } = useSuspenseQuery(walletQuery());

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Available balance" value={formatNaira(wallet.balance)} icon={Wallet} tone="blue" />
        <StatCard label="Held for invitations" value={formatNaira(wallet.pendingHold)} icon={Clock} tone="red" hint="Charged only on acceptance" />
        <StatCard label="Currency" value="Nigerian Naira" icon={ArrowUpRight} />
      </div>

      <section className="rounded-2xl border border-border bg-card p-5">
        <h2 className="text-lg font-bold">Fund your wallet</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Top up with a card or bank transfer through Paystack, then pay for tickets and invitations instantly.
        </p>
        <form
          className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end"
          onSubmit={(event) => {
            event.preventDefault();
            notifyPaymentsComingSoon("WALLET_FUNDING", "Your funding request has been saved.");
          }}
        >
          <div className="w-full space-y-2 sm:max-w-xs">
            <Label htmlFor="amount">Amount (₦)</Label>
            <Input id="amount" name="amount" type="number" min={1000} step={500} placeholder="10000" required />
          </div>
          <Button type="submit" className="bg-gradient-brand text-primary-foreground">
            Fund wallet
          </Button>
        </form>
      </section>

      <section>
        <h2 className="text-lg font-bold">Recent activity</h2>
        <div className="mt-4 space-y-3">
          {wallet.transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-border bg-card p-4"
            >
              <span
                className={`grid size-9 shrink-0 place-items-center rounded-xl ${
                  transaction.direction === "CREDIT" ? "bg-brand-blue/10 text-brand-blue" : "bg-brand-red/10 text-brand-red"
                }`}
              >
                {transaction.direction === "CREDIT" ? <ArrowDownLeft className="size-4" /> : <ArrowUpRight className="size-4" />}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{transaction.description}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {formatShortDate(transaction.createdAt)} · {transaction.status}
                </p>
              </div>
              <p className={`text-sm font-bold ${transaction.direction === "CREDIT" ? "text-brand-blue" : "text-brand-red"}`}>
                {transaction.direction === "CREDIT" ? "+" : "−"}
                {formatNaira(transaction.amount)}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
