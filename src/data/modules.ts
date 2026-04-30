/**
 * Learn module metadata. The bite-sized step content lives in
 * `src/data/module-steps.ts` and is the single source of truth for
 * what visitors actually read. This file holds the module-level
 * metadata: title, outcome-oriented card title, hook, icon, minute
 * estimate, SEO blurb, last-reviewed date, and the closing
 * "questions to ask" list.
 *
 * Slugs (`id`) are stable URL segments at /learn/[id].
 */

export type Block =
  | { type: "paragraph"; text: string }
  | {
      type: "callout";
      severity: "red" | "amber" | "green" | "info";
      title?: string;
      body: string;
      notAdvice?: boolean;
    }
  | {
      type: "table";
      caption?: string;
      headers: string[];
      rows: string[][];
    }
  | {
      type: "worked-example";
      title: string;
      lines: string[];
      footnote?: string;
    }
  | { type: "widget"; widget: string };

export type LearnModule = {
  id: string;
  title: string;
  /**
   * Outcome-oriented label used on the Learn home tile. Different from
   * `title` (the formal module name kept for SEO/metadata) so a tile
   * can read "Avoid the ISO tax surprise" while the page still says
   * "ISOs".
   */
  cardTitle?: string;
  /**
   * One-line lead-in shown above the first step on the module page,
   * tied to the user's likely first question.
   */
  hook?: string;
  icon: string;
  minutes: number;
  /**
   * Description used for `<meta name="description">` and as the
   * canonical short summary anywhere a module is referenced outside
   * the module page itself.
   */
  blurb: string;
  /**
   * Yyyy-mm of the most recent factual review for this module's
   * tax/regulatory content. Surfaced at the bottom of the module page
   * so readers can see the content is current. Update whenever the
   * underlying tax law changes (e.g. §1202, AMT thresholds).
   */
  lastReviewed?: string;
  /**
   * Per-module list of "Questions to ask your equity team or CPA".
   * Rendered as a closing card on the last step. Turns passive
   * understanding into a concrete next step without the tool having
   * to give advice.
   */
  questions?: string[];
};

