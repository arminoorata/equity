# Equity Education Portal (equity.arminoorata.com)

A free public web tool that helps people understand stock options, RSUs,
and the rest of equity compensation. Standalone Next.js app deployed
on Vercel.

> **Visual / chrome consistency:** This is a sibling subdomain of
> `arminoorata.com`. Header, footer, palette, and typography must match
> the pattern documented in
> [/srv/projects/SIBLING_TOOL_PATTERN.md](../SIBLING_TOOL_PATTERN.md).
> Read that file first before changing any chrome.

## Spec (the source of truth)

The full spec lives at `/srv/projects/equity-portal/`. Read in order:

1. `EQUITY-PORTAL-SPEC.md` — top-level overview
2. `equity-portal-spec/00-INDEX.md` — index
3. `equity-portal-spec/01-ARCHITECTURE.md` — BYOK, no backend, route-based tabs
4. `equity-portal-spec/06-BRANDING.md` — Gilt palette, fonts, components
5. `equity-portal-spec/03-DATA-MODELS.md` — Profile, Grant, etc.
6. `equity-portal-spec/02-FEATURES.md` — six-tab IA, every screen
7. `equity-portal-spec/04-BUSINESS-LOGIC.md` — vesting math, tax formulas
8. `equity-portal-spec/05-CONTENT.md` — modules, FAQ, glossary, system prompt
9. `equity-portal-spec/07-REGULATORY.md` — disclaimers, BYOK security

## Sibling project

Cloned from `/srv/projects/fair/`. Chrome (Header, Footer, ThemeToggle,
NavMenu, globals.css, layout.tsx) is verbatim from fair, with the
toolkit name strings swapped and the `<Analytics />` / `<SpeedInsights />`
imports removed (privacy posture per the spec).

## Hard constraints

- **No backend.** Pure static SPA. The Ask tab calls Google's Gemini
  API (`generativelanguage.googleapis.com`) directly from the browser
  using the user's pasted Google AI Studio key, sent as the
  `x-goog-api-key` header. The key, the chat history, and any uploaded
  plan document never touch a server we operate. Storage is
  sessionStorage by default and localStorage only when the user opts
  in.
- **Model anchor.** Specific Gemini model is defined as a single
  constant in `src/lib/gemini.ts` (`GEMINI_MODEL`). Google deprecates
  models on a rolling cycle, so the constant is what changes when a
  family is end-of-life. UI copy reads from the constant, never
  hardcodes a name. The `gemini.test.ts` suite contains a guard that
  fails if a deprecated 2.x family slips back in.
- **No client analytics.** No `@vercel/analytics`, no
  `@vercel/speed-insights`. Vercel's free request-level analytics is
  the only allowed source of usage data.
- **CSP.** `connect-src` is locked to `'self'` plus
  `https://generativelanguage.googleapis.com`. No other outbound
  origins. `frame-ancestors 'none'` blocks embedding.
- **Document-upload privacy.** Plan-document upload defaults OFF.
  Users must affirmatively check "my company permits sending this
  document to Google Gemini" before the upload control activates.
- **Voice rules.** Every line of copy passes the rules in
  `/srv/.claude/writing_rules.md`. No em dashes. No "let's dive in." No
  fake suspense. First person where natural.
- **Sibling-pattern parity.** Header, footer, palette, type, theme
  behavior must match FLSA / FAIR / SIGNS.

## Tests

`npm test` runs vitest against pure-functional libs:

- `src/lib/vesting.test.ts` covers cliff math, monthly increments,
  share-total integrity, day-clamp on month rollover, status
  derivation around the cliff date.
- `src/lib/tax.test.ts` is the table-driven tax suite covering ISO
  qualifying disposition, ISO disqualifying / same-year sale, AMT
  exposure vs AMT owed, NSO exercise + sale, RSU withholding and
  share delivery, OfferCompare assumptions, and ScenarioCompare
  ranking.
- `src/lib/gemini.test.ts` covers the model-deprecation guard,
  system-prompt anti-injection rules, request-body assembly with
  role mapping, PDF inline-data on first turn only, text-doc
  BEGIN/END markers, and error mapping (401/429/blockReason).

UI components import from `src/lib/tax.ts`. Don't reintroduce inline
tax math in calculators.

## Build phases

1. Phase 1 (current): clone fair, strip features, get the shell to build with
   Equity-specific metadata, palette, fonts, and footer disclaimer.
2. Phase 2: tab nav component + six routes (`/`, `/vesting`, `/calculators`,
   `/exercise`, `/ask`, `/glossary`) + grant state Context + reset action +
   placeholders per tab.
3. Phase 3+: real content from `05-CONTENT.md`, calculators from
   `04-BUSINESS-LOGIC.md`, BYOK chat in the Ask tab.
