"use client";

import { useState } from "react";
import ExerciseFramework from "./ExerciseFramework";
import PteCalculator from "./PteCalculator";
import { usePortal } from "@/lib/state/PortalContext";

type SubView = "framework" | "pte";

const tabs: Array<{ id: SubView; label: string; icon: string }> = [
  { id: "framework", label: "Framework", icon: "🧭" },
  { id: "pte", label: "Post-termination clock", icon: "⏰" },
];

/**
 * Exercise tab body. Two sub-views: the five-step decision framework
 * and the post-termination exercise calculator added in response to
 * the TR-leader review (point #1).
 */
export default function ExerciseView() {
  const { profile } = usePortal();
  const [view, setView] = useState<SubView>("framework");
  const firstOption = profile.grants.find(
    (g) => g.type === "iso" || g.type === "nso",
  );
  // Remount on edit to any pre-fill field, since lazy initializers
  // don't otherwise pick up downstream changes.
  const pteKey = firstOption
    ? `${firstOption.id}-${firstOption.type}-${firstOption.shares}-${firstOption.strike}-${firstOption.exerciseWindowDays}-${firstOption.vestStartDate}-${firstOption.cliffMonths}-${firstOption.vestYears}-${firstOption.vestMonths}`
    : "no-option";

  return (
    <div>
      <ul className="flex flex-wrap gap-2" role="radiogroup" aria-label="Exercise sub-view">
        {tabs.map((t) => {
          const active = view === t.id;
          return (
            <li key={t.id}>
              <button
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setView(t.id)}
                className="inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm transition-colors"
                style={{
                  borderColor: active ? "var(--accent)" : "var(--line)",
                  background: active ? "var(--accent-soft)" : "var(--surface)",
                  color: active ? "var(--text)" : "var(--text-secondary)",
                  fontWeight: active ? 600 : 500,
                }}
              >
                <span aria-hidden>{t.icon}</span>
                <span>{t.label}</span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="mt-8">
        {view === "framework" && <ExerciseFramework />}
        {view === "pte" && <PteCalculator key={pteKey} />}
      </div>

      <p
        className="mt-8 text-xs italic leading-6"
        style={{ color: "var(--text-muted)" }}
      >
        Educational only. Tax treatment depends on your full picture.
        Talk to a qualified tax advisor before exercising or letting
        anything expire.
      </p>
    </div>
  );
}