export const modules: LearnModule[] = [
  {
    id: "basics",
    title: "Equity 101",
    cardTitle: "Decode my grant",
    hook: "What does this grant actually mean?",
    icon: "🎓",
    minutes: 6,
    blurb:
      "What equity actually is, why companies grant it, and what to read in your own grant.",
    lastReviewed: "2026-04",
    questions: [
      "What kind of grants do I have, and where can I see them in writing?",
      "What is my company's most recent 409A valuation, and when does it next refresh?",
      "Where is the plan document, and how do I get a copy?",
      "Is early exercise allowed under my plan, or only post-vesting?",
    ],
  },
  {
    id: "isos",
    title: "ISOs",
    cardTitle: "Avoid the ISO tax surprise",
    hook: "Could AMT surprise me?",
    icon: "⭐",
    minutes: 6,
    blurb:
      "Incentive stock options: friendlier tax if you play it right, AMT if you don't.",
    lastReviewed: "2026-04",
    questions: [
      "What is my current spread (FMV at last 409A minus my strike), per share and in total?",
      "If I exercised some or all of my vested ISOs this year, what would the AMT impact look like in my full tax picture?",
      "Have I confirmed which of my options are ISOs vs NSOs (the $100K rule means many people have a mix)?",
      "If I'm planning to leave, when does my post-termination exercise window close, and does that match the federal 3-month ISO rule?",
      "Am I tracking my exercise dates so I can hit the 1-year-post-exercise / 2-year-post-grant qualifying thresholds?",
    ],
  },
  {
    id: "nsos",
    title: "NSOs",
    cardTitle: "Exercise without guessing",
    hook: "What cash and tax happens when I exercise?",
    icon: "📋",
    minutes: 5,
    blurb:
      "Non-qualified options: ordinary income at exercise, broader eligibility, no AMT.",
    lastReviewed: "2026-04",
    questions: [
      "What's the spread at my current FMV, and what would the ordinary income tax look like if I exercised this year?",
      "Does my company allow early exercise on NSOs, and if so, am I eligible to file an 83(b) within 30 days?",
      "How does my company handle withholding at NSO exercise (payroll withholding vs same-day sale)?",
      "Are any of my options classified as NSOs because they exceeded the $100K ISO limit, and does my plan document confirm that?",
    ],
  },
  {
    id: "rsus",
    title: "RSUs",
    cardTitle: "See what you actually keep",
    hook: "If 100 RSUs vest, how many do I keep?",
    icon: "🔒",
    minutes: 5,
    blurb:
      "Restricted stock units: no cost to receive, ordinary income at settlement, single or double trigger.",
    lastReviewed: "2026-04",
    questions: [
      "Are my RSUs single or double trigger, and where in the plan document is that confirmed?",
      "What's the company's default withholding rate on RSU settlement, and can I supplement it with additional withholding if my marginal rate is higher?",
      "If I've moved during the vesting period, has the company tracked the work-state allocation for tax purposes?",
      "When are the next vest dates and what is the expected gross-income exposure each time?",
    ],
  },
  {
    id: "tax",
    title: "Tax scenarios",
    cardTitle: "Compare tax outcomes",
    hook: "Same grant, different tax outcomes. See the shape.",
    icon: "🧮",
    minutes: 7,
    blurb:
      "Hypothetical numbers showing how the same grant can produce very different after-tax outcomes.",
    lastReviewed: "2026-04",
    questions: [
      "If I exercised ISOs this year, would AMT actually trigger given my full tax picture?",
      "Does my stock potentially qualify as QSBS under §1202, and which acquisition date applies (pre or post July 4, 2025)?",
      "For any 83(b) election I'm considering, can my CPA help me file it within the 30-day window?",
      "How should I think about state-level tax if I've moved during the vesting or holding period?",
    ],
  },
  {
    id: "liquidity",
    title: "Liquidity",
    cardTitle: "Know when you can sell",
    hook: "Vesting is not selling.",
    icon: "💰",
    minutes: 7,
    blurb:
      "Why private shares are hard to sell, what events change that, and how to plan around real selling windows.",
    lastReviewed: "2026-04",
    questions: [
      "Does my offer letter or grant agreement include any acceleration on change of control, and is it single or double trigger?",
      "Has my company done a tender offer before, and if so, what were the participation rules?",
      "What is the typical lock-up length we should plan for in an IPO scenario?",
      "If I might leave the company before a liquidity event, how does my exercise window interact with the planned event date?",
    ],
  },
  {
    id: "leaving",
    title: "Leaving",
    cardTitle: "Don't miss the clock",
    hook: "When does my exercise window close?",
    icon: "🚪",
    minutes: 5,
    blurb:
      "The 90-day clock, what happens to unvested shares, and the 83(b) caveat if you early-exercised.",
    lastReviewed: "2026-04",
    questions: [
      "What is my exact post-termination exercise window, in days?",
      "If I have ISOs, does my plan window line up with the federal 3-month ISO tax rule?",
      "What is my current vested option count and current strike, and how much cash would a full exercise require?",
      "What is my company's documented policy on post-termination exercise windows, and where is it written?",
    ],
  },
  {
    id: "case-study",
    title: "Case study: Maya",
    cardTitle: "Choose Maya's next move",
    hook: "Walk Maya's path. Pick a move; see what she did, and the math behind it.",
    icon: "📖",
    minutes: 10,
    blurb:
      "One person, grant date through IPO. The decisions that mattered, the ones that didn't, and what she'd do differently. Plus a counter-story when the company doesn't make it.",
    lastReviewed: "2026-04",
    questions: [
      "If I were in Maya's year-2 position with my own numbers, what would my AMT exposure look like at a partial exercise I could afford?",
      "Have I run my real grant through the calculators in this tool, not just Maya's hypothetical?",
      "If my company doesn't succeed, would the cash I'd spend on early exercise be money I can lose without changing my life?",
      "Do I have a CPA lined up for the year I might exercise, not the year I do exercise?",
    ],
  },
];

export function getModule(id: string): LearnModule | undefined {
  return modules.find((m) => m.id === id);
}
