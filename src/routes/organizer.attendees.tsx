import { createFileRoute } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatNaira } from "@/lib/format";

export const Route = createFileRoute("/organizer/attendees")({
  head: () => ({
    meta: [
      { title: "Attendees — Wanbiz EventPass Organizer" },
      { name: "description", content: "See who bought tickets, what they paid in Naira and their check-in status." },
      { property: "og:title", content: "EventPass attendee list" },
      { property: "og:description", content: "Ticket holders, amounts paid and check-in status." },
    ],
  }),
  component: OrganizerAttendees,
});

const attendees = [
  { id: "a1", name: "Chidera Okoye", ticket: "VIP", amount: 75000, seat: "B12", status: "CHECKED IN" },
  { id: "a2", name: "Aisha Bello", ticket: "Regular", amount: 25000, seat: "—", status: "VALID" },
  { id: "a3", name: "Tunde Adeyemi", ticket: "Table for 5", amount: 350000, seat: "T3", status: "VALID" },
  { id: "a4", name: "Ngozi Eze", ticket: "Regular", amount: 25000, seat: "—", status: "CHECKED IN" },
  { id: "a5", name: "Samuel Ojo", ticket: "Early Bird", amount: 18000, seat: "—", status: "VALID" },
];

function OrganizerAttendees() {
  return (
    <div>
      <h2 className="text-lg font-bold">Attendees</h2>
      <p className="mt-1 text-sm text-muted-foreground">Sample list. Live attendee data arrives with the backend integration.</p>
      <Input placeholder="Search attendees by name or reference" className="mt-4 max-w-sm" />

      <div className="mt-5 overflow-hidden rounded-2xl border border-border bg-card">
        <div className="hidden grid-cols-[minmax(0,1fr)_120px_120px_90px_120px] gap-4 border-b border-border px-4 py-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase sm:grid">
          <span>Attendee</span>
          <span>Ticket</span>
          <span>Amount</span>
          <span>Seat</span>
          <span>Status</span>
        </div>
        {attendees.map((attendee) => (
          <div
            key={attendee.id}
            className="grid gap-1.5 border-b border-border px-4 py-3 last:border-0 sm:grid-cols-[minmax(0,1fr)_120px_120px_90px_120px] sm:items-center sm:gap-4"
          >
            <p className="truncate text-sm font-medium">{attendee.name}</p>
            <p className="text-xs text-muted-foreground">{attendee.ticket}</p>
            <p className="text-sm font-semibold">{formatNaira(attendee.amount)}</p>
            <p className="text-xs text-muted-foreground">{attendee.seat}</p>
            <Badge
              variant="outline"
              className={attendee.status === "CHECKED IN" ? "border-brand-blue text-brand-blue" : "text-muted-foreground"}
            >
              {attendee.status}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}
