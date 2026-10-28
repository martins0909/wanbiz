import { Link, useRouterState } from "@tanstack/react-router";
import { CalendarDays, Home, Ticket, Sparkles, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { label: "Home", to: "/", icon: Home },
  { label: "Events", to: "/events", icon: CalendarDays },
  { label: "Tickets", to: "/dashboard/tickets", icon: Ticket },
  { label: "Wallet", to: "/dashboard/wallet", icon: Wallet },
  { label: "TicketPass", to: "/membership", icon: Sparkles },
] as const;

export function MobileTabBar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
      <ul className="grid grid-cols-5">
        {tabs.map((tab) => {
          const active = pathname === tab.to;
          return (
            <li key={tab.to}>
              <Link
                to={tab.to}
                className={cn(
                  "flex flex-col items-center gap-1 py-2.5 text-[0.62rem] font-medium",
                  active ? "text-brand-red" : "text-muted-foreground",
                )}
              >
                <tab.icon className={cn("size-5", active && "text-brand-red")} />
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
