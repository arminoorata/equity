"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import type { LearnModule } from "@/data/modules";
import { usePortal } from "@/lib/state/PortalContext";

/**
 * Module tiles on the Learn home. Visual-first: outcome title, a tiny
 * preview of the "thing you'll learn", and minute count. Still no
 * explanatory body paragraph; the visual carries the information scent.
 */
export default function LearnModuleGrid({
  modules,
  featuredModuleId,
}: {
  modules: LearnModule[];
  featuredModuleId?: string | null;
}) {
  const { completedModules } = usePortal();

  return (
    <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {modules.map((m) => {
        const done = Boolean(completedModules[m.id]);
        const featured = featuredModuleId === m.id;
        const tone = toneFor(m.id);
        return (
          <li
            key={m.id}
            className={featured ? "md:col-span-2 lg:col-span-2" : undefined}
          >
            <Link
              href={`/learn/${m.id}`}
              className="group spotlight-card relative flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] border p-5 outline-none transition-colors motion-safe:duration-200 motion-safe:hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              style={{
                borderColor: featured
                  ? tone.border
                  : done
                    ? "var(--green-border)"
                    : "var(--line)",
                background: featured
                  ? `linear-gradient(135deg, ${tone.bg}, var(--surface) 52%, var(--surface-alt))`
                  : "linear-gradient(180deg, var(--surface-alt), var(--surface))",
                minHeight: featured ? 214 : 188,
              }}
            >
              {featured && (
                <span
                  className="absolute left-0 top-0 h-full w-1"
                  style={{ background: tone.color }}
                  aria-hidden
                />
              )}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span
                    aria-hidden
                    className="text-2xl leading-none"
                    style={{ filter: "drop-shadow(0 1px 0 rgba(0,0,0,0.3))" }}
                  >
                    {m.icon}
                  </span>
                  {featured && (
                    <span
                      className="rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em]"
                      style={{
                        borderColor: tone.border,
                        background: tone.bg,
                        color: tone.color,
                      }}
                    >
                      Start here
                    </span>
                  )}
                </div>
                <span
                  className="text-[10px] uppercase tracking-[0.18em]"
                  style={{ color: "var(--text-muted)" }}
                >
                  <span className="mono">{m.minutes}</span> min
                </span>
              </div>
              <div className="mt-5 flex flex-1 items-center" aria-hidden>
                <Preview id={m.id} tone={tone} featured={featured} />
              </div>
              <h3
                className={`${featured ? "text-[22px] md:text-2xl" : "text-[18px]"} mt-5 max-w-[15rem] font-semibold leading-snug tracking-tight`}
                style={{ color: "var(--text)" }}
              >
                {m.cardTitle ?? m.title}
              </h3>
              <div className="mt-4 flex items-center justify-between gap-3">
                {done ? (
                  <p
                    className="inline-flex items-center gap-1.5 text-[11px] font-semibold"
                    style={{ color: "var(--green)" }}
                  >
                    <span aria-hidden>✓</span> Completed
                  </p>
                ) : (
                  <span
                    className="text-[11px] uppercase tracking-[0.16em]"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Start
                  </span>
                )}
                <span
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border text-sm transition-colors group-hover:border-[var(--accent)] group-hover:text-[var(--accent)] group-focus-visible:border-[var(--accent)] group-focus-visible:text-[var(--accent)]"
                  style={{
                    borderColor: "var(--line)",
                    color: "var(--text-muted)",
                    background: "var(--surface)",
                  }}
                  aria-hidden
                >
                  →
                </span>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

type Tone = {
  color: string;
  border: string;
  bg: string;
};

function toneFor(id: string): Tone {
  switch (id) {
    case "isos":
    case "tax":
    case "leaving":
      return {
        color: "var(--amber)",
        border: "var(--amber-border)",
        bg: "var(--amber-bg)",
      };
    case "rsus":
      return {
        color: "var(--green)",
        border: "var(--green-border)",
        bg: "var(--green-bg)",
      };
    case "liquidity":
      return {
        color: "var(--accent)",
        border: "var(--accent-soft)",
        bg: "var(--accent-soft)",
      };
    default:
      return {
        color: "var(--accent)",
        border: "var(--accent-soft)",
        bg: "var(--accent-soft)",
      };
  }
}

function Preview({
  id,
  tone,
  featured,
}: {
  id: string;
  tone: Tone;
  featured: boolean;
}) {
  switch (id) {
    case "basics":
      return (
        <PreviewFrame tone={tone} featured={featured}>
          <div className="space-y-2">
            {[
              ["shares", "10,000"],
              ["strike", "$2.00"],
              ["vesting", "4 yrs"],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center gap-2">
                <span
                  className="h-1.5 rounded-full"
                  style={{
                    width: label === "shares" ? 58 : label === "strike" ? 42 : 68,
                    background: "var(--line)",
                  }}
                />
                <span className="mono text-[11px]" style={{ color: tone.color }}>
                  {value}
                </span>
              </div>
            ))}
          </div>
        </PreviewFrame>
      );
    case "isos":
      return (
        <PreviewFrame tone={tone} featured={featured}>
          <div className="w-full">
            <div className="flex items-end justify-between">
              <MiniValue value="$2" label="strike" />
              <MiniValue value="$10" label="FMV" alignRight />
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--line)]">
              <div
                className="h-full rounded-full"
                style={{
                  width: "78%",
                  background: `linear-gradient(90deg, var(--accent), ${tone.color})`,
                }}
              />
            </div>
            <p className="mt-3 mono text-[15px]" style={{ color: tone.color }}>
              $8k AMT exposure
            </p>
          </div>
        </PreviewFrame>
      );
    case "nsos":
      return (
        <PreviewFrame tone={tone} featured={featured}>
          <div className="grid w-full grid-cols-2 gap-3">
            <MiniStat label="cash" value="$2k" tone="var(--text)" />
            <MiniStat label="tax" value="$2.8k" tone={tone.color} />
          </div>
        </PreviewFrame>
      );
    case "rsus":
      return (
        <PreviewFrame tone={tone} featured={featured}>
          <div className="flex w-full items-center justify-between gap-4">
            <BigNumber value="100" label="vest" />
            <span className="text-xl" style={{ color: "var(--text-muted)" }}>
              →
            </span>
            <BigNumber value="65" label="keep" tone={tone.color} />
          </div>
        </PreviewFrame>
      );
    case "tax":
      return (
        <PreviewFrame tone={tone} featured={featured}>
          <div className="flex w-full items-end gap-3">
            <CompareBar label="ISO" height={70} value="$40.8k" tone={tone.color} />
            <CompareBar label="NSO" height={52} value="$39.2k" tone="var(--text-muted)" />
          </div>
        </PreviewFrame>
      );
    case "liquidity":
      return (
        <PreviewFrame tone={tone} featured={featured}>
          <div className="w-full">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full" style={{ background: tone.color }} />
              <span className="h-1 flex-1 rounded-full" style={{ background: "var(--line)" }} />
              <span className="h-3 w-3 rounded-full" style={{ background: "var(--green)" }} />
            </div>
            <div className="mt-3 grid grid-cols-[1fr_auto] gap-3">
              <span
                className="rounded-full border px-2 py-1 text-[10px] uppercase tracking-[0.14em]"
                style={{ borderColor: tone.border, color: tone.color }}
              >
                180d lock-up
              </span>
              <span
                className="rounded-full border px-2 py-1 text-[10px] uppercase tracking-[0.14em]"
                style={{ borderColor: "var(--green-border)", color: "var(--green)" }}
              >
                open
              </span>
            </div>
          </div>
        </PreviewFrame>
      );
    case "leaving":
      return (
        <PreviewFrame tone={tone} featured={featured}>
          <div className="flex items-center gap-4">
            <div
              className="grid h-20 w-20 place-items-center rounded-full border-4"
              style={{ borderColor: tone.color }}
            >
              <div className="text-center">
                <p className="mono text-xl font-semibold" style={{ color: "var(--text)" }}>
                  90
                </p>
                <p className="text-[9px] uppercase tracking-[0.18em]" style={{ color: tone.color }}>
                  days
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <span className="block h-1.5 w-16 rounded-full" style={{ background: "var(--line)" }} />
              <span className="block h-1.5 w-10 rounded-full" style={{ background: tone.color }} />
            </div>
          </div>
        </PreviewFrame>
      );
    case "case-study":
      return (
        <PreviewFrame tone={tone} featured={featured}>
          <div className="flex w-full items-center gap-2">
            <DecisionDot tone={tone.color}>1</DecisionDot>
            <span className="h-1 flex-1 rounded-full" style={{ background: "var(--line)" }} />
            <DecisionDot tone={tone.color}>2</DecisionDot>
            <span className="h-1 flex-1 rounded-full" style={{ background: "var(--line)" }} />
            <DecisionDot tone="var(--green)">3</DecisionDot>
          </div>
        </PreviewFrame>
      );
    default:
      return null;
  }
}

function PreviewFrame({
  children,
}: {
  children: ReactNode;
  tone?: Tone;
  featured?: boolean;
}) {
  return <div className="w-full py-2">{children}</div>;
}

function MiniValue({
  value,
  label,
  alignRight,
}: {
  value: string;
  label: string;
  alignRight?: boolean;
}) {
  return (
    <div className={alignRight ? "text-right" : undefined}>
      <p className="mono text-[14px]" style={{ color: "var(--text)" }}>
        {value}
      </p>
      <p className="text-[9px] uppercase tracking-[0.14em]" style={{ color: "var(--text-muted)" }}>
        {label}
      </p>
    </div>
  );
}

function MiniStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: string;
}) {
  return (
    <div>
      <p className="text-[9px] uppercase tracking-[0.14em]" style={{ color: "var(--text-muted)" }}>
        {label}
      </p>
      <p className="mono mt-1 text-[20px] font-semibold" style={{ color: tone }}>
        {value}
      </p>
    </div>
  );
}

