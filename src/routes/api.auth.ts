import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import {
  AuthError,
  clearSessionCookie,
  currentUser,
  endSession,
  loginUser,
  registerUser,
  requestPasswordReset,
  resetUserPassword,
} from "@/lib/server/auth";

const registerSchema = z.object({
  action: z.literal("register"),
  fullName: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().min(7).max(32),
  password: z.string().min(8).max(128),
  role: z.enum(["ATTENDEE", "ORGANIZER"]),
  organizationName: z.string().trim().max(120).optional(),
  businessEmail: z.string().trim().email().max(254).optional().or(z.literal("")),
  businessPhone: z.string().trim().max(32).optional(),
});

const actionSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("login"),
    email: z.string().email(),
    password: z.string().min(1).max(128),
  }),
  registerSchema,
  z.object({ action: z.literal("logout") }),
  z.object({ action: z.literal("request-reset"), email: z.string().email() }),
  z.object({
    action: z.literal("reset-password"),
    token: z.string().min(32).max(128),
    password: z.string().min(8).max(128),
  }),
]);

export const Route = createFileRoute("/api/auth")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          return Response.json({ user: await currentUser(request) });
        } catch (error) {
          return errorResponse(error);
        }
      },
      POST: async ({ request }) => {
        const origin = request.headers.get("origin");
        if (origin && origin !== new URL(request.url).origin) {
          return Response.json({ error: "Request origin is not allowed." }, { status: 403 });
        }

        try {
          const parsed = actionSchema.safeParse(await request.json());
          if (!parsed.success) return Response.json({ error: "Invalid request." }, { status: 400 });
          const action = parsed.data;

          if (action.action === "login") {
            const result = await loginUser(action.email, action.password);
            return Response.json(
              { user: result.user },
              { headers: { "set-cookie": result.cookie } },
            );
          }
          if (action.action === "register") {
            const result = await registerUser(action);
            return Response.json(
              { user: result.user },
              { status: 201, headers: { "set-cookie": result.cookie } },
            );
          }
          if (action.action === "logout") {
            return Response.json(
              { ok: true },
              { headers: { "set-cookie": await endSession(request) } },
            );
          }
          if (action.action === "request-reset") {
            await requestPasswordReset(action.email, new URL(request.url).origin);
            return Response.json({ ok: true });
          }

          await resetUserPassword(action.token, action.password);
          return Response.json({ ok: true }, { headers: { "set-cookie": clearSessionCookie() } });
        } catch (error) {
          return errorResponse(error);
        }
      },
    },
  },
});

function errorResponse(error: unknown): Response {
  if (error instanceof AuthError)
    return Response.json({ error: error.message }, { status: error.status });
  console.error("Authentication request failed:", error);
  return Response.json({ error: "Authentication is temporarily unavailable." }, { status: 503 });
}
