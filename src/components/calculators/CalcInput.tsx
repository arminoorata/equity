"use client";

/**
 * Shared inputs for the calculator sub-views. Same visual language as
 * the inline learn widgets, just promoted to its own folder so the
 * full calculators don't depend on the widget tree.
 */
export function CalcNumber({
  label,
  value,
  onChange,
  min = 0,
  max,
  step = 1,
  prefix,
  suffix,
  width = "150px",
  hint,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
  step?: number;
  prefix?: string;
  suffix?: string;
  width?: string;
  hint?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5" style={{ width }}>
      <span
        className="text-[11px] font-medium uppercase tracking-[0.14em]"
        style={{ color: "var(--text-muted)" }}
      >
        {label}
      </span>
      <span
        className="inline-flex items-center gap-2 rounded-md border px-2.5 py-1.5"
        style={{ borderColor: "var(--border)", background: "var(--surface)" }}
      >
        {prefix && (
          <span className="text-sm" style={{ color: "var(--text-muted)" }}>
            {prefix}
          </span>
        )}
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(e) => {
            const next = Number(e.target.value);
            if (Number.isFinite(next)) {
              const clamped = Math.min(
                max ?? Number.POSITIVE_INFINITY,
                Math.max(min, next),
              );
              onChange(clamped);
            }
          }}
          className="mono w-full bg-transparent text-[14px]"
          style={{ color: "var(--text)" }}
        />
        {suffix && (
          <span className="text-sm" style={{ color: "var(--text-muted)" }}>
            {suffix}
          </span>
        )}
      </span>
      {hint && (
        <span
          className="text-[11px]"
          style={{ color: "var(--text-muted)" }}
        >
          {hint}
        </span>
      )}
    </label>
  );
}

export function ResultRow({
  label,
  value,
  tone = "default",
  hint,
}: {
  label: string;
  value: string;
  tone?: "default" | "warning" | "good" | "danger" | "accent";
  hint?: string;
}) {
  const colorMap = {
    default: "var(--text)",
    warning: "var(--amber)",
    good: "var(--green)",
    danger: "var(--red)",
    accent: "var(--accent)",
  } as const;
  return (
    <div
      className="flex items-baseline justify-between gap-3 border-b py-2.5 last:border-b-0"
      style={{ borderColor: "var(--line)" }}
    >
      <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
        {label}
        {hint && (
          <span
            className="ml-2 text-[11px]"
            style={{ color: "var(--text-muted)" }}
          >
            {hint}
          </span>
        )}
      </span>
      <span
        className="mono text-base font-semibold"
        style={{ color: colorMap[tone] }}
      >
        {value}
      </span>
    </div>
  );
}

export function fmt(n: number): string {
  return `$${Math.round(n).toLocaleString()}`;
}

export function fmtSigned(n: number): string {
  const sign = n < 0 ? "-" : "";
  return `${sign}$${Math.abs(Math.round(n)).toLocaleString()}`;
}
