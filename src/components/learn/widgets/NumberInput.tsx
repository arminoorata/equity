"use client";

import type { ChangeEvent } from "react";

/**
 * Compact labeled number input used inside Try-it widgets. Optional
 * prefix (e.g. "$") and suffix (e.g. "%") render inline with the
 * input. Numbers are stored as numbers, not strings.
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
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const next = Number(e.target.value);
    if (Number.isFinite(next)) onChange(next);
  };

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
          type="number"
          value={value}
          onChange={handleChange}
          min={min}
          max={max}
          step={step}
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
