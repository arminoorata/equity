"use client";

import { useState } from "react";
import WidgetFrame from "./WidgetFrame";

/**
 * Lock-up + blackout timeline visualizer for the Liquidity module.
 * Shows the 12 months following a hypothetical IPO date with a
 * draggable lock-up window and four quarterly earnings blackout
 * windows, so the reader can see how few days are actually open for
 * insiders to sell.
 */
export default function LockupTimelineWidget() {
  const [lockupDays, setLockupDays] = useState(180);

  const totalDays = 365;
  const safeLockup = Math.min(Math.max(0, lockupDays), totalDays);
  const lockupPct = (safeLockup / totalDays) * 100;

  // Four quarterly blackouts of ~30 days each, centered on quarter ends.
  // Approximate, for illustration only.
  const quarters = [
    { center: 90, width: 30 },
    { center: 180, width: 30 },
    { center: 270, width: 30 },
    { center: 360, width: 30 },
  ].map((b) => ({
    startPct: ((b.center - b.width / 2) / totalDays) * 100,
    widthPct: (b.width / totalDays) * 100,
  }));

  return (
    <WidgetFrame
      title="lock-up + blackout windows"
      caption="A year after IPO. Gold = post-IPO lock-up. Amber = quarterly earnings blackouts. White space is when insiders can actually trade."
    >
      <div className="flex flex-wrap gap-4">
        <label className="flex flex-col gap-1.5">
          <span
            className="text-[11px] font-medium uppercase tracking-[0.14em]"
            style={{ color: "var(--text-muted)" }}
          >
            Lock-up length
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
              value={lockupDays}
              onChange={(e) => {
                const next = Number(e.target.value);
                if (Number.isFinite(next))
                  setLockupDays(Math.min(Math.max(next, 0), totalDays));
              }}
              min={0}
              max={totalDays}
              className="mono w-20 bg-transparent text-[14px]"
              style={{ color: "var(--text)" }}
            />
            <span
              className="text-[12px]"
              style={{ color: "var(--text-muted)" }}
            >
              days
            </span>
          </span>
        </label>
      </div>

      <div className="mt-5">
        <svg
          viewBox="0 0 100 14"
          preserveAspectRatio="none"
          className="w-full"
          style={{ height: 60 }}
          role="img"
          aria-label={`Year-after-IPO timeline with a ${safeLockup}-day lock-up and four quarterly blackouts`}
        >
          {/* Background track */}
          <rect x="0" y="6" width="100" height="2" fill="var(--surface)" />
          {/* Lock-up window */}
          {lockupPct > 0 && (
            <rect
              x="0"
              y="4.5"
              width={lockupPct}
              height="5"
              fill="var(--accent-soft)"
            />
          )}
          {/* Earnings blackouts */}
          {quarters.map((q, i) => (
            <rect
              key={i}
              x={q.startPct}
              y="4.5"
              width={q.widthPct}
              height="5"
              fill="var(--amber-bg)"
            />
          ))}
          {/* Markers: IPO, +90, +180, +270, +365 */}
          {[0, 90, 180, 270, 365].map((d) => {
            const x = (d / totalDays) * 100;
            return (
              <g key={d}>
                <line
                  x1={x}
                  x2={x}
                  y1={3}
                  y2={11}
                  stroke="var(--text-muted)"
                  strokeWidth={0.25}
                />
                <text
                  x={x}
                  y={2}
                  fontSize={2}
                  textAnchor="middle"
                  fill="var(--text-muted)"
                >
                  {d === 0 ? "IPO" : `+${d}d`}
                </text>
              </g>
            );
          })}
        </svg>

        <p
          className="mt-3 text-[12px] leading-6"
          style={{ color: "var(--text-muted)" }}
        >
          Plan around real selling windows, not around vest dates. Vesting
          tells you what&rsquo;s yours. The calendar tells you when you can act.
        </p>
      </div>
    </WidgetFrame>
  );
}
