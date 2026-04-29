"use client";

import { usePortal } from "@/lib/state/PortalContext";

/**
 * "Set up your grants" / "Edit grants" CTA. Reads PortalContext to
 * decide which label to render and opens the grant builder drawer.
 */
export default function SetupGrantsButton({
  variant = "primary",
  className = "",
}: {
  variant?: "primary" | "ghost";
  className?: string;
}) {
  const { openBuilder, profile } = usePortal();
  const hasGrants = profile.grants.length > 0;
  const label = hasGrants ? "Edit your grants" : "Set up your grants";

  if (variant === "ghost") {
    return (
      <button
        type="button"
        onClick={openBuilder}
        className={`underline underline-offset-4 ${className}`}
        style={{ color: "var(--accent)" }}
      >
        {label}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={openBuilder}
      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ${className}`}
      style={{
        background: "var(--accent)",
        color: "var(--bg)",
      }}
    >
      <span aria-hidden>↳</span>
      <span>{label}</span>
    </button>
  );
}
