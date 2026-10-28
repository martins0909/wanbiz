import { randomUUID } from "node:crypto";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { currentUser } from "@/lib/server/auth";
import { uploadEventImage } from "@/lib/server/cloudinary";
import { getMongoDb } from "@/lib/server/mongodb";

const eventSchema = z.object({
  name: z.string().trim().min(3).max(160),
  category: z.enum([
    "concerts",
    "parties",
    "conferences",
    "weddings",
    "sports",
    "business",
    "entertainment",
    "religious",
    "networking",
  ]),
  date: z.string().date(),
  time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  venue: z.string().trim().min(2).max(180),
  city: z.string().trim().min(2).max(100),
  description: z.string().trim().min(20).max(5000),
  acceptsTicketPass: z.boolean(),
  seatingEnabled: z.boolean(),
  presale: z.boolean(),
  ticketTypes: z
    .array(
      z.object({
        name: z.string().trim().min(2).max(80),
        price: z.number().finite().min(0).max(100_000_000),
        quantity: z.number().int().min(1).max(1_000_000),
      }),
    )
    .min(1)
    .max(30),
});

export const Route = createFileRoute("/api/events")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const origin = request.headers.get("origin");
        if (origin && origin !== new URL(request.url).origin) {
          return Response.json({ error: "Request origin is not allowed." }, { status: 403 });
        }

        try {
          const user = await currentUser(request);
          if (!user)
            return Response.json({ error: "Sign in to create an event." }, { status: 401 });

          const formData = await request.formData();
          const eventPayload = formData.get("event");
          if (typeof eventPayload !== "string") {
            return Response.json({ error: "Check the event details and try again." }, { status: 400 });
          }

          let eventInput: unknown;
          try {
            eventInput = JSON.parse(eventPayload);
          } catch {
            return Response.json({ error: "Check the event details and try again." }, { status: 400 });
          }
          const parsed = eventSchema.safeParse(eventInput);
          if (!parsed.success)
            return Response.json(
              { error: "Check the event details and try again." },
              { status: 400 },
            );

          const data = parsed.data;
          const imageFile = formData.get("image");
          if (imageFile !== null && !(imageFile instanceof File)) {
            return Response.json({ error: "Choose a valid image file." }, { status: 400 });
          }
          const image = imageFile instanceof File ? await uploadEventImage(imageFile) : "";
          const db = await getMongoDb();
          const eventId = randomUUID();
          const slugBase = data.name
            .normalize("NFKD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "")
            .slice(0, 100);
          const now = new Date();
          await db.collection("events").insertOne({
            _id: eventId,
            slug: `${slugBase}-${eventId.slice(0, 8)}`,
            ownerId: user.id,
            ownerEmail: user.email,
            name: data.name,
            category: data.category,
            date: data.date,
            time: data.time,
            venue: data.venue,
            city: data.city,
            description: data.description,
            acceptsTicketPass: data.acceptsTicketPass,
            seatingEnabled: data.seatingEnabled,
            presale: data.presale,
            image,
            status: "DRAFT",
            ticketTypes: data.ticketTypes.map((ticket) => ({
              id: randomUUID(),
              name: ticket.name,
              price: ticket.price,
              quantity: ticket.quantity,
              sold: 0,
            })),
            createdAt: now,
            updatedAt: now,
          });
          return Response.json({ id: eventId, status: "DRAFT" }, { status: 201 });
        } catch (error) {
          console.error("Event creation failed:", error);
          return Response.json({ error: "We could not save this event." }, { status: 503 });
        }
      },
    },
  },
});
