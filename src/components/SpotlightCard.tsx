"use client";

import {
  useRef,
  type CSSProperties,
  type PointerEvent,
  type ReactNode,
} from "react";

/**
 * Cursor-tracked radial-glow card. Reads --spotlight-x/--spotlight-y
 * via CSS; the gradient itself lives in the .spotlight-card::before
 * pseudo-element. Reduced-motion users get no pointer handler and no
 * glow (CSS gates the ::before transition). Mirrors arminoorata.com.
 */
export default function SpotlightCard({
  children,
  className = "",
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);

  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--spotlight-x", `${e.clientX - rect.left}px`);
    el.style.setProperty("--spotlight-y", `${e.clientY - rect.top}px`);
  }

  return (
    <div
      ref={ref}
      onPointerMove={onPointerMove}
      className={`spotlight-card ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}
