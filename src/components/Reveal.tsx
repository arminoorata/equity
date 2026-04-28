"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Scroll-triggered fade-and-rise. SSR-safe: content is fully visible by
 * default; the .reveal-hidden class is only applied client-side AFTER
 * confirming the element is below the fold. Above-the-fold content
 * therefore never flashes from invisible to visible.
 *
 * Honors prefers-reduced-motion (CSS gates the animation, but we also
 * skip the IntersectionObserver work in that case so we don't pay the
 * cost). Mirrors arminoorata.com's <Reveal>.
 */
export default function Reveal({
  children,
  delay = 0,
}: {
  children: ReactNode;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [hidden, setHidden] = useState(false);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !ref.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const el = ref.current;
    const rect = el.getBoundingClientRect();
    const belowFold = rect.top > window.innerHeight - 40;
    if (!belowFold) return;

    setHidden(true);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            window.setTimeout(() => setShown(true), delay);
            observer.disconnect();
          }
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  const className = hidden
    ? shown
      ? "reveal-shown"
      : "reveal-hidden"
    : "";

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
