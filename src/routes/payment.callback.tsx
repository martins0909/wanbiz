import { Link, createFileRoute } from "@tanstack/react-router";
import { CreditCard } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/payment/callback")({
  validateSearch: z.object({ reference: z.string().optional(), trxref: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "Payment Confirmation — Wanbiz EventPass" },
      { name: "description", content: "Confirming your Paystack payment for EventPass tickets or TicketPass membership." },
      { property: "og:title", content: "Payment Confirmation — Wanbiz EventPass" },
      { property: "og:description", content: "Your EventPass payment is being verified." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CallbackPage,
});

function CallbackPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <CreditCard className="mx-auto size-10 text-muted-foreground" />
      <h1 className="mt-4 text-2xl font-bold">Payments are not available yet</h1>
      <p className="mt-2 text-sm text-muted-foreground">No payment has been taken. Return to the event and try again later.</p>
      <Button asChild className="mt-6"><Link to="/events">Browse events</Link></Button>
    </div>
  );
}
