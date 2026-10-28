import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/organizer/seating")({
  head: () => ({
    meta: [
      { title: "Seating — Wanbiz EventPass Organizer" },
      { name: "description", content: "Preview automatic seat allocation for events where seating is enabled." },
      { property: "og:title", content: "EventPass seating allocation" },
      { property: "og:description", content: "Automatic seat assignment at check-in for seated events." },
    ],
  }),
  component: OrganizerSeating,
});

const rows = ["A", "B", "C", "D", "E"];

function OrganizerSeating() {
  return (
    <div>
      <h2 className="text-lg font-bold">Seating</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        For events with seating enabled, a seat is assigned automatically when a guest checks in.
      </p>

      <div className="mt-5 rounded-2xl border border-border bg-card p-5">
        <div className="mb-5 flex flex-wrap gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-2">
            <span className="size-3 rounded bg-brand-blue" /> Assigned
          </span>
          <span className="flex items-center gap-2">
            <span className="size-3 rounded bg-secondary" /> Available
          </span>
          <span className="flex items-center gap-2">
            <span className="size-3 rounded bg-brand-red" /> Held
          </span>
        </div>
        <div className="space-y-2 overflow-x-auto">
          {rows.map((row, rowIndex) => (
            <div key={row} className="flex items-center gap-2">
              <span className="w-5 shrink-0 text-xs font-semibold text-muted-foreground">{row}</span>
              <div className="flex gap-1.5">
                {Array.from({ length: 12 }).map((_, index) => {
                  const seed = (rowIndex * 12 + index) % 7;
                  const tone = seed === 0 ? "bg-brand-red" : seed < 4 ? "bg-brand-blue" : "bg-secondary";
                  return <span key={index} className={`size-6 shrink-0 rounded ${tone}`} />;
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="mt-5 rounded-2xl border border-border bg-secondary/50 p-4 text-xs text-muted-foreground">
        Interactive seat maps and manual overrides arrive with the seat allocation service in the next stage.
      </p>
    </div>
  );
}
