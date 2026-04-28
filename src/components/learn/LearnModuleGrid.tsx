"use client";

import Link from "next/link";
import type { LearnModule } from "@/data/modules";
import { usePortal } from "@/lib/state/PortalContext";

/**
 * Renders the six-module grid on the Learn home page. Reads
 * completion state from PortalContext so a green "completed" indicator
 * appears once a user has marked a module done. Hovering a card
 * triggers the spotlight glow inherited from arminoorata.com.
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
              className="spotlight-card relative block h-full rounded-[var(--radius-card)] border p-5 transition-colors"
              style={{
                borderColor: done
                  ? "var(--green-border)"
                  : "var(--line)",
                background: "var(--surface)",
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <span aria-hidden className="text-2xl">
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
                className="mt-4 text-lg font-semibold leading-tight"
                style={{ color: "var(--text)" }}
              >
                {m.title}
              </h3>
              <p
                className="mt-2 text-[14px] leading-6"
                style={{ color: "var(--text-secondary)" }}
              >
                {m.blurb}
              </p>
              {done && (
                <p
                  className="mt-4 inline-flex items-center gap-1.5 text-[11px] font-semibold"
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
