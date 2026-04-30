"use client";

import { useId, useMemo, useRef, useState } from "react";
import {
  GLOSSARY_CATEGORIES,
  type GlossaryCategory,
  type GlossaryEntry,
} from "@/data/glossary";

/**
 * Interactive glossary surface. Three controls live above the list:
 *  - A search input that filters by term name or definition keyword.
 *  - A horizontal A-Z jump row for the letters that exist in the
 *    current (filtered) view; clicking a letter scrolls to its first
 *    matching entry.
 *  - A live "showing N of M" count.
 *
 * Below the controls, entries render as restrained surface cards in a
 * two-column grid on desktop and a single column on mobile. Each card
 * carries a small category chip so terms have a visual anchor besides
 * their alphabetical position.
 */
export default function GlossaryClient({
  entries,
}: {
  entries: GlossaryEntry[];
}) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<GlossaryCategory | null>(
    null,
  );
  const inputId = useId();
  const cardRefs = useRef<Record<string, HTMLLIElement | null>>({});

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return entries.filter((e) => {
      if (activeCategory && e.category !== activeCategory) return false;
      if (!q) return true;
      return (
        e.term.toLowerCase().includes(q) ||
        e.definition.toLowerCase().includes(q)
      );
    });
  }, [entries, query, activeCategory]);

  // Full A-Z orientation row plus a leading "#" bucket for entries
  // that start with a digit (83(b), 409A). Letters with no matches in
  // the current filtered view render in a disabled style so the row
  // stays a stable orientation device, not a moving target.
  const allLetters = useMemo(() => {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    const hasDigits = entries.some((e) => /^[0-9]/.test(e.term));
    return hasDigits ? ["#", ...letters] : letters;
  }, [entries]);

  const lettersPresent = useMemo(() => {
    const set = new Set<string>();
    for (const e of filtered) {
      const ch = e.term[0] ?? "";
      if (/[0-9]/.test(ch)) set.add("#");
      else if (/[A-Za-z]/.test(ch)) set.add(ch.toUpperCase());
    }
    return set;
  }, [filtered]);

  const jumpToLetter = (bucket: string) => {
    const target = filtered.find((e) => {
      const ch = e.term[0] ?? "";
      if (bucket === "#") return /[0-9]/.test(ch);
      return ch.toUpperCase() === bucket;
    });
    if (!target) return;
    const node = cardRefs.current[target.slug];
    if (node) {
      node.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div>
      <div
        className="mb-6 rounded-md border p-4 md:p-5"
        style={{
          borderColor: "var(--line)",
          background: "var(--surface)",
        }}
      >
        <label
          htmlFor={inputId}
          className="text-[11px] font-medium uppercase tracking-[0.18em]"
          style={{ color: "var(--text-muted)" }}
        >
          Search
        </label>
        <div className="mt-1.5 flex flex-wrap items-center gap-3">
          <input
            id={inputId}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search AMT, QSBS, 83(b), vesting..."
            className="min-w-0 flex-1 rounded-md border bg-transparent px-3 py-2 text-[14px]"
            style={{
              borderColor: "var(--border)",
              color: "var(--text)",
            }}
            autoComplete="off"
            spellCheck={false}
          />
          <p
            className="mono text-[12px] whitespace-nowrap"
            style={{ color: "var(--text-muted)" }}
          >
            {filtered.length === entries.length
              ? `${entries.length} terms`
              : `${filtered.length} of ${entries.length} matching`}
          </p>
          {(query || activeCategory) && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setActiveCategory(null);
              }}
              className="text-[12px] underline underline-offset-4"
              style={{ color: "var(--text-muted)" }}
            >
              Clear
            </button>
          )}
        </div>

        <div className="mt-4">
          <p
            className="text-[11px] font-medium uppercase tracking-[0.18em]"
            style={{ color: "var(--text-muted)" }}
          >
            Filter by category
          </p>
          <div
            className="mt-2 flex flex-wrap gap-1.5"
            role="radiogroup"
            aria-label="Glossary category"
          >
            {GLOSSARY_CATEGORIES.map((cat) => {
              const active = activeCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setActiveCategory(active ? null : cat)}
                  className="rounded-full border px-3 py-1 text-[12px] transition-colors"
                  style={{
                    borderColor: active ? "var(--accent)" : "var(--line)",
                    background: active
                      ? "var(--accent-soft)"
                      : "var(--surface)",
                    color: active ? "var(--text)" : "var(--text-secondary)",
                    fontWeight: active ? 600 : 500,
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-4">
          <p
            className="text-[11px] font-medium uppercase tracking-[0.18em]"
            style={{ color: "var(--text-muted)" }}
          >
            Jump to
          </p>
          <div className="mono mt-2 flex flex-wrap gap-1">
            {allLetters.map((letter) => {
              const enabled = lettersPresent.has(letter);
              return (
                <button
                  key={letter}
                  type="button"
                  onClick={() => enabled && jumpToLetter(letter)}
                  disabled={!enabled}
                  aria-label={
                    letter === "#" ? "Jump to entries starting with a digit" : `Jump to ${letter}`
                  }
                  className="rounded px-2 py-0.5 text-[12px] transition-colors"
                  style={{
                    color: enabled ? "var(--accent)" : "var(--text-muted)",
                    opacity: enabled ? 1 : 0.4,
                    cursor: enabled ? "pointer" : "not-allowed",
                  }}
                >
                  {letter}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div
          className="rounded-md border p-6 text-sm"
          style={{
            borderColor: "var(--line)",
            background: "var(--surface)",
            color: "var(--text-secondary)",
          }}
        >
          No terms match{" "}
          <span
            className="mono"
            style={{ color: "var(--text)" }}
          >
            {query.trim() || activeCategory || ""}
          </span>
          . Try a different keyword or clear the filters.
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {filtered.map((entry) => (
            <li
              key={entry.slug}
              ref={(node) => {
                cardRefs.current[entry.slug] = node;
              }}
              id={entry.slug}
              className="scroll-mt-24 rounded-md border p-4"
              style={{
                borderColor: "var(--line)",
                background: "var(--surface)",
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <h3
                  className="text-base font-semibold leading-tight"
                  style={{ color: "var(--text)" }}
                >
                  <a
                    href={`#${entry.slug}`}
                    className="hover:underline underline-offset-4"
                    style={{ color: "inherit" }}
                  >
                    <Highlight text={entry.term} query={query} />
                  </a>
                </h3>
                <span
                  className="shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.14em]"
                  style={{
                    borderColor: "var(--accent-soft)",
                    color: "var(--text-muted)",
                  }}
                >
                  {entry.category}
                </span>
              </div>
              <p
                className="mt-2 text-[14.5px] leading-7"
                style={{ color: "var(--text-secondary)" }}
              >
                <Highlight text={entry.definition} query={query} />
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Highlight({ text, query }: { text: string; query: string }) {
  const q = query.trim();
  if (!q) return <>{text}</>;
  const lower = text.toLowerCase();
  const target = q.toLowerCase();
  const idx = lower.indexOf(target);
  if (idx === -1) return <>{text}</>;
  const before = text.slice(0, idx);
  const match = text.slice(idx, idx + target.length);
  const after = text.slice(idx + target.length);
  return (
    <>
      {before}
      <mark
        style={{
          background: "var(--accent-soft)",
          color: "var(--text)",
          borderRadius: "2px",
          padding: "0 2px",
        }}
      >
        {match}
      </mark>
      {after}
    </>
  );
}
