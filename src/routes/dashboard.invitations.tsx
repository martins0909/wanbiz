import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { invitationsQuery } from "@/lib/data";

export const Route = createFileRoute("/dashboard/invitations")({
  head: () => ({
    meta: [
      { title: "Invitations — Wanbiz EventPass" },
      { name: "description", content: "View your EventPass invitations." },
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
  return (
    <div>
      <h2 className="text-lg font-bold">Invitations</h2>
      <div className="mt-5 rounded-xl border border-dashed border-border p-8 text-center">
        <p className="font-medium">
          {invitations.length ? "Invitations" : "No invitation records"}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Invitation sending and acceptance are not connected yet.
        </p>
      </div>
    </div>
  );
}
