import { createFileRoute } from "@tanstack/react-router";
import { Banknote, Wallet } from "lucide-react";
import { StatCard } from "@/components/shared/StatCard";
import { formatNaira } from "@/lib/format";
import { useAuth } from "@/lib/auth/auth-context";

export const Route = createFileRoute("/dashboard/wallet")({
  head: () => ({
    meta: [
      { title: "Wallet — Wanbiz EventPass" },
      {
        name: "description",
        content:
          "Fund your EventPass wallet in Naira, track holds and pay for tickets and invitations.",
      },
      { property: "og:title", content: "EventPass wallet" },
      { property: "og:description", content: "Naira balance, funding and transaction history." },
    ],
  }),
  component: WalletPage,
});

function WalletPage() {
  const { user } = useAuth();
  const balance = user?.walletBalance ?? 0;

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard
          label="Available balance"
          value={formatNaira(balance)}
          icon={Wallet}
          tone="blue"
        />
        <StatCard label="Currency" value="Nigerian Naira" icon={Banknote} />
      </div>

      <p className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
        Online wallet funding and transaction history are not connected yet. Your displayed balance
        reflects account adjustments made by support.
      </p>
    </div>
  );
}
