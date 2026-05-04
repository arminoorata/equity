"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";

/**
 * Small info icon for form labels. Same hover/focus/tap behavior as
 * the Abbr component used inline in body copy: pointer events open a
 * popover, ESC closes, click outside closes the pinned state. Built
 * for calculator fields where a layman reader needs a one-paragraph
 * explanation of what the field is and what number to type in.
 *
 * The trigger is a 16px circled "i" so it sits comfortably next to a
 * label without dominating the form. The popover anchors below the
 * icon (top-full, no margin gap so cursor transit doesn't dismiss).
 */
export default function FieldInfo({
  title,
  children,
}: {
  /** Short headline for the popover. */
  title: string;
  /** The body explanation. */
  children: ReactNode;
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
      className="relative inline-block align-middle"
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
        aria-label={`What is ${title}?`}
        aria-describedby={open ? id : undefined}
        aria-expanded={open}
        onClick={(e) => {
          e.preventDefault();
          setPinned((v) => !v);
        }}
        className="inline-flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold leading-none cursor-help"
        style={{
          color: "var(--accent)",
          background: "var(--surface-alt)",
          border: "1px solid var(--line)",
          padding: 0,
          font: "inherit",
          fontWeight: 700,
          fontSize: "10px",
        }}
      >
        i
      </button>
      {open && (
        <span
          role="tooltip"
          id={id}
          className="absolute left-0 top-full z-20 w-72 max-w-[80vw] rounded-md border px-3 pt-2.5 pb-2.5 text-[13px] leading-5 shadow-lg"
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
          <span className="mt-1 block normal-case tracking-normal">
            {children}
          </span>
        </span>
      )}
    </span>
  );
}
