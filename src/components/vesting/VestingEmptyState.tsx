"use client";

import SetupGrantsButton from "@/components/grants/SetupGrantsButton";

/**
 * Vesting tab empty state. Renders when no grants exist. Surfaces a
 * direct "Set up your grants" CTA so the user does not need to hunt
 * for it.
 */
export default function VestingEmptyState() {
  return (
    <div
      className="rounded-[var(--radius-card)] border p-6 md:p-8"
      style={{ borderColor: "var(--line)", background: "var(--surface)" }}
    >
      <p
        className="text-xs font-medium uppercase tracking-[0.32em]"
        style={{ color: "var(--accent)" }}
      >
        Nothing to schedule yet
      </p>
      <h2 className="mt-3 text-xl font-medium tracking-tight md:text-2xl">
        Add your grants and the schedule writes itself.
      </h2>
      <p
        className="mt-3 max-w-2xl text-sm leading-6"
        style={{ color: "var(--text-secondary)" }}
      >
        Type, share count, strike (for options), grant date, vesting
        start, cliff, and total vesting period. The tool figures out the
        cliff date, every monthly increment, what is vested today, and
        what is up next. Your numbers stay on this device.
      </p>
      <div className="mt-5">
        <SetupGrantsButton />
      </div>
    </div>
  );
}
