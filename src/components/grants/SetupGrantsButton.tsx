"use client";

import { usePortal } from "@/lib/state/PortalContext";

/**
 * "Set up your grants" / "Edit grants" CTA. Reads PortalContext to
 * decide which label to render and opens the grant builder drawer.
 */
export default function SetupGrantsButton({
  variant = "primary",
  className = "",
  labelOverride,
  labelOverrideExisting,
}: {
  variant?: "primary" | "ghost";
  className?: string;
  /** Use this label when the user has not set up any grants yet. */
  labelOverride?: string;
  /** Use this label when the user already has grants set up. Falls back to labelOverride or the default "Edit your grants". */
  labelOverrideExisting?: string;
}) {
  const { openBuilder, profile } = usePortal();
  const hasGrants = profile.grants.length > 0;
  const defaultLabel = hasGrants ? "Edit your grants" : "Set up your grants";
  const label = hasGrants
    ? labelOverrideExisting ?? labelOverride ?? defaultLabel
    : labelOverride ?? defaultLabel;

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
