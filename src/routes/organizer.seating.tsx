import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/organizer/seating")({
  head: () => ({
    meta: [
      { title: "Seating — Wanbiz EventPass Organizer" },
      {
        name: "description",
        content: "Preview automatic seat allocation for events where seating is enabled.",
      },
      { property: "og:title", content: "EventPass seating allocation" },
      {
        property: "og:description",
        content: "Automatic seat assignment at check-in for seated events.",
      },
    ],
  }),
  component: OrganizerSeating,
});

function OrganizerSeating() {
  return (
    <div>
      <h2 className="text-lg font-bold">Seating</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        For events with seating enabled, a seat is assigned automatically when a guest checks in.
      </p>

      <div className="mt-5 rounded-xl border border-dashed border-border p-8 text-center">
        <p className="font-medium">No seat assignments yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Assigned seats will appear here after ticketing and check-in are connected.
        </p>
      </div>
    </div>
  );
}
