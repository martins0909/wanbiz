import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  footer,
  tone = "default",
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  hint?: string;
  footer?: ReactNode;
  tone?: "default" | "red" | "blue";
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-ticket">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{label}</p>
        <span
          className={cn(
            "grid size-9 shrink-0 place-items-center rounded-xl bg-secondary text-foreground",
            tone === "red" && "bg-brand-red/10 text-brand-red",
            tone === "blue" && "bg-brand-blue/10 text-brand-blue",
          )}
        >
          <Icon className="size-4" />
        </span>
      </div>
      <p className="mt-3 font-display text-2xl font-bold">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      {footer && <div className="mt-3">{footer}</div>}
    </div>
  );
}
