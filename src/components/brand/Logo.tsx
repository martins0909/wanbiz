import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  showWordmark = true,
}: {
  className?: string;
  showWordmark?: boolean;
}) {
  return (
    <Link to="/" className={cn("flex min-w-0 items-center gap-2.5", className)}>
      <img
        src="/favicon.png"
        alt="Wanbiz EventPass logo"
        width={44}
        height={44}
        className="size-10 shrink-0 rounded-xl object-cover ring-1 ring-border"
      />
      {showWordmark && (
        <span className="min-w-0 leading-none">
          <span className="block font-display text-[0.95rem] font-bold tracking-tight">
            <span className="text-brand-red">Wanbiz</span>{" "}
            <span className="text-brand-blue">EventPass</span>
          </span>
          <span className="mt-0.5 block text-[0.6rem] font-medium tracking-[0.14em] text-muted-foreground uppercase">
            Discover · Buy · Invite
          </span>
        </span>
      )}
    </Link>
  );
}
