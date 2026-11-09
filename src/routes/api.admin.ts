import { createFileRoute } from "@tanstack/react-router";
import type { Document } from "mongodb";
import { z } from "zod";
import { currentUser } from "@/lib/server/auth";
import { getMongoDb } from "@/lib/server/mongodb";
import { isAllowedRequestOrigin } from "@/lib/server/origin";

const mutationSchema = z.discriminatedUnion("resource", [
  z.object({
    resource: z.literal("user"),
    id: z.string().uuid(),
    status: z.enum(["ACTIVE", "SUSPENDED"]),
  }),
  z.object({
    resource: z.literal("event"),
    id: z.string().uuid(),
    status: z.enum(["DRAFT", "PUBLISHED", "CANCELLED"]),
  }),
  z.object({
    resource: z.literal("wallet"),
    id: z.string().uuid(),
    operation: z.enum(["CREDIT", "DEBIT"]),
    amount: z.number().int().positive().max(100_000_000),
    note: z.string().trim().min(3).max(200),
  }),
]);

const PAGE_SIZE = 20;

interface AdminUserDocument extends Document {
  _id: string;
  role: string;
  fullName: string;
  email: string;
  phone: string;
  status: string;
  organizationName?: string;
  createdAt: Date;
  walletBalance: number;
  walletAdjustments: Array<{
    id: string;
    operation: "CREDIT" | "DEBIT";
    amount: number;
    note: string;
    adminId: string;
    createdAt: Date;
  }>;
}

interface AdminEventDocument extends Document {
  _id: string;
  ownerId: string;
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
  acceptsTicketPass: boolean;
  seatingEnabled: boolean;
  presale: boolean;
  ticketTypes: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    sold: number;
  }>;
  createdAt: Date;
}

