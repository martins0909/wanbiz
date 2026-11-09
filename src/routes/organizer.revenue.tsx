import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/organizer/revenue")({
  head: () => ({
    meta: [
      { title: "Revenue — Wanbiz EventPass Organizer" },
      {
        name: "description",
        content: "Track gross sales, platform fees and payouts in Nigerian Naira.",
      },
      { property: "og:title", content: "EventPass revenue reporting" },
      { property: "og:description", content: "Gross sales, fees and payouts in Naira." },
    ],
  }),
  component: OrganizerRevenue,
});

function OrganizerRevenue() {
  return (
    <div>
      <h2 className="text-lg font-bold">Revenue</h2>
      <div className="mt-5 rounded-xl border border-dashed border-border p-8 text-center">
        <p className="font-medium">Revenue reporting is not available yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Verified payment records are required before sales, fees, or payouts can be shown.
        </p>
      </div>
    </div>
  );
}
