import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <section className="border-b border-border bg-graphite text-graphite-foreground">
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8 lg:py-16">
        {eyebrow && (
          <p className="text-xs font-semibold tracking-[0.2em] text-brand-blue uppercase">{eyebrow}</p>
        )}
        <h1 className="mt-3 text-3xl font-bold sm:text-4xl lg:text-5xl">{title}</h1>
        {description && (
          <p className="mt-4 max-w-2xl text-sm text-graphite-foreground/75 sm:text-base">{description}</p>
        )}
        {actions && <div className="mt-7 flex flex-wrap gap-3">{actions}</div>}
      </div>
    </section>
  );
}
