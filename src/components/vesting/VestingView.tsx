"use client";

import { useMemo, useState } from "react";
import { usePortal, type Grant } from "@/lib/state/PortalContext";
import {
  buildSchedule,
  condenseEvents,
  deriveStatus,
  parseISODate,
  type VestEvent,
} from "@/lib/vesting";
import VestingEmptyState from "./VestingEmptyState";

type SubView = "schedule" | "lifecycle";

/**
 * Vesting tab body. Switches between Schedule and Lifecycle. Adds a
 * "stack all grants" toggle so the timeline can show one grant or the
 * combined picture (TR feedback point #9, multi-grant layering).
 */
export default function VestingView() {
  const { profile, openBuilder } = usePortal();
  const [view, setView] = useState<SubView>("schedule");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [stackAll, setStackAll] = useState(false);

  if (profile.grants.length === 0) {
    return <VestingEmptyState />;
  }

  const activeGrant =
    profile.grants.find((g) => g.id === selectedId) || profile.grants[0];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <SubViewToggle value={view} onChange={setView} />
        <button
          type="button"
          onClick={openBuilder}
          className="text-xs underline underline-offset-4"
          style={{ color: "var(--text-muted)" }}
        >
          Edit grants
        </button>
      </div>

      {profile.grants.length > 1 && (
        <div
          className="mt-5 flex flex-wrap items-center gap-2 rounded-md border p-3 text-sm"
          style={{
            borderColor: "var(--line)",
            background: "var(--surface-soft)",
          }}
        >
          <span
            className="text-[11px] font-medium uppercase tracking-[0.18em]"
            style={{ color: "var(--text-muted)" }}
          >
            View
          </span>
          <button
            type="button"
            onClick={() => setStackAll(false)}
            className="rounded-full px-3 py-1 text-xs"
            style={{
              background: !stackAll ? "var(--accent-soft)" : "transparent",
              color: "var(--text)",
              fontWeight: !stackAll ? 600 : 500,
            }}
          >
            One grant
          </button>
          <button
            type="button"
            onClick={() => setStackAll(true)}
            className="rounded-full px-3 py-1 text-xs"
            style={{
              background: stackAll ? "var(--accent-soft)" : "transparent",
              color: "var(--text)",
              fontWeight: stackAll ? 600 : 500,
            }}
          >
            All grants stacked
          </button>
        </div>
      )}

      {!stackAll && (
        <ul className="mt-5 flex flex-wrap gap-2" role="radiogroup" aria-label="Grant">
          {profile.grants.map((g) => {
            const active = g.id === activeGrant.id;
            return (
              <li key={g.id}>
                <button
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setSelectedId(g.id)}
                  className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs"
                  style={{
                    borderColor: active ? "var(--accent)" : "var(--line)",
                    background: active
                      ? "var(--accent-soft)"
                      : "var(--surface)",
                    color: active ? "var(--text)" : "var(--text-secondary)",
                    fontWeight: active ? 600 : 500,
                  }}
                >
                  <span aria-hidden>
                    {g.type === "iso"
                      ? "⭐"
                      : g.type === "nso"
                      ? "📋"
                      : "🔒"}
                  </span>
                  <span className="mono">{g.shares.toLocaleString()}</span>
                  <span className="uppercase tracking-wider">{g.type}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <div className="mt-8">
        {view === "schedule" ? (
          stackAll ? (
            <StackedSchedule grants={profile.grants} />
          ) : (
            <Schedule grant={activeGrant} />
          )
        ) : (
          <Lifecycle
            grant={activeGrant}
            companyType={profile.companyType}
          />
        )}
      </div>

      <p
        className="mt-8 text-xs italic leading-6"
        style={{ color: "var(--text-muted)" }}
      >
        Educational only. Tax treatment depends on your full picture.
        Talk to a qualified tax advisor before acting on any of these
        numbers.
      </p>
    </div>
  );
}

function SubViewToggle({
  value,
  onChange,
}: {
  value: SubView;
  onChange: (v: SubView) => void;
}) {
  const options: Array<{ id: SubView; label: string }> = [
    { id: "schedule", label: "Schedule" },
    { id: "lifecycle", label: "Lifecycle" },
  ];
  return (
    <div
      className="inline-flex gap-1 rounded-full border p-1"
      style={{ borderColor: "var(--line)", background: "var(--surface)" }}
    >
      {options.map((o) => {
        const active = value === o.id;
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => onChange(o.id)}
            className="rounded-full px-4 py-1 text-xs"
            style={{
              background: active ? "var(--accent)" : "transparent",
              color: active ? "var(--bg)" : "var(--text-secondary)",
              fontWeight: active ? 600 : 500,
            }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function Schedule({ grant }: { grant: Grant }) {
  const [now] = useState(() => new Date());
  // Day-bucket "now" so events whose calendar day is today count as
  // past for the row opacity.
  const todayMs = useMemo(() => {
    const d = new Date(now);
    d.setHours(23, 59, 59, 999);
    return d.getTime();
  }, [now]);
  const status = useMemo(() => deriveStatus(grant, now), [grant, now]);
  const condensed = useMemo(
    () => condenseEvents(status.events),
    [status.events],
  );
  const start = parseISODate(grant.vestStartDate);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <SummaryCard
          label="Vested today"
          value={status.vestedNow.toLocaleString()}
          sub={`${status.pctVested}%`}
          tone="green"
        />
        <SummaryCard
          label="Unvested"
          value={status.unvested.toLocaleString()}
          sub={`${100 - status.pctVested}%`}
          tone="amber"
        />
        <SummaryCard
          label="Next vest"
          value={
            status.nextEvent
              ? `+${status.nextEvent.increment.toLocaleString()}`
              : "Done"
          }
          sub={
            status.nextEvent
              ? status.nextEvent.date.toISOString().slice(0, 10)
              : "Fully vested"
          }
          tone="accent"
        />
      </div>

      <div
        className="rounded-md border p-4"
        style={{ borderColor: "var(--line)", background: "var(--surface)" }}
      >
        <div className="flex items-center justify-between">
          <p
            className="text-[11px] font-medium uppercase tracking-[0.18em]"
            style={{ color: "var(--text-muted)" }}
          >
            Vesting ({grant.vestYears}yr{" "}
            {grant.vestMonths > 0 ? `${grant.vestMonths}mo` : ""})
          </p>
          <p
            className="mono text-[11px]"
            style={{ color: "var(--text-secondary)" }}
          >
            {status.pctVested}%
          </p>
        </div>
        <div
          className="mt-2 h-2 w-full rounded-full"
          style={{ background: "var(--surface-alt)" }}
        >
          <div
            className="h-full rounded-full"
            style={{
              width: `${status.pctVested}%`,
              background:
                "linear-gradient(90deg, var(--accent-soft), var(--accent))",
            }}
          />
        </div>
        <div
          className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-[11px]"
          style={{ color: "var(--text-muted)" }}
        >
          <span className="mono">
            Start {start.toISOString().slice(0, 10)}
          </span>
          {status.cliffEvent && (
            <span className="mono">
              Cliff {status.cliffEvent.date.toISOString().slice(0, 10)}
            </span>
          )}
          {status.finalEvent && (
            <span className="mono">
              Done {status.finalEvent.date.toISOString().slice(0, 10)}
            </span>
          )}
        </div>
      </div>

      <div
        className="rounded-md border"
        style={{ borderColor: "var(--line)" }}
      >
        <div
          className="border-b px-4 py-2 text-[11px] font-medium uppercase tracking-[0.18em]"
          style={{
            borderColor: "var(--line)",
            color: "var(--text-muted)",
            background: "var(--surface)",
          }}
        >
          Timeline (showing every third event plus cliff and final)
        </div>
        <div
          className="max-h-[260px] overflow-y-auto"
          style={{ background: "var(--surface-soft)" }}
        >
          <table className="w-full border-collapse text-sm">
            <tbody>
              {condensed.map((e, i) => {
                const past = e.date.getTime() <= todayMs;
                const pct = grant.shares > 0
                  ? (e.cumulative / grant.shares) * 100
                  : 0;
                return (
                  <tr
                    key={i}
                    style={{ opacity: past ? 1 : 0.5 }}
                  >
                    <td
                      className="mono px-3 py-2"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {e.date.toISOString().slice(0, 10)}
                    </td>
                    <td className="px-3 py-2">
                      <div
                        className="h-1.5 rounded-full"
                        style={{
                          width: `${pct}%`,
                          background: past
                            ? "var(--accent)"
                            : "var(--accent-soft)",
                          minWidth: 4,
                        }}
                      />
                    </td>
                    <td
                      className="mono px-3 py-2 text-right"
                      style={{ color: "var(--text-muted)" }}
                    >
                      +{e.increment.toLocaleString()}
                    </td>
                    <td
                      className="mono px-3 py-2 text-right"
                      style={{ color: "var(--text)" }}
                    >
                      {e.cumulative.toLocaleString()}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {e.isCliff && (
                        <span
                          className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
                          style={{
                            background: "var(--accent-soft)",
                            color: "var(--accent)",
                          }}
                        >
                          Cliff
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StackedSchedule({ grants }: { grants: Grant[] }) {
  // Anchor "now" to start-of-day (local time) so a vest event today
  // counts as vested for the whole day, not only after noon.
  const [now] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  });

  const series = useMemo(
    () =>
      grants.map((g) => ({
        grant: g,
        events: buildSchedule(g),
      })),
    [grants],
  );

  // Anchor the x-axis at the earliest vestStartDate (not the first vest
  // event), so a 12-month cliff visibly takes up the first quarter of
  // the chart instead of starting with 25% already vested at the left
  // edge. End at the last vest event across all grants.
  const earliestStart = useMemo(
    () =>
      Math.min(
        ...grants.map((g) => parseISODate(g.vestStartDate).getTime()),
      ),
    [grants],
  );
  const lastDate = useMemo(() => {
    let max = earliestStart;
    series.forEach((s) => {
      s.events.forEach((e) => {
        if (e.date.getTime() > max) max = e.date.getTime();
      });
    });
    return max;
  }, [series, earliestStart]);
  const firstDate = earliestStart;
  const span = Math.max(1, lastDate - firstDate);

  // Cumulative-by-date per grant. Compare on day-bucket so the noon-
  // stamped vest date counts as vested all day.
  const dayBucket = (ms: number) => {
    const d = new Date(ms);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  };
  const cumByGrantAt = (events: VestEvent[], at: number): number => {
    const atDay = dayBucket(at);
    let cum = 0;
    for (const e of events) {
      if (dayBucket(e.date.getTime()) <= atDay) cum = e.cumulative;
      else break;
    }
    return cum;
  };

  const totalShares = grants.reduce((acc, g) => acc + g.shares, 0);
  const vestedNow = grants.reduce(
    (acc, g, i) => acc + cumByGrantAt(series[i].events, now),
    0,
  );
  const pct = totalShares > 0 ? Math.round((vestedNow / totalShares) * 100) : 0;

  // Sample 60 evenly-spaced points for the area visualization.
  const samples = 60;
  const points = Array.from({ length: samples }, (_, i) => {
    const t = firstDate + (span * i) / (samples - 1);
    return { t, perGrant: series.map((s) => cumByGrantAt(s.events, t)) };
  });

  // Compute stacked y positions as percentages of total shares.
  const colors = ["var(--accent)", "var(--green)", "var(--amber)", "var(--accent-soft)"];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <SummaryCard
          label="Vested today (all grants)"
          value={vestedNow.toLocaleString()}
          sub={`${pct}%`}
          tone="green"
        />
        <SummaryCard
          label="Unvested (all grants)"
          value={(totalShares - vestedNow).toLocaleString()}
          sub={`${100 - pct}%`}
          tone="amber"
        />
        <SummaryCard
          label="Total granted"
          value={totalShares.toLocaleString()}
          sub={`${grants.length} grants`}
          tone="accent"
        />
      </div>

      <div
        className="rounded-md border p-4"
        style={{ borderColor: "var(--line)", background: "var(--surface)" }}
      >
        <p
          className="text-[11px] font-medium uppercase tracking-[0.18em]"
          style={{ color: "var(--text-muted)" }}
        >
          Stacked vesting across {grants.length} grants
        </p>
        <svg
          viewBox="0 0 100 30"
          preserveAspectRatio="none"
          className="mt-3 w-full"
          style={{ height: 180 }}
          role="img"
          aria-label={`Stacked vesting curve across ${grants.length} grants`}
        >
          {grants.map((g, gi) => {
            const polyPoints: string[] = [];
            const baselinePoints: string[] = [];
            points.forEach((pt, i) => {
              const x = (i / (samples - 1)) * 100;
              const cumBelow = points[i].perGrant
                .slice(0, gi)
                .reduce((a, b) => a + b, 0);
              const cumIncl = cumBelow + pt.perGrant[gi];
              const yBelow = totalShares > 0 ? 30 - (cumBelow / totalShares) * 30 : 30;
              const yIncl = totalShares > 0 ? 30 - (cumIncl / totalShares) * 30 : 30;
              polyPoints.push(`${x},${yIncl}`);
              baselinePoints.push(`${x},${yBelow}`);
            });
            const pathPts = [...polyPoints, ...baselinePoints.reverse()].join(" ");
            return (
              <polygon
                key={g.id}
                points={pathPts}
                fill={colors[gi % colors.length]}
                opacity={0.6 + 0.1 * (grants.length - gi)}
              />
            );
          })}
          {/* "now" marker */}
          {(() => {
            const x = ((now - firstDate) / span) * 100;
            if (x < 0 || x > 100) return null;
            return (
              <line
                x1={x}
                x2={x}
                y1={0}
                y2={30}
                stroke="var(--text)"
                strokeWidth={0.3}
                strokeDasharray="0.6 0.6"
              />
            );
          })()}
        </svg>

        <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px]">
          {grants.map((g, i) => (
            <li
              key={g.id}
              className="inline-flex items-center gap-1.5"
              style={{ color: "var(--text-muted)" }}
            >
              <span
                className="inline-block h-2 w-2 rounded-sm"
                style={{ background: colors[i % colors.length] }}
                aria-hidden
              />
              <span className="mono">{g.shares.toLocaleString()}</span>
              <span className="uppercase tracking-wider">{g.type}</span>
            </li>
          ))}
        </ul>
        <p
          className="mt-3 text-[11px]"
          style={{ color: "var(--text-muted)" }}
        >
          Layered grants don&rsquo;t add cleanly. Each one runs on its own
          clock. Stacking them is what your offer letter never showed you.
        </p>
      </div>
    </div>
  );
}

function Lifecycle({
  grant,
  companyType,
}: {
  grant: Grant;
  companyType: "private" | "public";
}) {
  const [fmv, setFmv] = useState(10);
  const [eventPrice, setEventPrice] = useState(50);

  const status = useMemo(() => deriveStatus(grant), [grant]);
  const totalMonths = grant.vestYears * 12 + grant.vestMonths;
  const cliffPct =
    totalMonths > 0 ? Math.round((grant.cliffMonths / totalMonths) * 100) : 0;
  const sharesAtCliff = Math.round((grant.shares * cliffPct) / 100);

  const valueAt = (price: number, sharesVested: number): number => {
    if (grant.type === "rsu") return price * sharesVested;
    return Math.max(0, price - grant.strike) * sharesVested;
  };

  const stages =
    companyType === "private"
      ? [
          { id: "grant", title: "Grant", price: fmv, shares: 0 },
          ...(grant.cliffMonths > 0
            ? [
                {
                  id: "cliff",
                  title: `Cliff (${cliffPct}%)`,
                  price: fmv,
                  shares: sharesAtCliff,
                },
              ]
            : []),
          {
            id: "mid",
            title: "Midpoint (50%)",
            price: fmv,
            shares: Math.round(grant.shares * 0.5),
          },
          { id: "full", title: "Fully vested", price: fmv, shares: grant.shares },
          {
            id: "event",
            title: "Liquidity event",
            price: eventPrice,
            shares: grant.shares,
          },
          {
            id: "post",
            title: "Post lock-up",
            price: eventPrice,
            shares: grant.shares,
          },
        ]
      : [
          { id: "grant", title: "Grant", price: fmv, shares: 0 },
          ...(grant.cliffMonths > 0
            ? [
                {
                  id: "cliff",
                  title: `Cliff (${cliffPct}%)`,
                  price: fmv,
                  shares: sharesAtCliff,
                },
              ]
            : []),
          {
            id: "mid",
            title: "Midpoint (50%)",
            price: fmv,
            shares: Math.round(grant.shares * 0.5),
          },
          { id: "full", title: "Fully vested", price: fmv, shares: grant.shares },
          {
            id: "sale",
            title: "Sale window",
            price: eventPrice,
            shares: grant.shares,
          },
        ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4">
        <NumberInput
          label="Estimated FMV"
          value={fmv}
          onChange={setFmv}
          prefix="$"
          step={1}
        />
        <NumberInput
          label={
            companyType === "private"
              ? "Estimated event price"
              : "Estimated future sale price"
          }
          value={eventPrice}
          onChange={setEventPrice}
          prefix="$"
          step={1}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {stages.map((s) => {
          const value = valueAt(s.price, s.shares);
          return (
            <div
              key={s.id}
              className="rounded-md border p-4"
              style={{
                borderColor: "var(--line)",
                background: "var(--surface)",
              }}
            >
              <p
                className="text-[11px] font-medium uppercase tracking-[0.18em]"
                style={{ color: "var(--text-muted)" }}
              >
                {s.title}
              </p>
              <p className="mono mt-2 text-2xl" style={{ color: "var(--text)" }}>
                ${Math.round(value).toLocaleString()}
              </p>
              <p
                className="mt-1 text-xs"
                style={{ color: "var(--text-muted)" }}
              >
                <span className="mono">{s.shares.toLocaleString()}</span>{" "}
                {grant.type === "rsu" ? "RSUs" : "options"} ×{" "}
                <span className="mono">${s.price}</span>
                {grant.type !== "rsu" ? ` − $${grant.strike} strike` : ""}
              </p>
            </div>
          );
        })}
      </div>

      {status.vestedNow > 0 && (
        <div
          className="rounded-md border p-4"
          style={{
            borderColor: "var(--accent-soft)",
            background: "var(--surface-soft)",
          }}
        >
          <p
            className="text-[11px] font-medium uppercase tracking-[0.18em]"
            style={{ color: "var(--accent)" }}
          >
            Today
          </p>
          <p
            className="mono mt-2 text-2xl"
            style={{ color: "var(--text)" }}
          >
            ${Math.round(valueAt(fmv, status.vestedNow)).toLocaleString()}
          </p>
          <p
            className="mt-1 text-xs"
            style={{ color: "var(--text-muted)" }}
          >
            <span className="mono">{status.vestedNow.toLocaleString()}</span>{" "}
            vested at <span className="mono">${fmv}</span> FMV
          </p>
        </div>
      )}
    </div>
  );
}

function SummaryCard({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string;
  sub: string;
  tone: "green" | "amber" | "accent";
}) {
  const colorMap = {
    green: { fg: "var(--green)", bg: "var(--green-bg)" },
    amber: { fg: "var(--amber)", bg: "var(--amber-bg)" },
    accent: { fg: "var(--accent)", bg: "var(--accent-soft)" },
  } as const;
  const c = colorMap[tone];
  return (
    <div
      className="rounded-md border p-4"
      style={{ borderColor: "var(--line)", background: "var(--surface)" }}
    >
      <p
        className="text-[11px] font-medium uppercase tracking-[0.18em]"
        style={{ color: c.fg }}
      >
        {label}
      </p>
      <p
        className="mono mt-2 text-3xl"
        style={{ color: "var(--text)" }}
      >
        {value}
      </p>
      <p
        className="mono mt-1 text-xs"
        style={{ color: "var(--text-muted)" }}
      >
        {sub}
      </p>
      <span
        className="absolute"
        aria-hidden
        style={{ background: c.bg, opacity: 0 }}
      />
    </div>
  );
}

function NumberInput({
  label,
  value,
  onChange,
  prefix,
  step = 1,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  prefix?: string;
  step?: number;
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
        style={{ borderColor: "var(--border)", background: "var(--surface)" }}
      >
        {prefix && (
          <span style={{ color: "var(--text-muted)" }} className="text-sm">
            {prefix}
          </span>
        )}
        <input
          type="number"
          value={value}
          step={step}
          onChange={(e) => {
            const next = Number(e.target.value);
            if (Number.isFinite(next)) onChange(Math.max(0, next));
          }}
          className="mono w-24 bg-transparent text-[14px]"
          style={{ color: "var(--text)" }}
        />
      </span>
    </label>
  );
}

