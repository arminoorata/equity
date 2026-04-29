"use client";

import { useState } from "react";
import OptionsCalculator from "./OptionsCalculator";
import RsuCalculator from "./RsuCalculator";
import ScenarioCompare from "./ScenarioCompare";
import OfferCompare from "./OfferCompare";
import DilutionScenarios from "./DilutionScenarios";
import { usePortal } from "@/lib/state/PortalContext";

type SubView = "options" | "rsus" | "compare" | "offers" | "dilution";

const tabs: Array<{ id: SubView; label: string; icon: string }> = [
  { id: "options", label: "Options", icon: "⭐" },
  { id: "rsus", label: "RSUs", icon: "🔒" },
  { id: "compare", label: "Compare", icon: "🔀" },
  { id: "offers", label: "Offers", icon: "📨" },
  { id: "dilution", label: "What it's worth", icon: "🪙" },
];

/**
 * Calculators tab body. Five sub-views: Options, RSUs, Compare (the
 * three-strategy comparison from the spec), Offers (offer-vs-offer
 * comparison from TR feedback #3), and "What it's worth" (dilution
 * + preferences from TR feedback #4).
 */
export default function CalculatorsView() {
  const { profile } = usePortal();
  const [view, setView] = useState<SubView>("options");
  const firstOption = profile.grants.find(
    (g) => g.type === "iso" || g.type === "nso",
  );
  const firstRsu = profile.grants.find((g) => g.type === "rsu");

  // Re-mount each calculator when its source grant changes so lazy
  // useState pre-fill picks up the new values. Include the editable
  // pre-fill fields in the key so a drawer edit cascades.
  const optionKey = firstOption
    ? `${firstOption.id}-${firstOption.type}-${firstOption.shares}-${firstOption.strike}-${firstOption.exerciseWindowDays}`
    : "no-option";
  const rsuKey = firstRsu ? `${firstRsu.id}-${firstRsu.shares}` : "no-rsu";

  return (
    <div>
      <ul
        className="flex flex-wrap gap-2"
        role="radiogroup"
        aria-label="Calculator"
      >
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
        {view === "options" && (
          <OptionsCalculator key={optionKey} profile={profile} />
        )}
        {view === "rsus" && <RsuCalculator key={rsuKey} profile={profile} />}
        {view === "compare" && (
          <ScenarioCompare key={optionKey} profile={profile} />
        )}
        {view === "offers" && <OfferCompare />}
        {view === "dilution" && (
          <DilutionScenarios key={optionKey} profile={profile} />
        )}
      </div>

      <p
        className="mt-8 text-xs italic leading-6"
        style={{ color: "var(--text-muted)" }}
      >
        Educational, not tax advice. Outputs depend entirely on your
        inputs. Talk to a qualified tax advisor before making real
        exercise, sale, or offer decisions.
      </p>
    </div>
  );
}