export const Route = createFileRoute("/api/admin")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const admin = await requireAdmin(request);
        if (admin instanceof Response) return admin;

        const db = await getMongoDb();
        const url = new URL(request.url);
        const section = url.searchParams.get("section") ?? "overview";
        if (section === "overview") {
          const [users, events, payments, paidPayments] = await Promise.all([
            db.collection("users").countDocuments(),
            db.collection("events").countDocuments(),
            db.collection("payments").countDocuments(),
            db.collection("payments").countDocuments({ status: "SUCCESS" }),
          ]);
          return Response.json({ users, events, payments, paidPayments });
        }
        if (section === "users") {
          const page = parsePage(url.searchParams.get("page"));
          const search = url.searchParams.get("q")?.trim().slice(0, 120) ?? "";
          const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
          const filter = search
            ? {
                $or: [
                  { fullName: { $regex: escapedSearch, $options: "i" } },
                  { email: { $regex: escapedSearch, $options: "i" } },
                ],
              }
            : {};
          const usersCollection = db.collection<AdminUserDocument>("users");
          const [total, users] = await Promise.all([
            usersCollection.countDocuments(filter),
            usersCollection
              .find(filter, { projection: { passwordHash: 0, walletAdjustments: 0 } })
              .sort({ createdAt: -1 })
              .skip((page - 1) * PAGE_SIZE)
              .limit(PAGE_SIZE)
              .toArray(),
          ]);
          return Response.json({ users, page, pageSize: PAGE_SIZE, total });
        }
        if (section === "organizer") {
          const organizerId = url.searchParams.get("id") ?? "";
          if (!z.string().uuid().safeParse(organizerId).success) {
            return Response.json({ error: "Invalid organizer." }, { status: 400 });
          }
          try {
            const [organizer, events] = await Promise.all([
              db.collection<AdminUserDocument>("users").findOne(
                { _id: organizerId, role: "ORGANIZER" },
                {
                  projection: {
                    passwordHash: 0,
                    walletAdjustments: 0,
                  },
                },
              ),
              db
                .collection<AdminEventDocument>("events")
                .find(
                  { ownerId: organizerId },
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
                      acceptsTicketPass: 1,
                      seatingEnabled: 1,
                      presale: 1,
                      ticketTypes: 1,
                      createdAt: 1,
                    },
                  },
                )
                .sort({ createdAt: -1 })
                .limit(100)
                .toArray(),
            ]);
            if (!organizer) {
              return Response.json({ error: "Organizer not found." }, { status: 404 });
            }
            const ticketsSold = events.reduce(
              (total, event) =>
                total + (event.ticketTypes ?? []).reduce((count, ticket) => count + ticket.sold, 0),
              0,
            );
            const ticketCapacity = events.reduce(
              (total, event) =>
                total +
                (event.ticketTypes ?? []).reduce((count, ticket) => count + ticket.quantity, 0),
              0,
            );
            return Response.json({
              organizer,
              events,
              summary: {
                totalEvents: events.length,
                publishedEvents: events.filter((event) => event.status === "PUBLISHED").length,
                ticketsSold,
                ticketCapacity,
              },
            });
          } catch (error) {
            console.error("Organizer console details could not be loaded:", error);
            return Response.json(
              { error: "Organizer console details are temporarily unavailable." },
              { status: 503 },
            );
          }
        }
        if (section === "attendee") {
          const attendeeId = url.searchParams.get("id") ?? "";
          if (!z.string().uuid().safeParse(attendeeId).success) {
            return Response.json({ error: "Invalid attendee." }, { status: 400 });
          }
          try {
            const attendee = await db
              .collection<AdminUserDocument>("users")
              .findOne({ _id: attendeeId, role: "ATTENDEE" }, { projection: { passwordHash: 0 } });
            if (!attendee) {
              return Response.json({ error: "Attendee not found." }, { status: 404 });
            }
            return Response.json({
              attendee: {
                _id: attendee._id,
                fullName: attendee.fullName,
                email: attendee.email,
                phone: attendee.phone,
                status: attendee.status,
                walletBalance: attendee.walletBalance ?? 0,
                createdAt: attendee.createdAt,
              },
              walletAdjustments: (attendee.walletAdjustments ?? [])
                .slice(-100)
                .reverse()
                .map((adjustment) => ({
                  id: adjustment.id,
                  operation: adjustment.operation,
                  amount: adjustment.amount,
                  note: adjustment.note,
                  createdAt: adjustment.createdAt,
                })),
            });
          } catch (error) {
            console.error("Attendee console details could not be loaded:", error);
            return Response.json(
              { error: "Attendee console details are temporarily unavailable." },
              { status: 503 },
            );
          }
        }
        if (section === "events") {
          const page = parsePage(url.searchParams.get("page"));
          const eventsCollection = db.collection<AdminEventDocument>("events");
          const [total, events] = await Promise.all([
            eventsCollection.countDocuments(),
            eventsCollection
              .find({})
              .sort({ createdAt: -1 })
              .skip((page - 1) * PAGE_SIZE)
              .limit(PAGE_SIZE)
              .toArray(),
          ]);
          return Response.json({ events, page, pageSize: PAGE_SIZE, total });
        }
        if (section === "payments") {
          const page = parsePage(url.searchParams.get("page"));
          const [total, payments] = await Promise.all([
            db.collection("payments").countDocuments(),
            db
              .collection("payments")
              .find({})
              .sort({ createdAt: -1 })
              .skip((page - 1) * PAGE_SIZE)
              .limit(PAGE_SIZE)
              .toArray(),
          ]);
          return Response.json({ payments, page, pageSize: PAGE_SIZE, total });
        }
        return Response.json({ error: "Unknown admin section." }, { status: 404 });
      },
      PATCH: async ({ request }) => {
        if (!isAllowedRequestOrigin(request)) {
          return Response.json({ error: "Request origin is not allowed." }, { status: 403 });
        }
        const admin = await requireAdmin(request);
        if (admin instanceof Response) return admin;

        try {
          const parsed = mutationSchema.safeParse(await request.json());
          if (!parsed.success)
            return Response.json({ error: "Invalid admin change." }, { status: 400 });
          const db = await getMongoDb();
          const change = parsed.data;

          if (change.resource === "user") {
            const users = db.collection<AdminUserDocument>("users");
            const target = await users.findOne({ _id: change.id });
            if (!target) return Response.json({ error: "User not found." }, { status: 404 });
            if (target.role === "ADMIN" || change.id === admin.id) {
              return Response.json(
                { error: "Administrator accounts cannot be changed here." },
                { status: 403 },
              );
            }
            await users.updateOne(
              { _id: change.id },
              { $set: { status: change.status, updatedAt: new Date() } },
            );
            return Response.json({ ok: true });
          }

          if (change.resource === "wallet") {
            const users = db.collection<AdminUserDocument>("users");
            const target = await users.findOne({ _id: change.id });
            if (!target) return Response.json({ error: "User not found." }, { status: 404 });
            if (target.role === "ADMIN" || change.id === admin.id) {
              return Response.json(
                { error: "Administrator wallets cannot be adjusted here." },
                { status: 403 },
              );
            }

            const now = new Date();
            const signedAmount = change.operation === "CREDIT" ? change.amount : -change.amount;
            const adjustment = {
              id: crypto.randomUUID(),
              operation: change.operation,
              amount: change.amount,
              note: change.note,
              adminId: admin.id,
              createdAt: now,
            };
            const result = await users.updateOne(
              {
                _id: change.id,
                ...(change.operation === "DEBIT" ? { walletBalance: { $gte: change.amount } } : {}),
              },
              [
                {
                  $set: {
                    walletBalance: {
                      $add: [{ $ifNull: ["$walletBalance", 0] }, signedAmount],
                    },
                    walletAdjustments: {
                      $slice: [
                        {
                          $concatArrays: [
                            { $ifNull: ["$walletAdjustments", []] },
                            { $literal: [adjustment] },
                          ],
                        },
                        -100,
                      ],
                    },
                    updatedAt: now,
                  },
                },
              ],
            );
            if (!result.matchedCount) {
              return Response.json(
                { error: "The user does not have enough balance for this deduction." },
                { status: 409 },
              );
            }
            const updated = await users.findOne(
              { _id: change.id },
              { projection: { walletBalance: 1 } },
            );
            return Response.json({ ok: true, balance: Number(updated?.["walletBalance"] ?? 0) });
          }

          const result = await db
            .collection<AdminEventDocument>("events")
            .updateOne(
              { _id: change.id },
              { $set: { status: change.status, updatedAt: new Date() } },
            );
          return result.matchedCount
            ? Response.json({ ok: true })
            : Response.json({ error: "Event not found." }, { status: 404 });
        } catch (error) {
          console.error("Admin change failed:", error);
          return Response.json(
            { error: "The admin change could not be saved because the database is unavailable." },
            { status: 503 },
          );
        }
      },
    },
  },
});

function parsePage(value: string | null): number {
  const page = Number(value);
  return Number.isSafeInteger(page) && page > 0 ? page : 1;
}

async function requireAdmin(request: Request) {
  try {
    const user = await currentUser(request);
    if (!user) return Response.json({ error: "Sign in as an administrator." }, { status: 401 });
    if (user.role !== "ADMIN")
      return Response.json({ error: "Administrator access required." }, { status: 403 });
    return user;
  } catch {
    return Response.json({ error: "Administrator service is unavailable." }, { status: 503 });
  }
}
