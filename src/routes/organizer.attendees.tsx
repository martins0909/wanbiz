import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/organizer/attendees")({
  head: () => ({
    meta: [
      { title: "Attendees — Wanbiz EventPass Organizer" },
      {
        name: "description",
        content: "See who bought tickets, what they paid in Naira and their check-in status.",
      },
      { property: "og:title", content: "EventPass attendee list" },
      { property: "og:description", content: "Ticket holders, amounts paid and check-in status." },
    ],
  }),
  component: OrganizerAttendees,
});

function OrganizerAttendees() {
  return (
    <div>
      <h2 className="text-lg font-bold">Attendees</h2>
      <div className="mt-5 rounded-xl border border-dashed border-border p-8 text-center">
        <p className="font-medium">No attendee records yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Attendees will appear here after verified ticket purchases are connected.
        </p>
      </div>
    </div>
  );
}
