import { queryOptions } from "@tanstack/react-query";

export interface OrganizerEvent {
  _id: string;
  slug: string;
  name: string;
  category: string;
  date: string;
  time: string;
  venue: string;
  city: string;
  description: string;
  image: string;
  status: "DRAFT" | "PUBLISHED" | "CANCELLED";
  ticketTypes: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    sold: number;
  }>;
}

async function listOrganizerEvents(): Promise<OrganizerEvent[]> {
  const response = await fetch("/api/organizer", { credentials: "same-origin" });
  const result = (await response.json()) as { events?: OrganizerEvent[]; error?: string };
  if (!response.ok) throw new Error(result.error || "Could not load your events.");
  return result.events ?? [];
}

export const organizerEventsQuery = () =>
  queryOptions({ queryKey: ["organizer", "events"], queryFn: listOrganizerEvents });
