import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { invitationsQuery } from "@/lib/data";
import { formatNaira, formatShortDate } from "@/lib/format";
import type { InvitationRecord, InvitationStatus } from "@/lib/types";

const statusStyles: Record<InvitationStatus, string> = {
  PENDING: "bg-secondary text-secondary-foreground",
  ACCEPTED: "bg-brand-blue text-primary-foreground",
  DECLINED: "bg-muted text-muted-foreground",
  EXPIRED: "bg-muted text-muted-foreground",
};

export const Route = createFileRoute("/dashboard/invitations")({
  head: () => ({
    meta: [
      { title: "Invitations — Wanbiz EventPass" },
      {
        name: "description",
        content: "Send event invitations from your EventPass wallet. You are charged only after the recipient accepts.",
      },
      { property: "og:title", content: "EventPass invitations" },
      { property: "og:description", content: "Invite friends and pay only when they accept." },
    ],
  }),
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(invitationsQuery());
  },
  component: InvitationsPage,
});

function InvitationsPage() {
  const { data: invitations } = useSuspenseQuery(invitationsQuery());
  const [busy, setBusy] = useState(false);
  const sent = invitations.filter((invite) => invite.direction === "SENT");
  const received = invitations.filter((invite) => invite.direction === "RECEIVED");

  function onSend(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      toast.success("Invitation queued", {
        description: "Your wallet will only be charged after your guest accepts.",
      });
      (event.target as HTMLFormElement).reset();
    }, 400);
  }

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-border bg-card p-5">
        <h2 className="text-lg font-bold">Invite a friend</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Send a ticket invitation using your wallet balance. The amount is held and only deducted after your guest
          accepts. If they decline or the invitation expires, nothing is charged.
        </p>
        <form onSubmit={onSend} className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="guestName">Guest name</Label>
            <Input id="guestName" name="guestName" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="guestContact">Email or phone</Label>
            <Input id="guestContact" name="guestContact" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="eventName">Event</Label>
            <Input id="eventName" name="eventName" placeholder="Event name" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Ticket amount (₦)</Label>
            <Input id="amount" name="amount" type="number" min={0} step={500} required />
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" disabled={busy} className="w-full bg-gradient-brand text-primary-foreground sm:w-auto">
              {busy ? "Sending…" : "Send invitation"}
            </Button>
          </div>
        </form>
      </section>

      <Tabs defaultValue="sent">
        <TabsList className="grid w-full grid-cols-2 sm:w-auto sm:grid-cols-none sm:inline-flex">
          <TabsTrigger value="sent">Sent ({sent.length})</TabsTrigger>
          <TabsTrigger value="received">Received ({received.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="sent" className="mt-4 space-y-3">
          {sent.map((invite) => (
            <InviteRow key={invite.id} invite={invite} />
          ))}
        </TabsContent>
        <TabsContent value="received" className="mt-4 space-y-3">
          {received.map((invite) => (
            <InviteRow key={invite.id} invite={invite} received />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function InviteRow({
  invite,
  received = false,
}: {
  invite: InvitationRecord;
  received?: boolean;
}) {
  return (
    <div className="grid gap-3 rounded-2xl border border-border bg-card p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
      <div className="min-w-0">
        <p className="truncate font-semibold">{invite.eventName}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {received ? "From" : "To"} {invite.recipientName} · {invite.recipientContact}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {formatNaira(invite.amount)} · {formatShortDate(invite.eventDate)}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Badge className={statusStyles[invite.status]}>{invite.status}</Badge>
        {received && invite.status === "PENDING" && (
          <>
            <Button size="sm" className="bg-gradient-brand text-primary-foreground" onClick={() => toast.success("Invitation accepted")}>
              Accept
            </Button>
            <Button size="sm" variant="outline" onClick={() => toast("Invitation declined")}>
              Decline
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
