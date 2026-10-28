import { Link, Outlet, createFileRoute } from "@tanstack/react-router";
import { BarChart3, CalendarRange, LayoutGrid, QrCode, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/auth-context";

export const Route = createFileRoute("/organizer")({
  component: OrganizerLayout,
});

const links = [
  { to: "/organizer", label: "Overview", icon: LayoutGrid, exact: true },
  { to: "/organizer/events", label: "My Events", icon: CalendarRange, exact: false },
  { to: "/organizer/attendees", label: "Attendees", icon: Users, exact: false },
  { to: "/organizer/seating", label: "Seating", icon: LayoutGrid, exact: false },
  { to: "/organizer/check-in", label: "Check-in", icon: QrCode, exact: false },
  { to: "/organizer/revenue", label: "Revenue", icon: BarChart3, exact: false },
] as const;

function OrganizerLayout() {
  const { user } = useAuth();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:flex-wrap sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold tracking-[0.2em] text-brand-blue uppercase">Organizer console</p>
          <h1 className="truncate font-display text-2xl font-bold sm:text-3xl">
            {user?.organizationName ?? "Your events"}
          </h1>
        </div>
        <Button asChild className="bg-gradient-brand text-primary-foreground">
          <Link to="/create-event">Create an event</Link>
        </Button>
      </header>

      <nav className="-mx-4 mt-6 flex gap-2 overflow-x-auto px-4 pb-3">
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            activeOptions={{ exact: link.exact ?? false }}
            activeProps={{ className: "bg-gradient-brand text-primary-foreground border-transparent" }}
            inactiveProps={{ className: "border-border text-muted-foreground hover:bg-secondary" }}
            className="flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium"
          >
            <link.icon className="size-4 shrink-0" />
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="mt-6 min-w-0">
        <Outlet />
      </div>
    </div>
  );
}
