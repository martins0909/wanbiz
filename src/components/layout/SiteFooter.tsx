import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/brand/Logo";

const columns = [
  {
    title: "Discover",
    links: [
      { label: "Events", to: "/events" as const },
      { label: "Categories", to: "/categories" as const },
      { label: "Presales", to: "/presales" as const },
      { label: "How It Works", to: "/how-it-works" as const },
    ],
  },
  {
    title: "My EventPass",
    links: [
      { label: "My Tickets", to: "/dashboard/tickets" as const },
      { label: "My Invitations", to: "/dashboard/invitations" as const },
      { label: "My Wallet", to: "/dashboard/wallet" as const },
      { label: "My Membership", to: "/dashboard/membership" as const },
    ],
  },
  {
    title: "Organizers",
    links: [
      { label: "Create Event", to: "/create-event" as const },
      { label: "Organizer Console", to: "/organizer" as const },
      { label: "TicketPass Membership", to: "/membership" as const },
      { label: "Login", to: "/login" as const },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border bg-graphite text-graphite-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div>
          <Logo className="[&_span:last-child]:text-graphite-foreground/60" />
          <p className="mt-4 max-w-xs text-sm text-graphite-foreground/70">
            Nigeria's event platform for discovering events, buying tickets, inviting friends and seamless QR entry.
          </p>
          <p className="mt-4 text-xs text-graphite-foreground/50">All prices in Nigerian Naira (₦).</p>
        </div>
        {columns.map((column) => (
          <div key={column.title}>
            <h3 className="text-sm font-semibold tracking-wide uppercase">{column.title}</h3>
            <ul className="mt-4 space-y-2.5">
              {column.links.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="text-sm text-graphite-foreground/70 transition-colors hover:text-graphite-foreground">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-graphite-foreground/10 px-4 py-6 text-center text-xs text-graphite-foreground/50 lg:px-8">
        © {new Date().getFullYear()} Wanbiz EventPass. Discover. Buy. Invite. Experience.
      </div>
    </footer>
  );
}
