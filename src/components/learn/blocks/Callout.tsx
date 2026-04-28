import type { CSSProperties } from "react";

type Severity = "red" | "amber" | "green" | "info";

const tone: Record<
  Severity,
  { color: string; bg: string; border: string; label: string }
> = {
  red: {
    color: "var(--red)",
    bg: "var(--red-bg)",
    border: "var(--red-border)",
    label: "Watch out",
  },
  amber: {
    color: "var(--amber)",
    bg: "var(--amber-bg)",
    border: "var(--amber-border)",
    label: "Mind this",
  },
  green: {
    color: "var(--green)",
    bg: "var(--green-bg)",
    border: "var(--green-border)",
    label: "Good to know",
  },
  info: {
    color: "var(--accent)",
    bg: "var(--accent-soft)",
    border: "var(--accent-soft)",
    label: "Note",
  },
};

/**
 * Inline callout for warnings, edge-cases, and reminders inside a
 * module section. Severity drives the color: red for time-sensitive
 * risks, amber for caution, green for low-cost wins, info/accent for
 * context. The colored vertical rule on the left is the visual anchor.
 */
export default function Callout({
  severity,
  title,
  body,
}: {
  severity: Severity;
  title?: string;
  body: string;
}) {
  const t = tone[severity];
  const wrapStyle: CSSProperties = {
    borderLeft: `3px solid ${t.color}`,
    background: t.bg,
    border: `1px solid ${t.border}`,
    borderLeftColor: t.color,
  };
  const labelStyle: CSSProperties = {
    color: t.color,
  };
  return (
    <aside
      className="rounded-md p-4 md:p-5"
      style={wrapStyle}
      role="note"
    >
      <p
        className="text-[10px] font-semibold uppercase tracking-[0.18em]"
        style={labelStyle}
      >
        {title ?? t.label}
      </p>
      <p
        className="mt-2 text-[14.5px] leading-7"
        style={{ color: "var(--text)" }}
      >
        {body}
      </p>
    </aside>
  );
}
