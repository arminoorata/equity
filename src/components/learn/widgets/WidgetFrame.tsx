import type { ReactNode } from "react";

/**
 * Shared chrome for an inline widget. Same eyebrow/title pattern as
 * the WorkedExample box, but client-interactive instead of static.
 * Used by all six module widgets so they share the same visual
 * language.
 */
export default function WidgetFrame({
  title,
  caption,
  children,
}: {
  title: string;
  caption?: string;
  children: ReactNode;
}) {
  return (
    <figure
      className="rounded-md border"
      style={{
        borderColor: "var(--line)",
        background: "var(--surface-alt)",
      }}
    >
      <figcaption
        className="border-b px-5 py-2.5"
        style={{ borderColor: "var(--line)" }}
      >
        <p
          className="text-[11px] font-semibold uppercase tracking-[0.18em]"
          style={{ color: "var(--accent)" }}
        >
          Try it: {title}
        </p>
        {caption && (
          <p
            className="mt-1 text-[12.5px]"
            style={{ color: "var(--text-muted)" }}
          >
            {caption}
          </p>
        )}
      </figcaption>
      <div className="px-5 py-4">{children}</div>
    </figure>
  );
}
