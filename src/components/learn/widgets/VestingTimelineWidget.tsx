"use client";

import { useState } from "react";
import WidgetFrame from "./WidgetFrame";

/**
 * Vesting timeline visualizer. The reader picks total vest period and
 * cliff length, the timeline renders horizontally with markers for
 * grant, cliff, midpoint, and fully vested. Pure SVG, no external
 * libraries.
 */
export default function VestingTimelineWidget() {
  const [totalMonths, setTotalMonths] = useState(48);
  const [cliffMonths, setCliffMonths] = useState(12);

  const safeTotal = Math.max(1, totalMonths);
  const safeCliff = Math.min(Math.max(0, cliffMonths), safeTotal);
  const cliffPct = (safeCliff / safeTotal) * 100;
  const midPct = 50;

  return (
    <WidgetFrame
      title="vesting timeline"
      caption="Drag the inputs. The cliff bar slides; the timeline updates."
    >
      <div className="flex flex-wrap gap-4">
        <NumberPicker
          label="Total vest"
          value={totalMonths}
          onChange={setTotalMonths}
          min={1}
          max={120}
          unit="months"
        />
        <NumberPicker
          label="Cliff"
          value={cliffMonths}
          onChange={setCliffMonths}
          min={0}
          max={safeTotal}
          unit="months"
        />
      </div>

      <div className="mt-5">
        <svg
          viewBox="0 0 100 16"
          preserveAspectRatio="none"
          className="w-full"
          style={{ height: 80 }}
          role="img"
          aria-label={`Vesting timeline: ${safeCliff}-month cliff out of ${safeTotal} total months`}
        >
          {/* Track */}
          <rect
            x="0"
            y="6.5"
            width="100"
            height="3"
            rx="1.5"
            fill="var(--surface)"
          />
          {/* Vested portion (cliff + linear after). For visualization the bar fills
              fully through the timeline because the user is exploring the schedule shape,
              not "now." Cliff is highlighted as a separate region. */}
          <rect
            x="0"
            y="6.5"
            width="100"
            height="3"
            rx="1.5"
            fill="url(#vest-fill)"
          />
          <defs>
            <linearGradient id="vest-fill" x1="0%" x2="100%" y1="0%" y2="0%">
              <stop offset="0%" stopColor="var(--accent-soft)" />
              <stop offset="100%" stopColor="var(--accent)" />
            </linearGradient>
          </defs>
          {/* Markers */}
          <Marker x={0} label="Grant" sub="" emphasis />
          {safeCliff > 0 && (
            <Marker
              x={cliffPct}
              label="Cliff"
              sub={`${safeCliff}mo`}
              emphasis
            />
          )}
          <Marker x={midPct} label="Half" sub={`${Math.round(safeTotal / 2)}mo`} />
          <Marker x={100} label="Done" sub={`${safeTotal}mo`} emphasis />
        </svg>

        <p
          className="mt-3 text-[12px] leading-6"
          style={{ color: "var(--text-muted)" }}
        >
          Default 4 years with a 1-year cliff. Try 0 cliff for the no-cliff
          shape, or 6 months for a refresh-grant pattern. Plenty of grants
          use other shapes too.
        </p>
      </div>
    </WidgetFrame>
  );
}

function NumberPicker({
  label,
  value,
  onChange,
  min,
  max,
  unit,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  min: number;
  max: number;
  unit: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span
        className="text-[11px] font-medium uppercase tracking-[0.14em]"
        style={{ color: "var(--text-muted)" }}
      >
        {label}
      </span>
      <span
        className="inline-flex items-center gap-2 rounded-md border px-2.5 py-1.5"
        style={{
          borderColor: "var(--border)",
          background: "var(--surface)",
        }}
      >
        <input
          type="number"
          value={value}
          onChange={(e) => {
            const next = Number(e.target.value);
            if (Number.isFinite(next))
              onChange(Math.min(Math.max(next, min), max));
          }}
          min={min}
          max={max}
          className="mono w-16 bg-transparent text-[14px]"
          style={{ color: "var(--text)" }}
        />
        <span
          className="text-[12px]"
          style={{ color: "var(--text-muted)" }}
        >
          {unit}
        </span>
      </span>
    </label>
  );
}

function Marker({
  x,
  label,
  sub,
  emphasis,
}: {
  x: number;
  label: string;
  sub: string;
  emphasis?: boolean;
}) {
  return (
    <g>
      <line
        x1={x}
        x2={x}
        y1={4}
        y2={11}
        stroke={emphasis ? "var(--accent)" : "var(--text-muted)"}
        strokeWidth={emphasis ? 0.5 : 0.3}
      />
      <text
        x={x}
        y={2.5}
        fontSize={2.4}
        textAnchor="middle"
        fill="var(--text)"
        style={{ fontWeight: emphasis ? 600 : 500 }}
      >
        {label}
      </text>
      {sub && (
        <text
          x={x}
          y={14.2}
          fontSize={2}
          textAnchor="middle"
          fill="var(--text-muted)"
        >
          {sub}
        </text>
      )}
    </g>
  );
}
