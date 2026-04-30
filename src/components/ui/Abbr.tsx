"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";

/**
 * Reusable abbreviation tooltip. Wraps a short label (LTCG, AMT, FMV)
 * with a dotted-underline trigger that reveals an explanation on
 * hover, focus, or tap. Keeps the same visual language as the inline
 * GlossaryTerm component on module pages so users get one consistent
 * "this thing has more info" cue across the site.
 *
 * Server-renderable parent, client-only popover (state, escape close,
 * outside click, focus-within preservation).
 */
export default function Abbr({
  label,
  title,
  children,
}: {
  label: ReactNode;
  /** Short headline for the popover (e.g. "Long-Term Capital Gains"). */
  title: string;
  /** Optional extra body text. */
  children?: ReactNode;
}) {
  const [hover, setHover] = useState(false);
  const [focus, setFocus] = useState(false);
  const [pinned, setPinned] = useState(false);
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const id = useId();

  const open = hover || focus || pinned;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setPinned(false);
        setHover(false);
        setFocus(false);
      }
    };
    const onDoc = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setPinned(false);
      }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDoc);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDoc);
    };
  }, [open]);

  return (
    <span
      ref={wrapperRef}
      className="relative inline-block"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setFocus(true)}
      onBlur={(e) => {
        if (!wrapperRef.current?.contains(e.relatedTarget as Node | null)) {
          setFocus(false);
        }
      }}
    >
      <button
        type="button"
        aria-describedby={open ? id : undefined}
        aria-expanded={open}
        onClick={(e) => {
          e.preventDefault();
          setPinned((v) => !v);
        }}
        className="cursor-help"
        style={{
          color: "inherit",
          background: "transparent",
          padding: 0,
          textDecorationLine: "underline",
          textDecorationStyle: "dotted",
          textDecorationColor: "var(--accent)",
          textUnderlineOffset: 4,
          font: "inherit",
        }}
      >
        {label}
      </button>
      {open && (
        <span
          role="tooltip"
          id={id}
          className="absolute left-0 top-full z-10 w-64 max-w-[80vw] rounded-md border px-3 pt-2.5 pb-2.5 text-[13px] leading-5 shadow-lg"
          style={{
            borderColor: "var(--line)",
            background: "var(--surface)",
            color: "var(--text-secondary)",
            whiteSpace: "normal",
          }}
        >
          <span
            className="block text-[11px] font-semibold uppercase tracking-[0.18em]"
            style={{ color: "var(--accent)" }}
          >
            {title}
          </span>
          {children && <span className="mt-1 block">{children}</span>}
        </span>
      )}
    </span>
  );
}
