import { QrCode } from "lucide-react";
import { cn } from "@/lib/utils";

/** Visual placeholder until verified ticket QR credentials are issued. */
export function QrPlaceholder({ label, className }: { label?: string; className?: string }) {
  return (
    <div
      className={cn(
        "flex aspect-square w-full max-w-[220px] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-secondary/60 p-4 text-center",
        className,
      )}
    >
      <QrCode className="size-16 text-foreground/70" strokeWidth={1.25} />
      <p className="text-[0.7rem] leading-tight text-muted-foreground">{label ?? "QR code generated at issue time"}</p>
    </div>
  );
}
