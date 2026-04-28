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

- **No backend.** Pure static SPA. Anthropic chat (Ask tab) calls
  `api.anthropic.com` directly from the browser using the user's pasted
  API key + `anthropic-dangerous-direct-browser-access: true`.
- **No client analytics.** No `@vercel/analytics`, no `@vercel/speed-insights`.
  Vercel's free request-level analytics is the only allowed source of usage data.
- **Voice rules.** Every line of copy passes the rules in
  `/srv/.claude/writing_rules.md`. No em dashes. No "let's dive in." No
  fake suspense. First person where natural.
- **Sibling-pattern parity.** Header, footer, palette, type, theme behavior
  must match FLSA / FAIR / SIGNS.

## Build phases

1. Phase 1 (current): clone fair, strip features, get the shell to build with
   Equity-specific metadata, palette, fonts, and footer disclaimer.
2. Phase 2: tab nav component + six routes (`/`, `/vesting`, `/calculators`,
   `/exercise`, `/ask`, `/glossary`) + grant state Context + reset action +
   placeholders per tab.
3. Phase 3+: real content from `05-CONTENT.md`, calculators from
   `04-BUSINESS-LOGIC.md`, BYOK chat in the Ask tab.
