import { queryOptions } from "@tanstack/react-query";
import type {
  EventCategorySlug,
  EventRecord,
  InvitationRecord,
  MembershipRecord,
  PresaleCampaign,
  TicketRecord,
  WalletRecord,
} from "@/lib/types";
import { getPublishedEvents } from "./published-events";
import { CATEGORIES, EVENTS, MEMBERSHIP, PRESALES } from "./mock";

/** Repository layer for the current seeded public catalog. */

export interface EventFilters {
  query?: string;
  location?: string;
  date?: string;
  category?: EventCategorySlug | "all";
}

export async function listEvents(filters: EventFilters = {}): Promise<EventRecord[]> {
  const publishedEvents = await getCatalogEvents();
  const q = filters.query?.trim().toLowerCase();
  const loc = filters.location?.trim().toLowerCase();
  return [...publishedEvents, ...EVENTS].filter((event) => {
    if (q && !`${event.name} ${event.description} ${event.organizerName}`.toLowerCase().includes(q))
      return false;
    if (loc && !`${event.city} ${event.state} ${event.venue}`.toLowerCase().includes(loc))
      return false;
    if (filters.date && !event.date.startsWith(filters.date)) return false;
    if (filters.category && filters.category !== "all" && event.category !== filters.category) return false;
    return true;
  });
}

export async function listFeaturedEvents(): Promise<EventRecord[]> {
  return [...(await getCatalogEvents()), ...EVENTS.filter((event) => event.featured)];
}

export async function getEvent(idOrSlug: string): Promise<EventRecord | null> {
  const seededEvent = EVENTS.find((event) => event.id === idOrSlug || event.slug === idOrSlug);
  if (seededEvent) return seededEvent;
  return (
    (await getCatalogEvents()).find((event) => event.id === idOrSlug || event.slug === idOrSlug) ??
    null
  );
}

export async function listCategories() {
  const events = await listEvents();
  return CATEGORIES.map((category) => ({
    ...category,
    eventCount: events.filter((event) => event.category === category.slug).length,
  }));
}

async function getCatalogEvents(): Promise<EventRecord[]> {
  try {
    const publishedEvents = await getPublishedEvents();
    return publishedEvents.map((event) => ({
      ...event,
      image:
        event.image ||
        EVENTS.find((seededEvent) => seededEvent.category === event.category)?.image ||
        EVENTS[0]!.image,
    }));
  } catch {
    return [];
  }
}

export async function listPresales(): Promise<PresaleCampaign[]> {
  return PRESALES;
}

export async function getPresale(id: string): Promise<PresaleCampaign | null> {
  return PRESALES.find((presale) => presale.id === id) ?? null;
}

export async function listTickets(): Promise<TicketRecord[]> {
  return [];
}

export async function getTicket(_id: string): Promise<TicketRecord | null> {
  return null;
}

export async function listInvitations(): Promise<InvitationRecord[]> {
  return [];
}

export async function getWallet(): Promise<WalletRecord> {
  return { balance: 0, pendingHold: 0, currency: "NGN", transactions: [] };
}

export async function getMembership(): Promise<MembershipRecord> {
  return {
    ...MEMBERSHIP,
    membershipId: null,
    memberName: null,
    joinedAt: null,
    eligibleEventsCount: 0,
    history: [],
  };
}

/* ------------------------------- query keys ------------------------------- */

export const eventsQuery = (filters: EventFilters = {}) =>
  queryOptions({ queryKey: ["events", filters], queryFn: () => listEvents(filters) });

export const featuredEventsQuery = () =>
  queryOptions({ queryKey: ["events", "featured"], queryFn: listFeaturedEvents });

export const eventQuery = (idOrSlug: string) =>
  queryOptions({ queryKey: ["event", idOrSlug], queryFn: () => getEvent(idOrSlug) });

export const categoriesQuery = () => queryOptions({ queryKey: ["categories"], queryFn: listCategories });

export const presalesQuery = () => queryOptions({ queryKey: ["presales"], queryFn: listPresales });

export const presaleQuery = (id: string) =>
  queryOptions({ queryKey: ["presale", id], queryFn: () => getPresale(id) });

export const ticketsQuery = () => queryOptions({ queryKey: ["tickets"], queryFn: listTickets });

export const ticketQuery = (id: string) =>
  queryOptions({ queryKey: ["ticket", id], queryFn: () => getTicket(id) });


export const invitationsQuery = () => queryOptions({ queryKey: ["invitations"], queryFn: listInvitations });

export const walletQuery = () => queryOptions({ queryKey: ["wallet"], queryFn: getWallet });

export const membershipQuery = () => queryOptions({ queryKey: ["membership"], queryFn: getMembership });

export { CATEGORIES, MEMBERSHIP_BENEFITS } from "./mock";
