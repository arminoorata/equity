"use client";

import { useState } from "react";
import LearnModuleGrid from "@/components/learn/LearnModuleGrid";
import {
  learningPaths,
  pathLeadIns,
  type GrantType,
} from "@/data/learning-paths";
import type { LearnModule } from "@/data/modules";

const options: Array<{ id: GrantType; label: string; icon: string }> = [
  { id: "iso", label: "ISOs", icon: "⭐" },
  { id: "nso", label: "NSOs", icon: "📋" },
  { id: "rsu", label: "RSUs", icon: "🔒" },
  { id: "mix", label: "A mix", icon: "🧩" },
  { id: "unsure", label: "Not sure", icon: "🤔" },
];

const featuredByGrant: Record<GrantType, string | null> = {
  iso: "isos",
  nso: "nsos",
  rsu: "rsus",
  mix: "basics",
  unsure: "basics",
};

/**
 * "What do you have?" selector that re-orders the module grid based
 * on the grant type the user selects. State is local to this
 * component; the Learn home page renders nothing personalized
 * server-side, so SEO and shareable URLs are unaffected. Default view
 * (no selection) still shows all six modules in canonical order.
 */
export default function PathSelector({
  modules,
}: {
  modules: LearnModule[];
}) {
  const [selected, setSelected] = useState<GrantType | null>(null);

  const order = selected ? learningPaths[selected] : modules.map((m) => m.id);
  const orderedModules = order
    .map((id) => modules.find((m) => m.id === id))
    .filter((m): m is LearnModule => Boolean(m));

  return (
    <section aria-label="Pick a starting point">
      <h2 className="text-2xl font-medium tracking-tight md:text-3xl">
        What do you have?
      </h2>
      <p
        className="mt-2 text-[14.5px] leading-7"
        style={{ color: "var(--text-muted)" }}
      >
        Pick one. The path changes around your grant.
      </p>

      <ul
        className="mt-6 flex flex-wrap gap-2"
        role="radiogroup"
        aria-label="Grant type"
      >
        {options.map((opt) => {
          const active = selected === opt.id;
          return (
            <li key={opt.id}>
              <button
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setSelected(active ? null : opt.id)}
                className="inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm transition-colors"
                style={{
                  borderColor: active ? "var(--accent)" : "var(--line)",
                  background: active
                    ? "var(--accent-soft)"
                    : "var(--surface)",
                  color: active ? "var(--text)" : "var(--text-secondary)",
                  fontWeight: active ? 600 : 500,
                }}
              >
                <span aria-hidden>{opt.icon}</span>
                <span>{opt.label}</span>
              </button>
            </li>
          );
        })}
      </ul>

      {selected && (
        <p
          className="mt-4 text-[14px] leading-6"
          style={{ color: "var(--text-secondary)" }}
        >
          {pathLeadIns[selected]}
        </p>
      )}

      <div className="mt-8">
        <LearnModuleGrid
          modules={orderedModules}
          featuredModuleId={selected ? featuredByGrant[selected] : null}
        />
      </div>
    </section>
  );
}
