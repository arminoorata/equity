"use client";

import { useEffect, useId, useRef, useState } from "react";

/**
 * Inline glossary term. Renders a subtly underlined span; the
 * definition appears on hover (mouse), focus (keyboard), or tap. The
 * popover stays visible while the pointer is anywhere inside the
 * wrapper, and while focus is inside the wrapper, so users can read
 * the full text without it dismissing on them.
 *
 * The popover uses role="tooltip" with text content only. The full
 * glossary entry lives at /glossary#slug; the popover does not
 * include navigation, which keeps the role consistent and avoids
 * the keyboard-trap problem of putting interactive controls inside
 * a hover-dismissed surface.
 */
export default function GlossaryTerm({
  term,
  definition,
}: {
  term: string;
  definition: string;
  slug: string;
}) {
  const [hover, setHover] = useState(false);
  const [focus, setFocus] = useState(false);
  const [pinned, setPinned] = useState(false);
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const id = useId();

  const open = hover || focus || pinned;

  // Close on escape; close on outside click for the pinned (tap) state.
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
        // Only close when focus leaves the entire wrapper.
        if (!wrapperRef.current?.contains(e.relatedTarget as Node | null)) {
          setFocus(false);
        }
      }}
    >
      <button
        type="button"
        aria-describedby={open ? id : undefined}
        aria-expanded={open}
        onClick={() => setPinned((v) => !v)}
        className="cursor-help"
        style={{
          color: "inherit",
          background: "transparent",
          padding: 0,
          textDecorationLine: "underline",
          textDecorationStyle: "dotted",
          textDecorationColor: "var(--accent)",
          textUnderlineOffset: 4,
        }}
      >
        {term}
      </button>
      {open && (
        <span
          role="tooltip"
          id={id}
          // No vertical gap between trigger and tooltip: an absolutely
          // positioned popover with margin-top would create dead space
          // that breaks the hover-into-tooltip path. Touching is fine
          // visually because the popover has its own border and shadow.
          className="absolute left-0 top-full z-10 w-72 max-w-[80vw] rounded-md border px-3 pt-2.5 pb-2.5 text-[13px] leading-5 shadow-lg"
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
            {term}
          </span>
          <span className="mt-1 block">{definition}</span>
        </span>
      )}
    </span>
  );
}
