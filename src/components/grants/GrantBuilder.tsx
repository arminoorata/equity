"use client";

import { useEffect } from "react";
import {
  defaultGrant,
  usePortal,
  type Grant,
  type GrantType,
} from "@/lib/state/PortalContext";

/**
 * Side drawer for entering grants. Inputs match spec/03-DATA-MODELS.md
 * and spec/02-FEATURES.md F4. The drawer is mounted once at the root
 * and toggled via PortalContext.builderOpen.
 *
 * One card per grant. Top-of-drawer settings (company status, remember
 * toggle) apply across all grants.
 */
export default function GrantBuilder() {
  const {
    profile,
    addGrant,
    updateGrant,
    removeGrant,
    setCompanyType,
    rememberGrants,
    setRememberGrants,
    builderOpen,
    closeBuilder,
    setProfile,
  } = usePortal();

  // Seed first grant when the drawer opens with none.
  useEffect(() => {
    if (builderOpen && profile.grants.length === 0) {
      setProfile({ ...profile, grants: [defaultGrant()] });
    }
  }, [builderOpen, profile, setProfile]);

  // Lock background scroll while open.
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (builderOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [builderOpen]);

  // Close on Escape.
  useEffect(() => {
    if (!builderOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeBuilder();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [builderOpen, closeBuilder]);

  if (!builderOpen) return null;

  const isoDate = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s);
  const anyInvalid = profile.grants.some(
    (g) =>
      g.shares <= 0 ||
      ((g.type === "iso" || g.type === "nso") && g.strike <= 0) ||
      !isoDate(g.date) ||
      !isoDate(g.vestStartDate),
  );

  return (
    <div
      className="fixed inset-0 z-50 flex"
      role="dialog"
      aria-modal="true"
      aria-label="Grant builder"
    >
      <button
        type="button"
        aria-label="Close grant builder"
        onClick={closeBuilder}
        className="flex-1 cursor-default"
        style={{ background: "rgba(0,0,0,0.55)" }}
      />
      <aside
        className="flex h-full w-full max-w-xl flex-col overflow-hidden border-l shadow-2xl"
        style={{
          borderColor: "var(--line)",
          background: "var(--bg)",
        }}
      >
        <header
          className="flex items-center justify-between border-b px-6 py-4"
          style={{ borderColor: "var(--line)" }}
        >
          <div>
            <p
              className="text-[11px] font-medium uppercase tracking-[0.32em]"
              style={{ color: "var(--accent)" }}
            >
              Your grants
            </p>
            <h2 className="mt-1 text-xl font-medium tracking-tight">
              Set up the math
            </h2>
          </div>
          <button
            type="button"
            onClick={closeBuilder}
            className="rounded-full px-3 py-1 text-sm"
            style={{ color: "var(--text-muted)", background: "var(--surface)" }}
          >
            Close
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <p
            className="text-sm leading-6"
            style={{ color: "var(--text-secondary)" }}
          >
            Enter what you have. Numbers stay on this device and never leave
            it. Refresh clears them, unless you turn on the remember toggle
            below to keep them in this browser&rsquo;s local storage.
          </p>

          <div
            className="mt-5 flex flex-wrap items-center gap-3 rounded-md border p-3"
            style={{
              borderColor: "var(--line)",
              background: "var(--surface)",
            }}
          >
            <span
              className="text-[11px] font-medium uppercase tracking-[0.18em]"
              style={{ color: "var(--text-muted)" }}
            >
              Company status
            </span>
            <Toggle
              options={[
                { id: "private", label: "Private" },
                { id: "public", label: "Public" },
              ]}
              value={profile.companyType}
              onChange={(v) => setCompanyType(v as "private" | "public")}
            />
          </div>

          <div className="mt-5 space-y-5">
            {profile.grants.map((g, i) => (
              <GrantCard
                key={g.id}
                index={i}
                grant={g}
                canRemove={profile.grants.length > 1}
                onChange={(patch) => updateGrant(g.id, patch)}
                onRemove={() => removeGrant(g.id)}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => addGrant()}
            className="mt-5 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm"
            style={{
              borderColor: "var(--accent-soft)",
              color: "var(--accent)",
            }}
          >
            <span aria-hidden>+</span>
            <span>Add grant</span>
          </button>

          <label
            className="mt-6 flex items-center gap-2 text-sm"
            style={{ color: "var(--text-secondary)" }}
          >
            <input
              type="checkbox"
              checked={rememberGrants}
              onChange={(e) => setRememberGrants(e.target.checked)}
            />
            <span>Remember my grants on this device (localStorage only)</span>
          </label>
          <p
            className="mt-1 text-xs leading-5"
            style={{ color: "var(--text-muted)" }}
          >
            Off by default. Turning this on saves your grants in localStorage
            so they survive a refresh. Reset clears it.
          </p>
        </div>

        <footer
          className="flex items-center justify-between border-t px-6 py-4"
          style={{ borderColor: "var(--line)" }}
        >
          <p
            className="text-xs"
            style={{ color: "var(--text-muted)" }}
          >
            {anyInvalid
              ? "Add shares (and strike for options) to continue."
              : "Numbers update everywhere when you close."}
          </p>
          <button
            type="button"
            onClick={closeBuilder}
            disabled={anyInvalid}
            className="rounded-full px-4 py-1.5 text-sm font-medium"
            style={{
              background: anyInvalid ? "var(--surface)" : "var(--accent)",
              color: anyInvalid ? "var(--text-muted)" : "var(--bg)",
              opacity: anyInvalid ? 0.6 : 1,
            }}
          >
            Done
          </button>
        </footer>
      </aside>
    </div>
  );
}

function GrantCard({
  index,
  grant,
  canRemove,
  onChange,
  onRemove,
}: {
  index: number;
  grant: Grant;
  canRemove: boolean;
  onChange: (patch: Partial<Grant>) => void;
  onRemove: () => void;
}) {
  const isOption = grant.type === "iso" || grant.type === "nso";
  const totalVestMonths = grant.vestYears * 12 + grant.vestMonths;
  const cliffOver = grant.cliffMonths > totalVestMonths && totalVestMonths > 0;

  return (
    <div
      className="rounded-md border p-4"
      style={{
        borderColor: "var(--line)",
        background: "var(--surface)",
      }}
    >
      <div className="flex items-center justify-between">
        <p
          className="text-[11px] font-medium uppercase tracking-[0.18em]"
          style={{ color: "var(--text-muted)" }}
        >
          Grant {index + 1}
        </p>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="text-xs underline underline-offset-4"
            style={{ color: "var(--text-muted)" }}
          >
            Remove
          </button>
        )}
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
        <Field label="Type">
          <Toggle
            options={[
              { id: "iso", label: "ISO" },
              { id: "nso", label: "NSO" },
              { id: "rsu", label: "RSU" },
            ]}
            value={grant.type}
            onChange={(v) => {
              const next = v as GrantType;
              const wasRsu = grant.type === "rsu";
              if (next === "rsu") {
                onChange({ type: next, strike: 0, earlyExerciseAllowed: false });
              } else if (wasRsu) {
                onChange({ type: next, strike: grant.strike > 0 ? grant.strike : 1 });
              } else {
                onChange({ type: next });
              }
            }}
          />
        </Field>
        <Field label="Shares">
          <NumberField
            value={grant.shares}
            onChange={(n) => onChange({ shares: n })}
            min={1}
            step={100}
          />
        </Field>
        {isOption && (
          <Field label="Strike ($)">
            <NumberField
              value={grant.strike}
              onChange={(n) => onChange({ strike: n })}
              min={0}
              step={0.01}
              prefix="$"
            />
          </Field>
        )}
        <Field label="Grant date">
          <DateField
            value={grant.date}
            onChange={(s) => onChange({ date: s })}
          />
        </Field>
        <Field label="Vest start date">
          <DateField
            value={grant.vestStartDate}
            onChange={(s) => onChange({ vestStartDate: s })}
          />
        </Field>
        <Field label="Cliff (months)">
          <NumberField
            value={grant.cliffMonths}
            onChange={(n) => onChange({ cliffMonths: n })}
            min={0}
            max={24}
            step={1}
          />
        </Field>
        <Field label="Vest years">
          <NumberField
            value={grant.vestYears}
            onChange={(n) => onChange({ vestYears: n })}
            min={0}
            max={10}
            step={1}
          />
        </Field>
        <Field label="Vest months">
          <NumberField
            value={grant.vestMonths}
            onChange={(n) => onChange({ vestMonths: n })}
            min={0}
            max={11}
            step={1}
          />
        </Field>
        {isOption && (
          <Field label="Exercise window (days post-termination)">
            <NumberField
              value={grant.exerciseWindowDays}
              onChange={(n) => onChange({ exerciseWindowDays: n })}
              min={0}
              max={3650}
              step={1}
            />
          </Field>
        )}
        {isOption && (
          <Field label="Early exercise allowed?">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={grant.earlyExerciseAllowed}
                onChange={(e) =>
                  onChange({ earlyExerciseAllowed: e.target.checked })
                }
              />
              <span style={{ color: "var(--text-secondary)" }}>
                Yes, my plan allows it
              </span>
            </label>
          </Field>
        )}
      </div>

      {cliffOver && (
        <p
          className="mt-3 text-xs"
          style={{ color: "var(--amber)" }}
          role="alert"
        >
          Your cliff is longer than your vesting period. Is that intentional?
        </p>
      )}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span
        className="text-[11px] font-medium uppercase tracking-[0.14em]"
        style={{ color: "var(--text-muted)" }}
      >
        {label}
      </span>
      {children}
    </label>
  );
}

function NumberField({
  value,
  onChange,
  min,
  max,
  step,
  prefix,
}: {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
  step?: number;
  prefix?: string;
}) {
  return (
    <span
      className="inline-flex w-full items-center gap-2 rounded-md border px-2.5 py-1.5"
      style={{ borderColor: "var(--border)", background: "var(--bg)" }}
    >
      {prefix && (
        <span style={{ color: "var(--text-muted)" }} className="text-sm">
          {prefix}
        </span>
      )}
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => {
          const next = Number(e.target.value);
          if (Number.isFinite(next)) {
            const clamped = Math.min(
              max ?? Number.POSITIVE_INFINITY,
              Math.max(min ?? Number.NEGATIVE_INFINITY, next),
            );
            onChange(clamped);
          }
        }}
        className="mono w-full bg-transparent text-[14px]"
        style={{ color: "var(--text)" }}
      />
    </span>
  );
}

function DateField({
  value,
  onChange,
}: {
  value: string;
  onChange: (s: string) => void;
}) {
  return (
    <span
      className="inline-flex w-full items-center gap-2 rounded-md border px-2.5 py-1.5"
      style={{ borderColor: "var(--border)", background: "var(--bg)" }}
    >
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mono w-full bg-transparent text-[14px]"
        style={{ color: "var(--text)" }}
      />
    </span>
  );
}

function Toggle({
  options,
  value,
  onChange,
}: {
  options: Array<{ id: string; label: string }>;
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <div
      className="inline-flex flex-wrap gap-1 rounded-full border p-1"
      style={{ borderColor: "var(--line)", background: "var(--bg)" }}
      role="radiogroup"
    >
      {options.map((opt) => {
        const active = value === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.id)}
            className="rounded-full px-3 py-1 text-xs"
            style={{
              background: active ? "var(--accent-soft)" : "transparent",
              color: active ? "var(--text)" : "var(--text-muted)",
              fontWeight: active ? 600 : 500,
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
