import type { ReactNode } from "react";

/**
 * Output row for a Try-it widget. Label on the left, mono number on
 * the right. Tone changes the right-side color so winners (net
 * proceeds), warnings (AMT exposure), and totals each read
 * consistently across widgets.
 */
type Tone = "default" | "accent" | "warning" | "muted";

const toneColors: Record<Tone, string> = {
  default: "var(--text)",
  accent: "var(--accent)",
  warning: "var(--amber)",
  muted: "var(--text-muted)",
};

export default function WidgetResult({
  label,
  value,
  tone = "default",
  hint,
}: {
  label: string;
  value: ReactNode;
  tone?: Tone;
  hint?: string;
}) {
  return (
    <div
      className="flex items-baseline justify-between gap-3 py-2 first:pt-0 last:pb-0"
      style={{ borderTop: "1px solid var(--line)" }}
    >
      <span className="flex flex-col">
        <span
          className="text-[13.5px]"
          style={{ color: "var(--text-secondary)" }}
        >
          {label}
        </span>
        {hint && (
          <span
            className="text-[11px]"
            style={{ color: "var(--text-muted)" }}
          >
            {hint}
          </span>
        )}
      </span>
      <span
        className="mono text-[15px] font-semibold"
        style={{ color: toneColors[tone] }}
      >
        {value}
      </span>
    </div>
  );
}
