"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Shared inputs for the calculator sub-views. The number input
 * formats with thousand separators while you type so eight- or
 * nine-digit valuations are readable. Cursor position is preserved
 * across reformatting by counting digits, not characters, before
 * and after.
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
  const allowDecimal = step < 1;
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [display, setDisplay] = useState(() =>
    formatNumberDisplay(value, allowDecimal),
  );

  // Sync the displayed string when the parent's value changes from
  // outside (grant edit re-prefill, scenario switch, etc.). Skip the
  // sync when:
  //  - the display is empty (user is mid-clear, leave it alone)
  //  - the display can't be parsed (transient states like "." or
  //    "10." while the user is typing a decimal)
  //  - the parsed display already matches the new value
  useEffect(() => {
    if (display === "") return;
    const parsed = parseDisplay(display);
    if (parsed === null) return;
    if (parsed !== value) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDisplay(formatNumberDisplay(value, allowDecimal));
    }
  }, [value, allowDecimal, display]);

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
          ref={inputRef}
          type="text"
          inputMode={allowDecimal ? "decimal" : "numeric"}
          value={display}
          onChange={(e) => {
            const input = e.target as HTMLInputElement;
            const raw = input.value;
            const cursor = input.selectionStart ?? raw.length;
            const digitsBefore = countDigitsBefore(raw, cursor);

            const reformatted = reformat(raw, allowDecimal);
            setDisplay(reformatted);

            const parsed = parseDisplay(reformatted);
            if (parsed !== null && Number.isFinite(parsed)) {
              const clamped = Math.min(
                max ?? Number.POSITIVE_INFINITY,
                Math.max(min, parsed),
              );
              if (clamped !== value) onChange(clamped);
            } else if (raw.trim() === "") {
              if (min <= 0 && value !== 0) onChange(0);
            }

            // Restore cursor at the same digit-count position.
            requestAnimationFrame(() => {
              const node = inputRef.current;
              if (!node) return;
              const next = positionForDigitsBefore(reformatted, digitsBefore);
              try {
                node.setSelectionRange(next, next);
              } catch {
                // Selection set can fail on some readonly inputs; ignore.
              }
            });
          }}
          onBlur={() => {
            // On blur, re-format clean from the canonical numeric value.
            setDisplay(formatNumberDisplay(value, allowDecimal));
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
  label: string | React.ReactNode;
  value: string;
  tone?: "default" | "warning" | "good" | "danger" | "accent";
  hint?: string | React.ReactNode;
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

// ─────────── Helpers ───────────

function formatNumberDisplay(n: number, allowDecimal: boolean): string {
  if (!Number.isFinite(n)) return "";
  if (allowDecimal) {
    // Keep up to 6 decimal places of fidelity, no padding.
    return n.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 6,
    });
  }
  return Math.round(n).toLocaleString("en-US");
}

function reformat(raw: string, allowDecimal: boolean): string {
  // Strip everything that isn't a digit, decimal, or sign at start.
  const cleaned = allowDecimal
    ? raw.replace(/[^\d.]/g, "")
    : raw.replace(/[^\d]/g, "");

  if (cleaned === "") return "";

  if (allowDecimal) {
    const firstDot = cleaned.indexOf(".");
    let intPart: string;
    let decPart: string | undefined;
    if (firstDot === -1) {
      intPart = cleaned;
      decPart = undefined;
    } else {
      intPart = cleaned.slice(0, firstDot);
      // Drop any additional dots in the decimal part.
      decPart = cleaned.slice(firstDot + 1).replace(/\./g, "");
    }
    // Leave a bare leading decimal (".25") alone so the user's cursor
    // doesn't get pushed past an injected "0". Format-on-blur converts
    // it to the canonical "0.25".
    const intFormatted =
      intPart === "" ? "" : Number(intPart).toLocaleString("en-US");
    return decPart !== undefined ? `${intFormatted}.${decPart}` : intFormatted;
  }

  return Number(cleaned).toLocaleString("en-US");
}

function parseDisplay(s: string): number | null {
  const cleaned = s.replace(/,/g, "");
  if (cleaned === "" || cleaned === ".") return null;
  const num = Number(cleaned);
  return Number.isFinite(num) ? num : null;
}

function countDigitsBefore(text: string, cursor: number): number {
  let count = 0;
  for (let i = 0; i < cursor && i < text.length; i++) {
    const ch = text[i];
    if (/[0-9.]/.test(ch)) count++;
  }
  return count;
}

function positionForDigitsBefore(text: string, digitsBefore: number): number {
  let count = 0;
  for (let i = 0; i < text.length; i++) {
    if (count === digitsBefore) return i;
    const ch = text[i];
    if (/[0-9.]/.test(ch)) count++;
  }
  return text.length;
}
