import { createFileRoute } from "@tanstack/react-router";
import type { Document } from "mongodb";
import { currentUser } from "@/lib/server/auth";
import { getMongoDb } from "@/lib/server/mongodb";

interface OrganizerEventDocument extends Document {
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
  createdAt: Date;
}

export const Route = createFileRoute("/api/organizer")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const user = await currentUser(request);
          if (!user)
            return Response.json({ error: "Sign in to view your events." }, { status: 401 });

          const db = await getMongoDb();
          const events = await db
            .collection<OrganizerEventDocument>("events")
            .find(
              { ownerId: user.id },
              {
                projection: {
                  _id: 1,
                  slug: 1,
                  name: 1,
                  category: 1,
                  date: 1,
                  time: 1,
                  venue: 1,
                  city: 1,
                  description: 1,
                  image: 1,
                  status: 1,
                  ticketTypes: 1,
                  createdAt: 1,
                },
              },
            )
            .sort({ createdAt: -1 })
            .limit(100)
            .toArray();
          return Response.json({ events });
        } catch (error) {
          console.error("Organizer events could not be loaded:", error);
          return Response.json(
            { error: "Your events are temporarily unavailable." },
            { status: 503 },
          );
        }
      },
    },
  },
});
