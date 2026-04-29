import { Fragment } from "react";
import { glossary } from "@/data/glossary";
import GlossaryTerm from "./GlossaryTerm";

/**
 * Paragraph renderer that auto-links the first occurrence of each
 * glossary term in the text. Subsequent occurrences (in the same
 * paragraph) render as plain text so the page does not become a
 * forest of dotted underlines.
 *
 * Boundaries: matching uses a non-word adjacency check via
 * lookbehind/lookahead instead of `\b`, so terms that end in `)`
 * (like `83(b)` or `AMT (Alternative Minimum Tax)`) match correctly.
 *
 * Ordering: we find the earliest match position across all unmatched
 * patterns, link that one, then keep tokenizing the right-hand
 * remainder. This means an early `AMT` alias is linked before a
 * later full `AMT (Alternative Minimum Tax)` form.
 */

type Token =
  | { type: "text"; value: string }
  | { type: "term"; term: string; definition: string; slug: string };

type Pattern = {
  display: string;
  regex: RegExp;
  definition: string;
  slug: string;
};

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildPatterns(): Pattern[] {
  const patterns: Pattern[] = [];
  const aliases: Record<string, string[]> = {
    "AMT (Alternative Minimum Tax)": ["AMT"],
    "ISOs (Incentive Stock Options)": ["ISO", "ISOs"],
    "NSOs (Non-Qualified Stock Options)": ["NSO", "NSOs"],
    "RSU (Restricted Stock Unit)": ["RSU", "RSUs"],
    "LTCG (Long-Term Capital Gains)": ["LTCG"],
    "QSBS (Qualified Small Business Stock)": ["QSBS"],
    "83(b) Election": ["83(b)"],
    "409A Valuation": ["409A"],
    "Fair Market Value (FMV)": ["FMV"],
    IPO: ["IPO"],
  };

  for (const entry of glossary) {
    const matchTerms = [entry.term, ...(aliases[entry.term] ?? [])];
    for (const m of matchTerms) {
      // Non-word adjacency lookarounds so terms that end or start
      // with non-word characters (e.g. `83(b)`, `AMT (Alternative
      // Minimum Tax)`) still match cleanly. Apostrophes block on the
      // right so `IPO'd` does not match `IPO` and leave the `'d` orphan.
      const pattern = `(?<![\\w'])${escapeRegex(m)}(?![\\w'])`;
      patterns.push({
        display: m,
        regex: new RegExp(pattern, "i"),
        definition: entry.definition,
        slug: entry.slug,
      });
    }
  }

  // Longer patterns first so a full-form match wins over a shorter
  // alias when both happen at the same position.
  patterns.sort((a, b) => b.display.length - a.display.length);
  return patterns;
}

const PATTERNS = buildPatterns();

function tokenize(text: string): Token[] {
  const tokens: Token[] = [];
  const seenSlugs = new Set<string>();
  let cursor = 0;

  while (cursor < text.length) {
    let earliest: {
      index: number;
      length: number;
      pattern: Pattern;
    } | null = null;

    for (const pat of PATTERNS) {
      if (seenSlugs.has(pat.slug)) continue;
      const m = pat.regex.exec(text.slice(cursor));
      if (!m || m.index === undefined) continue;
      const absoluteIndex = cursor + m.index;
      if (
        !earliest ||
        absoluteIndex < earliest.index ||
        (absoluteIndex === earliest.index && m[0].length > earliest.length)
      ) {
        earliest = {
          index: absoluteIndex,
          length: m[0].length,
          pattern: pat,
        };
      }
    }

    if (!earliest) {
      tokens.push({ type: "text", value: text.slice(cursor) });
      break;
    }

    if (earliest.index > cursor) {
      tokens.push({ type: "text", value: text.slice(cursor, earliest.index) });
    }
    tokens.push({
      type: "term",
      term: text.slice(earliest.index, earliest.index + earliest.length),
      definition: earliest.pattern.definition,
      slug: earliest.pattern.slug,
    });
    seenSlugs.add(earliest.pattern.slug);
    cursor = earliest.index + earliest.length;
  }

  return tokens;
}

export default function Paragraph({ text }: { text: string }) {
  const tokens = tokenize(text);
  return (
    <p
      className="text-[15px] leading-7"
      style={{ color: "var(--text-secondary)" }}
    >
      {tokens.map((t, i) =>
        t.type === "text" ? (
          <Fragment key={i}>{t.value}</Fragment>
        ) : (
          <GlossaryTerm
            key={i}
            term={t.term}
            definition={t.definition}
            slug={t.slug}
          />
        ),
      )}
    </p>
  );
}
