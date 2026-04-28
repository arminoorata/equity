"use client";

import { usePortal } from "@/lib/state/PortalContext";

/**
 * Toggle button for marking a module complete. State lives in
 * PortalContext (in-memory only, per the privacy posture in the spec).
 * Resets when the user hits the global Reset action.
 */
export default function ModuleCompletionButton({
  moduleId,
}: {
  moduleId: string;
}) {
  const { completedModules, markModuleComplete, unmarkModuleComplete } =
    usePortal();
  const done = Boolean(completedModules[moduleId]);

  return (
    <button
      type="button"
      onClick={() =>
        done ? unmarkModuleComplete(moduleId) : markModuleComplete(moduleId)
      }
      className="btn"
      aria-pressed={done}
    >
      {done ? "✓ Completed" : "Mark complete"}
    </button>
  );
}
