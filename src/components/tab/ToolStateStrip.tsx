"use client";

import { usePortal } from "@/lib/state/PortalContext";
import { modules } from "@/data/modules";

/**
 * Thin secondary row inside `app-main`. Renders only when at least one
 * grant exists. Shows compact grant chips, a Learn-progress count when
 * any modules are complete, and Edit / Reset actions on the right.
 */
export default function ToolStateStrip() {
  const {
    profile,
    completedModules,
    resetAll,
    openBuilder,
  } = usePortal();

  if (profile.grants.length === 0) return null;

  const completed = Object.keys(completedModules).length;
  const total = modules.length;

  return (
    <div
      className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 border-b px-6 py-3 md:px-10"
      style={{ borderColor: "var(--line)", background: "var(--surface-soft)" }}
    >
      <ul className="flex flex-wrap items-center gap-2">
        {profile.grants.map((grant) => (
          <li
            key={grant.id}
            className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs"
            style={{
              borderColor: "var(--accent-soft)",
              color: "var(--text-muted)",
            }}
          >
            <span aria-hidden>
              {grant.type === "iso" ? "⭐" : grant.type === "nso" ? "📋" : "🔒"}
            </span>
            <span className="mono" style={{ color: "var(--text-secondary)" }}>
              {grant.shares.toLocaleString()}
            </span>
            <span className="uppercase tracking-wider">{grant.type}</span>
            {grant.type !== "rsu" && grant.strike > 0 && (
              <span
                className="mono"
                style={{ color: "var(--text-muted)" }}
                aria-label="strike price"
              >
                @${grant.strike}
              </span>
            )}
          </li>
        ))}
      </ul>
      <div className="flex items-center gap-4 text-xs">
        {completed > 0 && (
          <span
            className="uppercase tracking-[0.18em]"
            style={{ color: "var(--text-muted)" }}
          >
            <span className="mono" style={{ color: "var(--text-secondary)" }}>
              {completed}/{total}
            </span>{" "}
            learn
          </span>
        )}
        <button
          type="button"
          onClick={openBuilder}
          className="underline underline-offset-4"
          style={{ color: "var(--text-secondary)" }}
        >
          Edit grants
        </button>
        <button
          type="button"
          onClick={() => {
            if (
              typeof window !== "undefined" &&
              window.confirm(
                "Reset everything? This clears your grants, chat history, and forgets your API key on this device.",
              )
            ) {
              resetAll();
            }
          }}
          className="underline underline-offset-4"
          style={{ color: "var(--text-muted)" }}
        >
          Reset
        </button>
      </div>
    </div>
  );
}
