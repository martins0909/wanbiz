import { Link, Outlet, createFileRoute } from "@tanstack/react-router";
import { CreditCard, IdCard, Mail, Receipt, Ticket, User, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/auth-context";

export const Route = createFileRoute("/dashboard")({
  component: DashboardLayout,
});

const links = [
  { to: "/dashboard", label: "Overview", icon: CreditCard, exact: true },
  { to: "/dashboard/tickets", label: "My Tickets", icon: Ticket, exact: false },
  { to: "/dashboard/invitations", label: "Invitations", icon: Mail, exact: false },
  { to: "/dashboard/wallet", label: "Wallet", icon: Wallet, exact: false },
  { to: "/dashboard/membership", label: "TicketPass", icon: IdCard, exact: false },
  { to: "/dashboard/transactions", label: "Transactions", icon: Receipt, exact: false },
  { to: "/dashboard/profile", label: "Profile", icon: User, exact: false },
] as const;

function DashboardLayout() {
  const { isAuthenticated, isLoading, user } = useAuth();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:flex-wrap sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold tracking-[0.2em] text-brand-red uppercase">My EventPass</p>
          <h1 className="truncate font-display text-2xl font-bold sm:text-3xl">
            {isAuthenticated && user ? user.fullName : "Attendee dashboard"}
          </h1>
        </div>
        <Button asChild className="bg-gradient-brand text-primary-foreground">
          <Link to="/events">Find events</Link>
        </Button>
      </header>

      {!isAuthenticated && !isLoading && (
        <div className="mt-6 grid gap-3 rounded-2xl border border-border bg-secondary/50 p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
          <p className="text-sm text-muted-foreground">
            You are viewing a preview of the attendee dashboard. Sign in to see your own tickets, wallet and membership.
          </p>
          <div className="flex gap-2">
            <Button asChild size="sm" variant="outline">
              <Link to="/login">Sign in</Link>
            </Button>
            <Button asChild size="sm" className="bg-gradient-brand text-primary-foreground">
              <Link to="/register">Register</Link>
            </Button>
          </div>
        </div>
      )}

      <div className="mt-7 gap-8 lg:grid lg:grid-cols-[220px_minmax(0,1fr)]">
        <nav className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-3 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0 lg:pb-0">
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
        <div className="min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
