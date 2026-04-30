"use client";

import { useEffect, useRef, useState } from "react";
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

  // Lock background scroll, save the previously-focused element so we
  // can restore focus on close, and inert the rest of the page so
  // assistive tech does not see siblings of the dialog.
  const drawerRef = useRef<HTMLElement | null>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (typeof document === "undefined") return;
    if (builderOpen) {
      previouslyFocusedRef.current = document.activeElement as HTMLElement | null;
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prevOverflow;
        if (previouslyFocusedRef.current && previouslyFocusedRef.current.focus) {
          try {
            previouslyFocusedRef.current.focus();
          } catch {
            // ignore focus-restore failures
          }
        }
      };
    }
  }, [builderOpen]);

  // Initial focus: move focus to the first focusable inside the drawer.
  useEffect(() => {
    if (!builderOpen) return;
    const t = setTimeout(() => {
      const drawer = drawerRef.current;
      if (!drawer) return;
      const first = drawer.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      first?.focus();
    }, 0);
    return () => clearTimeout(t);
  }, [builderOpen]);

  // Close on Escape, and trap Tab inside the drawer while open.
  useEffect(() => {
    if (!builderOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeBuilder();
        return;
      }
      if (e.key !== "Tab") return;
      const drawer = drawerRef.current;
      if (!drawer) return;
      const focusables = drawer.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      const enabled = Array.from(focusables).filter(
        (el) => !el.hasAttribute("disabled") && el.offsetParent !== null,
      );
      if (enabled.length === 0) return;
      const first = enabled[0];
      const last = enabled[enabled.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
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
        ref={drawerRef}
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
  step = 1,
  prefix,
}: {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
  step?: number;
  prefix?: string;
}) {
  const allowDecimal = step < 1;
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [display, setDisplay] = useState(() =>
    formatDisplay(value, allowDecimal),
  );

  useEffect(() => {
    if (display === "") return;
    const parsed = parseClean(display);
    if (parsed === null) return;
    if (parsed !== value) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDisplay(formatDisplay(value, allowDecimal));
    }
  }, [value, allowDecimal, display]);

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
        ref={inputRef}
        type="text"
        inputMode={allowDecimal ? "decimal" : "numeric"}
        value={display}
        onChange={(e) => {
          const input = e.target as HTMLInputElement;
          const raw = input.value;
          const cursor = input.selectionStart ?? raw.length;
          const digitsBefore = countDigitsBefore(raw, cursor);

          const reformatted = reformat(raw, allowDecimal);
          setDisplay(reformatted);

          const parsed = parseClean(reformatted);
          if (parsed !== null && Number.isFinite(parsed)) {
            const clamped = Math.min(
              max ?? Number.POSITIVE_INFINITY,
              Math.max(min ?? Number.NEGATIVE_INFINITY, parsed),
            );
            if (clamped !== value) onChange(clamped);
          }

          requestAnimationFrame(() => {
            const node = inputRef.current;
            if (!node) return;
            const next = positionForDigitsBefore(reformatted, digitsBefore);
            try {
              node.setSelectionRange(next, next);
            } catch {
              // ignore
            }
          });
        }}
        onBlur={() => {
          setDisplay(formatDisplay(value, allowDecimal));
        }}
        className="mono w-full bg-transparent text-[14px]"
        style={{ color: "var(--text)" }}
      />
    </span>
  );
}

function formatDisplay(n: number, allowDecimal: boolean): string {
  if (!Number.isFinite(n)) return "";
  if (allowDecimal) {
    return n.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 6,
    });
  }
  return Math.round(n).toLocaleString("en-US");
}

function reformat(raw: string, allowDecimal: boolean): string {
  const cleaned = allowDecimal
    ? raw.replace(/[^\d.]/g, "")
    : raw.replace(/[^\d]/g, "");
  if (cleaned === "") return "";
  if (allowDecimal) {
    const firstDot = cleaned.indexOf(".");
    let intPart: string;
    let decPart: string | undefined;
    if (firstDot === -1) {
      intPart = cleaned;
      decPart = undefined;
    } else {
      intPart = cleaned.slice(0, firstDot);
      decPart = cleaned.slice(firstDot + 1).replace(/\./g, "");
    }
    const intFormatted =
      intPart === "" ? "" : Number(intPart).toLocaleString("en-US");
    return decPart !== undefined ? `${intFormatted}.${decPart}` : intFormatted;
  }
  return Number(cleaned).toLocaleString("en-US");
}

function parseClean(s: string): number | null {
  const cleaned = s.replace(/,/g, "");
  if (cleaned === "" || cleaned === ".") return null;
  const num = Number(cleaned);
  return Number.isFinite(num) ? num : null;
}

function countDigitsBefore(text: string, cursor: number): number {
  let count = 0;
  for (let i = 0; i < cursor && i < text.length; i++) {
    if (/[0-9.]/.test(text[i])) count++;
  }
  return count;
}

function positionForDigitsBefore(text: string, digitsBefore: number): number {
  let count = 0;
  for (let i = 0; i < text.length; i++) {
    if (count === digitsBefore) return i;
    if (/[0-9.]/.test(text[i])) count++;
  }
  return text.length;
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
        // colorScheme keeps the native date picker (calendar popup,
        // year/month dropdowns) styled to match light/dark theme so
        // the icon and dropdown text don't disappear in dark mode.
        style={{ color: "var(--text)", colorScheme: "light dark" }}
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
