import { createFileRoute } from "@tanstack/react-router";
import { QrCode } from "lucide-react";
import { StatCard } from "@/components/shared/StatCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Users } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/organizer/check-in")({
  head: () => ({
    meta: [
      { title: "Check-in — Wanbiz EventPass Organizer" },
      { name: "description", content: "Scan EventPass QR tickets at the gate and track live entry counts." },
      { property: "og:title", content: "EventPass QR check-in" },
      { property: "og:description", content: "Scan tickets at the gate and monitor live entries." },
    ],
  }),
  component: OrganizerCheckIn,
});

function OrganizerCheckIn() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Checked in" value="1,248" icon={CheckCircle2} tone="blue" />
        <StatCard label="Expected" value="1,800" icon={Users} />
        <StatCard label="Scans last hour" value="312" icon={QrCode} tone="red" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="text-base font-bold">QR scanner</h2>
          <div className="mt-4 grid aspect-video place-items-center rounded-2xl border border-dashed border-border bg-secondary/50 text-center">
            <div className="px-6">
              <QrCode className="mx-auto size-12 text-foreground/60" strokeWidth={1.25} />
              <p className="mt-2 text-sm font-medium">Camera scanning coming next</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Live scanning activates with the check-in service in the next stage.
              </p>
            </div>
          </div>
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            toast.success("Reference recorded", { description: "Verification runs once check-in goes live." });
            (event.target as HTMLFormElement).reset();
          }}
          className="space-y-4 rounded-2xl border border-border bg-card p-5"
        >
          <h2 className="text-base font-bold">Manual check-in</h2>
          <div className="space-y-2">
            <Label htmlFor="reference">Ticket reference</Label>
            <Input id="reference" name="reference" placeholder="EP-TCK-000123" required />
          </div>
          <Button type="submit" className="bg-gradient-brand text-primary-foreground">
            Check in guest
          </Button>
          <p className="text-xs text-muted-foreground">
            Where seating is enabled, a seat is assigned automatically at check-in.
          </p>
        </form>
      </div>
    </div>
  );
}
