import { Link, createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How EventPass Works — Wanbiz EventPass" },
      {
        name: "description",
        content:
          "How to discover events, buy tickets in Naira, invite friends, fund your wallet, support presales and use your TicketPass membership.",
      },
      { property: "og:title", content: "How EventPass Works" },
      { property: "og:description", content: "Tickets, invitations, wallet, presales, TicketPass membership and QR check-in explained." },
    ],
  }),
  component: HowItWorksPage,
});

const attendeeSteps = [
  { title: "Discover events", body: "Search by event name, city or date, or browse the nine EventPass categories." },
  { title: "Buy your ticket", body: "Pay in Naira with Paystack or from your EventPass wallet balance." },
  { title: "Receive a digital ticket", body: "Your ticket, receipt and QR code appear in My Tickets immediately after payment verification." },
  { title: "Invite friends", body: "Send an invitation from your wallet. You are charged only after the recipient accepts." },
  { title: "Check in with QR", body: "Scan at the gate. Where seating is supported, a seat is automatically assigned at check-in." },
];

const organizerSteps = [
  { title: "Create your event", body: "Add event details, ticket types, pricing and capacity." },
  { title: "Decide on TicketPass", body: "Choose whether your event accepts EventPass TicketPass members." },
  { title: "Run a presale campaign", body: "Raise early revenue and issue presale tickets after payment verification." },
  { title: "Manage attendees and seats", body: "Track orders, allocate seating and monitor revenue in Naira." },
  { title: "Scan at the door", body: "Check in attendees with QR scanning and see live entry counts." },
];

const faqs = [
  {
    q: "Does TicketPass membership guarantee entry to every event?",
    a: "No. TicketPass is a membership and access credential. Each organizer or event decides whether TicketPass membership is accepted.",
  },
  {
    q: "When is my wallet charged for an invitation?",
    a: "Only after the recipient accepts. Until then the amount is held, not deducted.",
  },
  {
    q: "When do I get a presale ticket?",
    a: "After your presale payment is successfully verified against the campaign.",
  },
  { q: "Which currency is used?", a: "All prices, wallet balances and payouts are in Nigerian Naira (₦)." },
];


function HowItWorksPage() {
  return (
    <>
      <PageHeader
        eyebrow="How it works"
        title="Discover. Buy. Invite. Experience."
        description="EventPass covers the full journey — from finding an event to walking through the gate with a QR ticket."
        actions={
          <>
            <Button asChild size="lg" className="bg-gradient-brand text-primary-foreground">
              <Link to="/events">Explore Events</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/25 bg-transparent text-graphite-foreground hover:bg-white/10 hover:text-graphite-foreground"
            >
              <Link to="/create-event">Create an Event</Link>
            </Button>
          </>
        }
      />

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-12 lg:grid-cols-2 lg:px-8">
        <div>
          <h2 className="text-2xl font-bold">For attendees</h2>
          <ol className="mt-5 space-y-3">
            {attendeeSteps.map((step, index) => (
              <li key={step.title} className="grid grid-cols-[auto_minmax(0,1fr)] gap-3 rounded-2xl border border-border bg-card p-4">
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-gradient-brand text-xs font-bold text-primary-foreground">
                  {index + 1}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold">{step.title}</span>
                  <span className="mt-1 block text-sm text-muted-foreground">{step.body}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
        <div>
          <h2 className="text-2xl font-bold">For organizers</h2>
          <ol className="mt-5 space-y-3">
            {organizerSteps.map((step, index) => (
              <li key={step.title} className="grid grid-cols-[auto_minmax(0,1fr)] gap-3 rounded-2xl border border-border bg-card p-4">
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-brand-blue text-xs font-bold text-primary-foreground">
                  {index + 1}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold">{step.title}</span>
                  <span className="mt-1 block text-sm text-muted-foreground">{step.body}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 pb-16 lg:px-8">
        <h2 className="text-2xl font-bold">Frequently asked</h2>
        <dl className="mt-5 space-y-3">
          {faqs.map((faq) => (
            <div key={faq.q} className="rounded-2xl border border-border bg-card p-4">
              <dt className="text-sm font-semibold">{faq.q}</dt>
              <dd className="mt-1.5 text-sm text-muted-foreground">{faq.a}</dd>
            </div>
          ))}
        </dl>
      </section>
    </>
  );
}
