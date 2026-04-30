"use client";

import Link from "next/link";
import type { LearnModule } from "@/data/modules";
import { usePortal } from "@/lib/state/PortalContext";

/**
 * Module tiles on the Learn home. Visual-first: large icon, outcome-
 * oriented title (cardTitle), and minute count. No body paragraph —
 * the original blurb still lives on the module data for SEO/metadata
 * but we don't render it on the tile. Hover triggers the inherited
 * spotlight glow.
 */
export default function LearnModuleGrid({
  modules,
}: {
  modules: LearnModule[];
}) {
  const { completedModules } = usePortal();

  return (
    <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {modules.map((m) => {
        const done = Boolean(completedModules[m.id]);
        return (
          <li key={m.id}>
            <Link
              href={`/learn/${m.id}`}
              className="spotlight-card relative flex h-full flex-col rounded-[var(--radius-card)] border p-5 transition-colors"
              style={{
                borderColor: done
                  ? "var(--green-border)"
                  : "var(--line)",
                background: "var(--surface)",
                minHeight: 156,
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <span
                  aria-hidden
                  className="text-3xl leading-none"
                  style={{ filter: "drop-shadow(0 1px 0 rgba(0,0,0,0.3))" }}
                >
                  {m.icon}
                </span>
                <span
                  className="text-[10px] uppercase tracking-[0.18em]"
                  style={{ color: "var(--text-muted)" }}
                >
                  <span className="mono">{m.minutes}</span> min
                </span>
              </div>
              <h3
                className="mt-auto pt-6 text-[17px] font-semibold leading-snug tracking-tight"
                style={{ color: "var(--text)" }}
              >
                {m.cardTitle ?? m.title}
              </h3>
              {done && (
                <p
                  className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-semibold"
                  style={{ color: "var(--green)" }}
                >
                  <span aria-hidden>✓</span> Completed
                </p>
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