function BigNumber({
  value,
  label,
  tone = "var(--text)",
}: {
  value: string;
  label: string;
  tone?: string;
}) {
  return (
    <div>
      <p className="mono text-2xl font-semibold" style={{ color: tone }}>
        {value}
      </p>
      <p className="text-[9px] uppercase tracking-[0.14em]" style={{ color: "var(--text-muted)" }}>
        {label}
      </p>
    </div>
  );
}

function CompareBar({
  label,
  height,
  value,
  tone,
}: {
  label: string;
  height: number;
  value: string;
  tone: string;
}) {
  return (
    <div className="flex flex-1 flex-col items-center">
      <span className="mono text-[11px]" style={{ color: tone }}>
        {value}
      </span>
      <span
        className="mt-1 w-full rounded-t-sm"
        style={{
          height,
          background: tone,
          opacity: 0.82,
        }}
      />
      <span className="mt-1 text-[9px] uppercase tracking-[0.14em]" style={{ color: "var(--text-muted)" }}>
        {label}
      </span>
    </div>
  );
}

function DecisionDot({
  children,
  tone,
}: {
  children: ReactNode;
  tone: string;
}) {
  return (
    <span
      className="mono grid h-8 w-8 place-items-center rounded-full text-[12px] font-semibold"
      style={{
        color: "var(--bg)",
        background: tone,
      }}
    >
      {children}
    </span>
  );
}
