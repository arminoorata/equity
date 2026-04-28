import type { ReactNode } from "react";

/**
 * Phase 2 tab placeholder. One per tab route. Real content lands in
 * Phase 3+. The shape is consistent with how the real tabs will render:
 * eyebrow label, h1, short body. No heavy chrome; the page-level
 * SiteHeader + TabNav already give context.
 */
export default function TabPlaceholder({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12 md:px-10 md:py-16">
      <p
        className="text-xs font-medium uppercase tracking-[0.32em]"
        style={{ color: "var(--accent)" }}
      >
        {eyebrow}
      </p>
      <h1 className="mt-3 text-2xl font-medium leading-tight tracking-tight md:text-3xl">
        {title}
      </h1>
      <div
        className="mt-4 space-y-4 text-base leading-7"
        style={{ color: "var(--muted)" }}
      >
        {children}
      </div>
    </main>
  );
}
