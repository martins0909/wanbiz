import { createFileRoute } from "@tanstack/react-router";
import { QrCode } from "lucide-react";

export const Route = createFileRoute("/organizer/check-in")({
  head: () => ({
    meta: [
      { title: "Check-in — Wanbiz EventPass Organizer" },
      {
        name: "description",
        content: "Scan EventPass QR tickets at the gate and track live entry counts.",
      },
      { property: "og:title", content: "EventPass QR check-in" },
      { property: "og:description", content: "Scan tickets at the gate and monitor live entries." },
    ],
  }),
  component: OrganizerCheckIn,
});

function OrganizerCheckIn() {
  return (
    <div>
      <h2 className="text-lg font-bold">Check-in</h2>
      <div className="mt-5 rounded-xl border border-dashed border-border p-8 text-center">
        <QrCode className="mx-auto size-9 text-muted-foreground" />
        <p className="mt-3 font-medium">Check-in is not connected yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Guest validation and entry counts will appear here when ticket issuance and check-in are
          available.
        </p>
      </div>
    </div>
  );
}
