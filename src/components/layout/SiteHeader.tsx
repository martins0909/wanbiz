import { Link, useRouterState } from "@tanstack/react-router";
import { LogOut, Menu, Plus, User } from "lucide-react";
import { useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/lib/auth/auth-context";
import { cn } from "@/lib/utils";

export const PRIMARY_NAV = [
  { label: "Home", to: "/" },
  { label: "Events", to: "/events" },
  { label: "Categories", to: "/categories" },
  { label: "Presales", to: "/presales" },
  { label: "TicketPass Membership", to: "/membership" },
  { label: "How It Works", to: "/how-it-works" },
] as const;

export const ACCOUNT_NAV = [
  { label: "My Tickets", to: "/dashboard/tickets" },
  { label: "My Invitations", to: "/dashboard/invitations" },
  { label: "My Wallet", to: "/dashboard/wallet" },
  { label: "My Membership", to: "/dashboard/membership" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-lg">
      <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 lg:px-8">
        <Logo />

        <div className="flex items-center gap-1.5">
          <nav className="hidden items-center gap-0.5 xl:flex">
            {PRIMARY_NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "rounded-full px-3 py-2 text-[0.8rem] font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
                  pathname === item.to && "bg-secondary text-foreground",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <Button asChild variant="outline" size="sm" className="hidden lg:inline-flex">
            <Link to="/create-event">
              <Plus className="size-4" /> Create Event
            </Link>
          </Button>

          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="secondary" className="gap-2">
                  <User className="size-4" />
                  <span className="hidden max-w-24 truncate sm:inline">{user?.fullName}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="truncate">{user?.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/dashboard">Dashboard</Link>
                </DropdownMenuItem>
                {ACCOUNT_NAV.map((item) => (
                  <DropdownMenuItem key={item.to} asChild>
                    <Link to={item.to}>{item.label}</Link>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuItem asChild>
                  <Link to="/dashboard/profile">Profile</Link>
                </DropdownMenuItem>
                {user?.role === "ORGANIZER" && (
                  <DropdownMenuItem asChild>
                    <Link to="/organizer">Organizer console</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => void logout()}>
                  <LogOut className="size-4" /> Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild size="sm" className="bg-gradient-brand text-primary-foreground">
              <Link to="/login">Login</Link>
            </Button>
          )}

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="xl:hidden" aria-label="Open menu">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[85vw] max-w-sm overflow-y-auto">
              <div className="mt-8 flex flex-col gap-1">
                {PRIMARY_NAV.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-3 py-2.5 text-sm font-semibold hover:bg-secondary"
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="my-3 h-px bg-border" />
                {ACCOUNT_NAV.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                ))}
                <Link
                  to="/create-event"
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
                >
                  Create Event
                </Link>
                <div className="my-3 h-px bg-border" />
                {isAuthenticated ? (
                  <button
                    onClick={() => {
                      setOpen(false);
                      void logout();
                    }}
                    className="rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-brand-red"
                  >
                    Log out
                  </button>
                ) : (
                  <div className="flex flex-col gap-2 px-1">
                    <Button asChild className="bg-gradient-brand text-primary-foreground">
                      <Link to="/login" onClick={() => setOpen(false)}>
                        Login
                      </Link>
                    </Button>
                    <Button asChild variant="outline">
                      <Link to="/register" onClick={() => setOpen(false)}>
                        Create account
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
