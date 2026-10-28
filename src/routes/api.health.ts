import { createFileRoute } from "@tanstack/react-router";
import { getMongoDb } from "@/lib/server/mongodb";

export const Route = createFileRoute("/api/health")({
  server: {
    handlers: {
      GET: async () => {
        try {
          await (await getMongoDb()).command({ ping: 1 });
          return Response.json({ status: "ok", database: "connected" });
        } catch (error) {
          console.error("MongoDB health check failed:", error);
          return Response.json({ status: "error", database: "disconnected" }, { status: 503 });
        }
      },
    },
  },
});
