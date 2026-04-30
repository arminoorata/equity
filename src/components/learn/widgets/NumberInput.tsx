"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Compact labeled number input used inside Try-it widgets. Optional
 * prefix (e.g. "$") and suffix (e.g. "%") render inline with the
 * input. Values are stored as numbers; the displayed string is
 * formatted with thousand separators so big inputs (vest price,
 * shares) stay readable.
 */
export default function NumberInput({
  label,
  value,
  onChange,
  min = 0,
  max,
  step = 1,
  prefix,
  suffix,
  width = "120px",
}: {
  label: string;
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  step?: number;
  prefix?: string;
  suffix?: string;
  width?: string;
}) {
  const allowDecimal = step < 1;
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [display, setDisplay] = useState(() =>
    formatDisplay(value, allowDecimal),
  );

  useEffect(() => {
    if (display === "") return;
    const parsed = parseClean(display);
    if (parsed === null) return;
    if (parsed !== value) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDisplay(formatDisplay(value, allowDecimal));
    }
  }, [value, allowDecimal, display]);

  return (
    <label className="flex flex-col gap-1.5">
      <span
        className="text-[11px] font-medium uppercase tracking-[0.14em]"
        style={{ color: "var(--text-muted)" }}
      >
        {label}
      </span>
      <span
        className="inline-flex items-center gap-1 rounded-md border px-2.5 py-1.5"
        style={{
          borderColor: "var(--border)",
          background: "var(--surface)",
          width,
        }}
      >
        {prefix && (
          <span
            className="mono text-[13px]"
            style={{ color: "var(--text-muted)" }}
          >
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

            const parsed = parseClean(reformatted);
            if (parsed !== null && Number.isFinite(parsed)) {
              const clamped = Math.min(
                max ?? Number.POSITIVE_INFINITY,
                Math.max(min, parsed),
              );
              if (clamped !== value) onChange(clamped);
            }

            requestAnimationFrame(() => {
              const node = inputRef.current;
              if (!node) return;
              const next = positionForDigitsBefore(reformatted, digitsBefore);
              try {
                node.setSelectionRange(next, next);
              } catch {
                // ignore
              }
            });
          }}
          onBlur={() => {
            setDisplay(formatDisplay(value, allowDecimal));
          }}
          className="mono w-full bg-transparent text-[14px]"
          style={{ color: "var(--text)" }}
        />
        {suffix && (
          <span
            className="mono text-[13px]"
            style={{ color: "var(--text-muted)" }}
          >
            {suffix}
          </span>
        )}
      </span>
    </label>
  );
}

function formatDisplay(n: number, allowDecimal: boolean): string {
  if (!Number.isFinite(n)) return "";
  if (allowDecimal) {
    return n.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 6,
    });
  }
  return Math.round(n).toLocaleString("en-US");
}

function reformat(raw: string, allowDecimal: boolean): string {
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
      decPart = cleaned.slice(firstDot + 1).replace(/\./g, "");
    }
    const intFormatted =
      intPart === "" ? "" : Number(intPart).toLocaleString("en-US");
    return decPart !== undefined ? `${intFormatted}.${decPart}` : intFormatted;
  }
  return Number(cleaned).toLocaleString("en-US");
}

function parseClean(s: string): number | null {
  const cleaned = s.replace(/,/g, "");
  if (cleaned === "" || cleaned === ".") return null;
  const num = Number(cleaned);
  return Number.isFinite(num) ? num : null;
}

function countDigitsBefore(text: string, cursor: number): number {
  let count = 0;
  for (let i = 0; i < cursor && i < text.length; i++) {
    if (/[0-9.]/.test(text[i])) count++;
  }
  return count;
}

function positionForDigitsBefore(text: string, digitsBefore: number): number {
  let count = 0;
  for (let i = 0; i < text.length; i++) {
    if (count === digitsBefore) return i;
    if (/[0-9.]/.test(text[i])) count++;
  }
  return text.length;
}
