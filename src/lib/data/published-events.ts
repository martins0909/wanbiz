import { createServerFn } from "@tanstack/react-start";
import type { EventCategorySlug, EventRecord } from "@/lib/types";

export const getPublishedEvents = createServerFn({ method: "GET" }).handler(async () => {
  const { getMongoDb } = await import("@/lib/server/mongodb");
  const db = await getMongoDb();
  const documents = await db
    .collection("events")
    .find(
      { status: "PUBLISHED" },
      {
        projection: {
          _id: 1,
          slug: 1,
          name: 1,
          description: 1,
          category: 1,
          image: 1,
          date: 1,
          time: 1,
          venue: 1,
          city: 1,
          organizerName: 1,
          acceptsTicketPass: 1,
          seatingEnabled: 1,
          ticketTypes: 1,
        },
      },
    )
    .sort({ updatedAt: -1 })
    .limit(100)
    .toArray();

  return documents.map((event): EventRecord => {
    const rawTickets = Array.isArray(event["ticketTypes"])
      ? (event["ticketTypes"] as Array<Record<string, unknown>>)
      : [];
    const ticketTypes = rawTickets.map((ticket) => ({
      id: String(ticket["id"] ?? ""),
      name: String(ticket["name"] ?? "Ticket"),
      price: Number(ticket["price"] ?? 0),
      quantity: Number(ticket["quantity"] ?? 0),
      sold: Number(ticket["sold"] ?? 0),
      perks: [],
    }));
    const rawDate = String(event["date"] ?? "");
    const rawTime = String(event["time"] ?? "");
    const timeParts = /^(\d{2}):(\d{2})$/.exec(rawTime);
    const hour = timeParts ? Number(timeParts[1]) : 0;
    const time = timeParts
      ? `${hour % 12 || 12}:${timeParts[2]} ${hour >= 12 ? "PM" : "AM"}`
      : rawTime;

    return {
      id: String(event["_id"] ?? ""),
      slug: String(event["slug"] ?? event["_id"] ?? ""),
      name: String(event["name"] ?? ""),
      description: String(event["description"] ?? ""),
      category: String(event["category"] ?? "entertainment") as EventCategorySlug,
      image: String(event["image"] ?? ""),
      date: /^\d{4}-\d{2}-\d{2}$/.test(rawDate) ? `${rawDate}T12:00:00` : rawDate,
      time,
      venue: String(event["venue"] ?? ""),
      city: String(event["city"] ?? ""),
      state: String(event["city"] ?? ""),
      organizerName: String(event["organizerName"] ?? "Organizer"),
      startingPrice: ticketTypes.length
        ? Math.min(...ticketTypes.map((ticket) => ticket.price))
        : 0,
      ticketsAvailable: ticketTypes.reduce(
        (total, ticket) => total + Math.max(0, ticket.quantity - ticket.sold),
        0,
      ),
      ticketsTotal: ticketTypes.reduce((total, ticket) => total + ticket.quantity, 0),
      featured: true,
      acceptsTicketPass: Boolean(event["acceptsTicketPass"]),
      seatingEnabled: Boolean(event["seatingEnabled"]),
      ticketTypes,
    };
  });
});
