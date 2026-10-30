import { createFileRoute } from "@tanstack/react-router";
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
]);

export const Route = createFileRoute("/api/admin")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const admin = await requireAdmin(request);
        if (admin instanceof Response) return admin;

        const db = await getMongoDb();
        const section = new URL(request.url).searchParams.get("section") ?? "overview";
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
          const users = await db
            .collection("users")
            .find({}, { projection: { passwordHash: 0 } })
            .sort({ createdAt: -1 })
            .limit(100)
            .toArray();
          return Response.json({ users });
        }
        if (section === "events") {
          const events = await db
            .collection("events")
            .find({})
            .sort({ createdAt: -1 })
            .limit(100)
            .toArray();
          return Response.json({ events });
        }
        if (section === "payments") {
          const payments = await db
            .collection("payments")
            .find({})
            .sort({ createdAt: -1 })
            .limit(100)
            .toArray();
          return Response.json({ payments });
        }
        return Response.json({ error: "Unknown admin section." }, { status: 404 });
      },
      PATCH: async ({ request }) => {
        if (!isAllowedRequestOrigin(request)) {
          return Response.json({ error: "Request origin is not allowed." }, { status: 403 });
        }
        const admin = await requireAdmin(request);
        if (admin instanceof Response) return admin;

        const parsed = mutationSchema.safeParse(await request.json());
        if (!parsed.success)
          return Response.json({ error: "Invalid admin change." }, { status: 400 });
        const db = await getMongoDb();
        const change = parsed.data;

        if (change.resource === "user") {
          const users = db.collection("users");
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

        const result = await db
          .collection("events")
          .updateOne(
            { _id: change.id },
            { $set: { status: change.status, updatedAt: new Date() } },
          );
        return result.matchedCount
          ? Response.json({ ok: true })
          : Response.json({ error: "Event not found." }, { status: 404 });
      },
    },
  },
});

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
