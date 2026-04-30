/**
 * Step-based content for the redesigned Learn flow. Each module's
 * existing `sections` blocks are repackaged into bite-sized steps:
 *
 *   takeaway (1-3 sentences) -> optional widget / table / worked-example
 *     -> optional inline quiz check -> "Show details" disclosure for depth
 *
 * The original `sections` data in `modules.ts` stays put for SEO and
 * for any future search/index usage. The page now renders these
 * `steps` instead of the old article layout.
 *
 * Authoring rule of thumb: visible content is the smallest thing that
 * answers the step heading. Any longer paragraph, table, or
 * legal/tax nuance from the original section goes into `details`.
 */

import type { Block } from "./modules";
import type { QuizQuestion } from "./quizzes";
import { quizzes } from "./quizzes";

export type StepDecisionOption = {
  label: string;
  /** True for the option Maya actually chose. Used as a soft anchor in the reveal copy, not a "correct answer" badge. */
  mayaChose?: boolean;
};

export type Step = {
  id: string;
  /** Outcome-style heading for the step. Question form when natural. */
  heading: string;
  /** The single most important sentence (or two). Always visible. */
  takeaway?: string;
  /** Optional small body content shown below the takeaway. Reuses Block kinds from modules.ts. */
  blocks?: Block[];
  /** Compact bulleted checklist, rendered as a tight list rather than a table. */
  checklist?: { title?: string; items: string[] };
  /**
   * Maya-only: a "what would you do?" decision card. The reveal shows
   * what Maya actually did, with worked-example math and any callouts.
   * No right/wrong - all options are reasonable case-method choices.
   */
  decision?: {
    prompt: string;
    options: StepDecisionOption[];
    revealHeading: string;
    revealBlocks: Block[];
  };
  /** Optional inline single-question check. */
  inlineQuiz?: QuizQuestion;
  /** Label for the disclosure trigger. Defaults to "Show details". */
  detailsLabel?: string;
  /** Collapsed deeper content. Same Block shapes as the visible body. */
  details?: Block[];
};

const p = (text: string): Block => ({ type: "paragraph", text });

function pickQuiz(moduleId: string, qid: string): QuizQuestion {
  const list = quizzes[moduleId] ?? [];
  const found = list.find((q) => q.id === qid);
  if (!found) {
    throw new Error(`module-steps: missing quiz ${moduleId}/${qid}`);
  }
  return found;
}

// ─────────────────────────────────────────────────────────────────────
// Equity 101 — "Decode my grant"
// ─────────────────────────────────────────────────────────────────────
const basicsSteps: Step[] = [
  {
    id: "what-it-is",
    heading: "What does this grant actually mean?",
    takeaway:
      "Equity is part-ownership of the company. Usually a small slice. It can grow if the company grows, and disappear if it doesn't.",
    details: [
      p(
        "Two reasons companies grant it. Cash conservation: equity costs the company nothing today. Alignment: if you own a piece of the upside, you're more likely to care about the upside. The second reason is the better one.",
      ),
    ],
  },
  {
    id: "vesting-clock",
    heading: "The vesting clock starts on the vesting start date",
    takeaway:
      "Vesting is how you earn equity over time. It runs from your vesting start date, not your grant date. Most plans use four years with a one-year cliff.",
    blocks: [{ type: "widget", widget: "vesting-timeline" }],
    inlineQuiz: pickQuiz("basics", "vesting-start-vs-grant-date"),
    details: [
      p(
        "Other shapes exist too: shorter cliffs, monthly-from-day-one, longer total periods. The exact shape lives in your grant letter.",
      ),
      {
        type: "callout",
        severity: "green",
        title: "One thing to do today",
        body: "Open your grant letter and find the vesting start date. The clock runs from this date.",
      },
    ],
  },
  {
    id: "fmv",
    heading: "What FMV means before there's a market",
    takeaway:
      "Your shares aren't traded yet. The company hires an outside firm to estimate their value (a 409A in the US). That estimate sets your strike price.",
    inlineQuiz: pickQuiz("basics", "what-is-409a"),
    details: [
      {
        type: "callout",
        severity: "info",
        title: "Read this twice",
        body: "Treat the 409A as a tax number, not a financial forecast. Actual market prices can be much higher or much lower.",
      },
    ],
  },
  {
    id: "early-exercise",
    heading: "If your plan lets you early-exercise: 30 days for 83(b)",
    takeaway:
      "Some plans let you exercise before vesting. If you do, an 83(b) election lets you be taxed at today's (low) value instead of waiting.",
    blocks: [
      {
        type: "callout",
        severity: "red",
        title: "30-day deadline, no extensions",
        body: "Miss the 30 days and you forfeit the favorable treatment forever. Same applies if you receive restricted stock subject to vesting.",
        notAdvice: true,
      },
    ],
  },
  {
    id: "find-the-numbers",
    heading: "Find these six things at your own company",
    takeaway:
      "Every example here uses generic defaults. Your numbers come from your plan document and grant letter. Verify these before you trust any output.",
    checklist: {
      title: "Your equity worksheet",
      items: [
        "Post-termination exercise window (default 90 days; some companies offer 5 to 10 years)",
        "Whether early exercise is allowed",
        "Whether RSUs are double-trigger (almost always yes at private companies)",
        "How often the 409A is updated",
        "Acceleration on change of control",
        "Where the plan document lives",
      ],
    },
    detailsLabel: "Show where to find each one",
    details: [
      {
        type: "table",
        caption:
          "A small worksheet for your own grant. Plan documents differ; numbers below are common defaults.",
        headers: ["What to find", "Where to look", "Common default"],
        rows: [
          [
            "Post-termination exercise window",
            "Plan document, sometimes the offer letter",
            "90 days (some companies: 5 to 10 years)",
          ],
          [
            "Whether early exercise is allowed",
            "Grant letter or plan document",
            "Often no",
          ],
          [
            "Whether RSUs are double-trigger",
            "Plan document. Almost always yes at private companies",
            "Yes (private), No (public)",
          ],
          [
            "How often the 409A is updated",
            "Equity team or your equity platform (Carta, Pulley, Shareworks)",
            "Annually, plus after material events",
          ],
          [
            "Acceleration on change of control",
            "Offer letter or grant letter",
            "Usually none, sometimes double-trigger",
          ],
          [
            "Where the plan document lives",
            "Equity platform, HR portal, or your offer paperwork",
            "Varies",
          ],
        ],
      },
      {
        type: "callout",
        severity: "info",
        title: "Why this list matters",
        body: "Equity is one of the most personalized parts of compensation. A tool is only as accurate as the inputs. Treat the calculators here as illustrations until you've verified the numbers above.",
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────
// ISOs — "Avoid the ISO tax surprise"
// ─────────────────────────────────────────────────────────────────────
const isosSteps: Step[] = [
  {
    id: "amt-spread",
    heading: "Could AMT surprise me?",
    takeaway:
      "At ISO exercise the spread (FMV minus strike, times shares) counts toward your AMT income. Plug your numbers in to see what's actually at stake.",
    blocks: [{ type: "widget", widget: "amt-spread" }],
    // Use the tax-module spread question as a clean active-recall check; same numbers shape as the widget defaults.
    inlineQuiz: pickQuiz("tax", "iso-amt-spread"),
  },
  {
    id: "tax-shape",
    heading: "The ISO tax shape",
    takeaway:
      "At exercise, no regular income tax. (Yes, really.) But the spread counts toward AMT, and that can produce its own bill.",
    inlineQuiz: pickQuiz("isos", "iso-tax-at-exercise"),
    details: [
      p(
        "At sale, if you held shares more than 1 year past exercise AND more than 2 years past grant, the entire gain from strike to sale is taxed at long-term capital-gains rates. Miss either holding period and you have a disqualifying disposition: any gain up to the spread at exercise gets taxed as ordinary income; the rest (if any) is capital gain. A sale at a loss is just a capital loss with no ordinary-income piece.",
      ),
    ],
  },
  {
    id: "qualifying-disposition",
    heading: "Qualifying disposition: two boxes to check",
    takeaway:
      "Hold 1+ year past exercise AND 2+ years past grant. Both. Miss either and the favorable treatment evaporates.",
    blocks: [
      {
        type: "callout",
        severity: "green",
        title: "Two-condition check",
        body: "Year-from-exercise: 365+ days since the exercise date.\nYear-from-grant: 730+ days since the grant date.",
      },
    ],
    inlineQuiz: pickQuiz("isos", "qualifying-disposition-periods"),
  },
  {
    id: "amt-vs-regular",
    heading: "What you owe in AMT",
    takeaway:
      "AMT is owed only to the extent it exceeds your regular tax. So the bill is the difference, not the AMT total.",
    inlineQuiz: pickQuiz("isos", "amt-difference"),
    details: [
      {
        type: "callout",
        severity: "red",
        title: "AMT is the single biggest ISO landmine",
        body: "People have been bankrupted by AMT bills on shares they couldn't sell. Use the calculator to see your spread, then call someone who actually does this for a living.",
        notAdvice: true,
      },
    ],
  },
  {
    id: "leaving",
    heading: "When you leave: two clocks",
    takeaway:
      "Your plan window for exercising vested options (often 90 days) and the federal 3-month ISO tax clock. Often they line up. Sometimes they don't.",
    blocks: [
      {
        type: "callout",
        severity: "amber",
        title: "Easiest deadline to miss",
        body: "Past the 3-month mark, the option may still be exercisable, but ISO tax treatment is gone (it gets taxed as an NSO). Confirm both windows the day you give notice.",
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────
// NSOs — "Exercise without guessing"
// ─────────────────────────────────────────────────────────────────────
const nsosSteps: Step[] = [
  {
    id: "exercise-tax",
    heading: "What cash and tax happens when I exercise?",
    takeaway:
      "At NSO exercise the spread is taxed as ordinary income, like salary. Your company usually withholds through payroll.",
    blocks: [{ type: "widget", widget: "nso-exercise-tax" }],
    inlineQuiz: pickQuiz("nsos", "nso-spread-at-exercise"),
    details: [
      p(
        "At sale, any gain above FMV-at-exercise is capital gains. Long-term if held more than 1 year from exercise.",
      ),
    ],
  },
  {
    id: "who-gets-them",
    heading: "Who is eligible",
    takeaway:
      "Anyone the company chooses: employees, directors, contractors, advisors. NSOs aren't restricted to employees the way ISOs are.",
    inlineQuiz: pickQuiz("nsos", "nso-eligibility"),
  },
  {
    id: "iso-vs-nso",
    heading: "ISO vs NSO at a glance",
    takeaway:
      "Same right-to-buy mechanic. Different tax. Many people end up with both because of the $100K ISO cap.",
    detailsLabel: "Show the side-by-side",
    details: [
      {
        type: "table",
        headers: ["", "ISOs", "NSOs"],
        rows: [
          ["Who can receive them", "Employees only", "Anyone (employees, directors, contractors, advisors)"],
          ["Tax at exercise", "None on regular income (AMT applies)", "Ordinary income on the spread"],
          ["AMT exposure", "Yes (spread counts toward AMT)", "No"],
          ["$100K rule", "Only $100K worth can become exercisable per year", "No limit"],
          [
            "Friendlier long-term tax",
            "Yes, with qualifying disposition",
            "Capital gains only on post-exercise growth",
          ],
        ],
      },
      p(
        "Anything over the $100K ISO cap is automatically treated as NSO.",
      ),
    ],
  },
  {
    id: "early-exercise",
    heading: "Early exercise and the 83(b) tradeoff",
    takeaway:
      "Some companies let you exercise before vesting. File an 83(b) within 30 days to be taxed at today's (low) FMV. The clock for long-term capital gains starts at exercise.",
    blocks: [
      {
        type: "callout",
        severity: "amber",
        title: "Don't early-exercise more than you can lose",
        body: "If you leave before the unvested shares vest, you forfeit them, and the tax doesn't come back.",
        notAdvice: true,
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────
// RSUs — "See what you actually keep"
// ─────────────────────────────────────────────────────────────────────
const rsusSteps: Step[] = [
  {
    id: "withholding",
    heading: "If 100 RSUs vest, how many do I keep?",
    takeaway:
      "At settlement, full FMV is taxed as ordinary income. Most companies sell enough of your shares at vest to cover the tax bill.",
    blocks: [
      { type: "widget", widget: "rsu-withholding" },
      {
        type: "worked-example",
        title: "100 RSUs settling at $50, 35% withholding",
        lines: [
          "Gross income: 100 × $50 = $5,000",
          "Withholding rate: 35%",
          "Shares sold to cover taxes: ~35",
          "Shares delivered to you: ~65",
        ],
        footnote: "Actual withholding rates vary by employer and your tax situation.",
      },
    ],
    inlineQuiz: pickQuiz("rsus", "rsu-net-after-withholding"),
  },
  {
    id: "single-vs-double",
    heading: "Single trigger vs double trigger",
    takeaway:
      "Public-company RSUs: single trigger - shares deliver as they time-vest. Private-company RSUs: double trigger - time vest AND a liquidity event before shares deliver.",
    inlineQuiz: pickQuiz("rsus", "rsu-double-trigger-stuck"),
    details: [
      {
        type: "callout",
        severity: "info",
        title: "Why double trigger exists",
        body: "Without a market, you'd owe ordinary income tax on shares you can't sell. The second trigger waits until there's actually a way to cover the tax bill.",
      },
    ],
  },
  {
    id: "moved-during-vesting",
    heading: "If you moved during vesting",
    takeaway:
      "Source-of-income rules vary. California, New York, Massachusetts, and others allocate RSU income across the period the shares were earned, not just where you live at vest.",
    blocks: [
      {
        type: "callout",
        severity: "amber",
        title: "You may owe tax to a state you no longer live in",
        body: "Confirm with a CPA who works across state lines. Keep your work-location history (and dates) for every quarter your RSUs were vesting.",
      },
    ],
    details: [
      p(
        "Two practical moves. Keep the location history. Ask your equity team or payroll how they handle multi-state withholding before the first vest after a move.",
      ),
    ],
  },
  {
    id: "rsus-vs-options",
    heading: "RSUs vs options",
    takeaway:
      "RSUs are free at the start, lower risk, lower ceiling. Options cost something, higher risk, higher ceiling if the company grows a lot. You may receive both.",
    detailsLabel: "Show the side-by-side",
    details: [
      {
        type: "table",
        headers: ["", "RSUs", "Options"],
        rows: [
          ["Cost to acquire", "Free", "Strike price × shares"],
          ["Worth at vest", "Always something (if stock has any value)", "Could be zero (underwater if strike > FMV)"],
          ["Risk", "Lower", "Higher"],
          ["Upside", "Lower", "Higher (uncapped if company grows a lot)"],
          ["Best for", "Late-stage / public companies", "Early-stage where strike was set low"],
        ],
      },
      p(
        "The right answer depends on the company stage and your risk tolerance. If you receive both, treat them as separate decisions.",
      ),
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────
// Tax scenarios — "Compare tax outcomes"
// ─────────────────────────────────────────────────────────────────────
const taxSteps: Step[] = [
  {
    id: "iso-vs-nso-compare",
    heading: "Same numbers, different tax",
    takeaway:
      "ISOs reward patience with the qualifying disposition rules. NSOs front-load the ordinary-income hit. Set both side by side.",
    blocks: [
      { type: "widget", widget: "iso-vs-nso-compare" },
      {
        type: "callout",
        severity: "info",
        body: "None of this is tax advice. The point is to show you the shape of the math so you know what to ask.",
      },
    ],
    inlineQuiz: pickQuiz("tax", "iso-amt-spread"),
  },
  {
    id: "iso-example",
    heading: "ISO exercise, hypothetical",
    takeaway:
      "1,000 ISOs at $2 strike, FMV $10 at exercise, $50 at sale. The spread at exercise is what counts toward AMT.",
    blocks: [
      {
        type: "worked-example",
        title: "1,000 ISOs at $2 strike, FMV $10, sale $50",
        lines: [
          "Cash to exercise: 1,000 × $2 = $2,000",
          "Spread at exercise: ($10 − $2) × 1,000 = $8,000",
          "Regular income tax at exercise: $0",
          "AMT exposure: $8,000",
          "Hold 1+ year past exercise + 2+ years past grant, then sell at $50:",
          "Long-term capital gain: ($50 − $2) × 1,000 = $48,000 at LTCG rates",
        ],
      },
    ],
  },
  {
    id: "rsu-example",
    heading: "RSU settlement, hypothetical",
    takeaway:
      "500 RSUs settling at $40 with 35% effective withholding. The tax comes off the top, in shares.",
    blocks: [
      {
        type: "worked-example",
        title: "500 RSUs at $40, 35% withholding",
        lines: [
          "Ordinary income at settlement: 500 × $40 = $20,000",
          "Tax withheld (~35%): ~$7,000",
          "Shares sold to cover taxes: ~175",
          "Shares delivered to you: ~325",
        ],
      },
    ],
  },
  {
    id: "section-83b",
    heading: "83(b): 30 days, no extensions",
    takeaway:
      "If you early-exercise unvested options, an 83(b) election lets you be taxed at today's (low) value. The window is 30 days from exercise. Miss it and you lose the 83(b) treatment. No extensions.",
    inlineQuiz: pickQuiz("tax", "83b-deadline"),
    details: [
      {
        type: "callout",
        severity: "amber",
        title: "Real risk, real upside",
        body: "If you leave before the shares vest, you lose them and the tax doesn't come back. If the company grows substantially, all subsequent gain is at LTCG rates.",
        notAdvice: true,
      },
    ],
  },
  {
    id: "qsbs",
    heading: "QSBS: worth asking about",
    takeaway:
      "If your company qualifies under §1202, you may exclude part of your federal capital gain at sale. Eligibility rules are specific and easy to break. Ask your tax advisor before you sell.",
    blocks: [
      {
        type: "callout",
        severity: "green",
        title: "Single most valuable tax benefit",
        body: "If your company qualifies, this can be the largest tax saving you'll ever encounter. Not a calculation to DIY.",
      },
    ],
    detailsLabel: "Show the §1202 holding-period rules",
    details: [
      p(
        "The rules depend on when you acquired the stock. After July 4, 2025: 50% exclusion at 3 years, 75% at 4 years, 100% at 5 years, with a per-issuer cap of the greater of $15M (indexed) or 10x your basis. After September 27, 2010 and on or before July 4, 2025: 100% exclusion at 5 years, $10M or 10x basis cap. On or before September 27, 2010: lower exclusion percentages (50% or 75%) and an AMT preference on the excluded portion.",
      ),
      p(
        "The qualified-small-business, original-issue, gross-asset, and active-business requirements are specific. Confirm eligibility well before sale.",
      ),
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────
// Liquidity — "Know when you can sell"
// ─────────────────────────────────────────────────────────────────────
const liquiditySteps: Step[] = [
  {
    id: "vesting-not-selling",
    heading: "Vesting is not selling",
    takeaway:
      "If your company is private, your shares aren't easy to sell. Vesting tells you what's yours; the calendar tells you when you can act on it.",
    blocks: [
      {
        type: "callout",
        severity: "info",
        body: "The 409A tells you what the IRS thinks your shares are worth. It does not tell you what someone will actually pay.",
      },
      {
        type: "callout",
        severity: "amber",
        title: "Two rules that keep people out of trouble",
        body: "Don't make financial commitments based on paper value. Don't count on equity for short-term cash needs.",
      },
    ],
  },
  {
    id: "lockup",
    heading: "Lock-ups and blackouts",
    takeaway:
      "Even at public companies, you can't always sell. Insiders are blacked out around earnings. Post-IPO lock-ups commonly run 90 to 180 days.",
    blocks: [{ type: "widget", widget: "lockup-timeline" }],
    inlineQuiz: pickQuiz("liquidity", "post-ipo-lockup"),
  },
  {
    id: "event-types",
    heading: "Three liquidity event types",
    takeaway:
      "IPOs open a public market (with a lock-up). Acquisitions close at the deal terms. Tender offers are voluntary, limited windows pre-IPO.",
    inlineQuiz: pickQuiz("liquidity", "tender-offer"),
    detailsLabel: "Show what changes in each",
    details: [
      {
        type: "table",
        headers: ["Event", "What happens", "Typical timeline"],
        rows: [
          ["IPO", "Company starts trading on a public exchange", "Insider lock-up commonly 90–180 days"],
          ["Acquisition / merger", "Shares convert per the deal terms", "Usually triggered at deal close"],
          ["Tender offer", "Company-organized chance to sell some shares pre-IPO", "Voluntary, limited windows, agreed price"],
        ],
      },
    ],
  },
  {
    id: "acceleration",
    heading: "Change of control: read four words",
    takeaway:
      "Search your offer letter, grant agreement, and plan document for 'change in control,' 'acceleration,' 'good reason,' and 'cause.' That's where the actual terms hide.",
    blocks: [
      {
        type: "callout",
        severity: "info",
        title: "What you have is what you have",
        body: "The point of this section is to teach you what to look for, not to suggest you should have more or less of it.",
      },
    ],
    detailsLabel: "Show the common acceleration shapes",
    details: [
      {
        type: "table",
        caption:
          "Common acceleration shapes. Yours might be a mix, might be silent, or might depend entirely on the deal terms.",
        headers: ["Term", "What it means"],
        rows: [
          [
            "No acceleration",
            "No automatic vesting at the deal. The merger agreement decides what happens to unvested equity: assumed by the buyer, substituted, cashed out subject to continued vesting, or cancelled.",
          ],
          [
            "Single trigger",
            "Some or all of your unvested equity vests immediately at the change of control, regardless of your employment status.",
          ],
          [
            "Double trigger",
            "Some or all of your unvested equity vests if the change of control happens AND you're terminated without cause (or resign for good reason) within a defined window after.",
          ],
          [
            "Full acceleration",
            "100% of unvested equity accelerates under the trigger. Common for executives, rare for individual contributors.",
          ],
          [
            "Partial acceleration",
            "A defined percentage (commonly 25 to 50%) accelerates. Or all unvested shares that would have vested in the next 12 months.",
          ],
        ],
      },
    ],
  },
  {
    id: "playbook",
    heading: "Pre-liquidity playbook",
    takeaway:
      "If a tender or IPO is on the horizon, the most expensive part is rushed decisions, not the tax bill itself. Plan backwards from the event.",
    checklist: {
      title: "Working backwards",
      items: [
        "12+ months out: pull together your basis records. Find a CPA who has handled equity events.",
        "6 to 12 months out: model AMT scenarios if you hold ISOs. Pre-funding gets cheaper earlier.",
        "3 to 6 months out: write your sale plan. Tender percentages, lock-up windows, tax-year edges.",
        "60 days out: confirm exercise window if you might leave. Confirm withholding mechanics.",
        "Day of: don't make irreversible moves on the announcement. Sleep on it.",
      ],
    },
    details: [
      {
        type: "callout",
        severity: "amber",
        title: "The plan is the point",
        body: "A rough plan beats no plan, every time.",
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────
// Leaving — "Don't miss the clock"
// ─────────────────────────────────────────────────────────────────────
const leavingSteps: Step[] = [
  {
    id: "the-clock",
    heading: "When you leave, two clocks start",
    takeaway:
      "Your plan window for exercising vested options (often 90 days) is one clock. The federal 3-month ISO tax clock is the second. Sometimes they line up. Sometimes they don't.",
    blocks: [
      {
        type: "callout",
        severity: "red",
        title: "Historical default is 90 days",
        body: "Some companies offer 5 to 10 years now (Pinterest and Coinbase set the example). Some offer less. The number in your plan document controls. Find it before you give notice.",
      },
      {
        type: "callout",
        severity: "amber",
        title: "ISOs have a separate 3-month rule",
        body: "Past 3 months from separation, the option may still be exercisable under your plan, but the ISO tax treatment is gone (it gets taxed as an NSO). The 3-month window extends to 12 months for permanent disability, and there is no time limit when an estate exercises after a holder's death.",
      },
    ],
    inlineQuiz: pickQuiz("leaving", "post-termination-window"),
  },
  {
    id: "what-it-costs",
    heading: "What it costs to exercise",
    takeaway:
      "Two pieces. The strike price times your vested shares (cash to the company). And the tax: ordinary income at NSO exercise; AMT exposure at ISO exercise.",
    blocks: [{ type: "widget", widget: "vesting-timeline" }],
    details: [
      p(
        "Use the post-termination calculator in the Exercise tab to see your number with your specific grant and current FMV.",
      ),
    ],
  },
  {
    id: "early-exercised",
    heading: "If you early-exercised",
    takeaway:
      "If you bought unvested shares under your plan, the company repurchases the unvested portion at your original strike when you leave. The strike money comes back; the tax doesn't.",
    inlineQuiz: pickQuiz("leaving", "early-exercised-leaver"),
    details: [
      {
        type: "callout",
        severity: "amber",
        title: "Don't early-exercise more than you can afford to forfeit",
        body: "If the company succeeds and you stay, this is great. If you leave before the shares vest, you lose them, and the tax doesn't come back.",
        notAdvice: true,
      },
    ],
  },
  {
    id: "what-vests",
    heading: "What vests on the way out",
    takeaway:
      "Most plans use cliff vesting. Leave before your one-year cliff and you typically get nothing. After the cliff, your vested portion is yours; everything past your last day stops accruing.",
    details: [
      p(
        "Some plans have acceleration provisions on a change of control or termination without cause. Those are negotiated up front and live in your offer paperwork. Read it.",
      ),
    ],
  },
  {
    id: "checklist",
    heading: "Five things to do before HR has your laptop",
    takeaway:
      "Walk out with the same five answers in your hands. Your future self will thank you.",
    checklist: {
      items: [
        "Find your exact post-termination exercise window in the plan document",
        "Pull a current FMV from the equity team or your last 409A",
        "List your vested option count and your strike price",
        "Decide a partial-exercise number you can fund without strain",
        "Talk to a CPA before you wire money. Same week, not same year.",
      ],
    },
  },
];

// ─────────────────────────────────────────────────────────────────────
// Case study: Maya — "Choose Maya's next move"
// ─────────────────────────────────────────────────────────────────────
const caseStudySteps: Step[] = [
  {
    id: "setup",
    heading: "The setup",
    takeaway:
      "Maya joined a Series B startup in 2018. 8,000 ISOs at a $0.40 strike, four-year vest, one-year cliff, 90-day post-termination window. She was 28. Equity felt like a bonus.",
    details: [
      p(
        "She filed the grant letter and didn't think about it for a year. The decisions she walks through next are the same shape your decisions will be.",
      ),
    ],
  },
  {
    id: "year-2",
    heading: "Year 2: 2,000 vested, 409A at $1.20",
    takeaway:
      "Maya's first decision she didn't know she was making. Spread is small. Cash to exercise is small. AMT impact is tiny. What would you do?",
    decision: {
      prompt: "Vested 2,000 ISOs, strike $0.40, 409A $1.20. What would you do?",
      options: [
        { label: "Exercise the vested 2,000 now and start the clock" },
        { label: "Wait. Equity feels like a bonus, no rush.", mayaChose: true },
        { label: "Wait until the company looks more promising" },
      ],
      revealHeading: "Maya waited",
      revealBlocks: [
        {
          type: "worked-example",
          title: "Her exercise math at year 2",
          lines: [
            "Vested options: 2,000",
            "Cost to exercise: 2,000 × $0.40 = $800",
            "Spread at exercise: ($1.20 − $0.40) × 2,000 = $1,600",
            "AMT exposure: $1,600 (probably no AMT triggered at her income)",
          ],
        },
        p(
          "She didn't know that exercising early would have started her long-term capital gains clock at the cheapest possible spread.",
        ),
      ],
    },
  },
  {
    id: "year-3",
    heading: "Year 3: the unicorn round",
    takeaway:
      "Series D at $5B. The 409A jumps to $25. Maya now has 4,000 vested. Same strike. Same shares. The numbers, twelve months later.",
    decision: {
      prompt: "Vested 4,000, strike $0.40, 409A now $25. What now?",
      options: [
        { label: "Exercise everything and pre-fund the AMT" },
        {
          label: "Don't exercise. AMT just got serious.",
          mayaChose: true,
        },
        { label: "Exercise some — start partial clock" },
      ],
      revealHeading: "Maya didn't exercise",
      revealBlocks: [
        {
          type: "worked-example",
          title: "Her exercise math at year 3",
          lines: [
            "Vested options: 4,000",
            "Cost to exercise: 4,000 × $0.40 = $1,600",
            "Spread at exercise: ($25 − $0.40) × 4,000 = $98,400",
            "AMT exposure: $98,400 (now a real AMT problem)",
          ],
        },
        {
          type: "callout",
          severity: "red",
          title: "The cost of waiting",
          body: "Same shares, same strike. Twelve months earlier the AMT exposure was $1,600. Now it's nearly $100K. Maya could not afford to exercise without a real tax conversation.",
        },
      ],
    },
  },
  {
    id: "year-5",
    heading: "Year 5: the tender",
    takeaway:
      "The company runs a tender at $40. Employees can sell up to 25% of vested shares. Maya, fully vested with 8,000 options, qualifies to sell 2,000.",
    decision: {
      prompt: "Tender at $40. Sell 2,000 same-year, or hold for qualifying disposition?",
      options: [
        {
          label: "Participate. Down payment is real money.",
          mayaChose: true,
        },
        { label: "Skip the tender. Keep holding for LTCG." },
        { label: "Exercise more now to lock in basis for future qualifying" },
      ],
      revealHeading: "Maya participated",
      revealBlocks: [
        p(
          "Same-year exercise and sale is a disqualifying disposition for ISOs. The spread was taxed as ordinary income, not as AMT. Her CPA estimated a five-figure ordinary-income tax hit.",
        ),
        {
          type: "callout",
          severity: "amber",
          title: "Same-year exercise + sale = disqualifying disposition",
          body: "If she had wanted the friendlier ISO treatment on the tendered shares, she would have needed to exercise at least a year earlier and hold past the tender. The tender itself made qualifying impossible.",
        },
        p(
          "She participated anyway. After tax, the cash from the tender funded her down payment. The remaining 6,000 options stayed unexercised because she still couldn't comfortably cover the AMT on a full exercise.",
        ),
      ],
    },
  },
  {
    id: "year-6",
    heading: "Year 6: starting the clock",
    takeaway:
      "After working with her CPA, Maya considers exercising her remaining 6,000 options before the rumored IPO. The 409A is $30.",
    decision: {
      prompt: "Exercise 6,000 now (4 months pre-IPO) or wait until IPO?",
      options: [
        {
          label: "Exercise now. Start the LTCG clock.",
          mayaChose: true,
        },
        { label: "Wait. Less cash out, less risk." },
      ],
      revealHeading: "Maya exercised, with her CPA",
      revealBlocks: [
        {
          type: "worked-example",
          title: "Her exercise math at year 6",
          lines: [
            "Vested options exercised: 6,000",
            "Cost to exercise: 6,000 × $0.40 = $2,400",
            "Spread at exercise: ($30 − $0.40) × 6,000 = $177,600",
            "AMT exposure: significant (pre-funded estimated tax)",
          ],
        },
        p(
          "By exercising and holding, she started the long-term holding clock. The 2-year-from-grant rule was already satisfied. The remaining requirement was 1 year past exercise.",
        ),
        {
          type: "callout",
          severity: "green",
          title: "The clock she should have started in year 2",
          body: "This is the move she didn't make at the cliff. Late is better than never, and waiting any longer would have meant exercising at IPO-day FMV.",
        },
      ],
    },
  },
  {
    id: "year-7",
    heading: "Year 7: IPO and lockup",
    takeaway:
      "The company IPOs. Lock-up is 180 days. By the time it expires, Maya is about 10 months past her year-6 exercise. Selling now would be disqualifying.",
    decision: {
      prompt: "Sell at lock-up end, or wait two more months for LTCG?",
      options: [
        { label: "Sell at lock-up end. Take the cash." },
        {
          label: "Wait two more months. Cross the 1-year-from-exercise line.",
          mayaChose: true,
        },
      ],
      revealHeading: "Maya waited two more months",
      revealBlocks: [
        p(
          "After the 1-year-from-exercise mark, her sale qualified for long-term capital gains treatment on the entire gain from strike to sale. The AMT she had pre-funded in year 6 became a minimum-tax credit she carried into the next several tax years.",
        ),
        {
          type: "callout",
          severity: "green",
          title: "Two months flipped the entire gain to LTCG",
          body: "Selling at lock-up end would have been disqualifying. Two months of patience flipped the entire gain to LTCG treatment. The decision Maya made in year 6 was what made year-7 patience worth something.",
        },
      ],
    },
    inlineQuiz: pickQuiz("case-study", "year-2-mistake"),
  },
  {
    id: "sams-story",
    heading: "The other side: Sam's story",
    takeaway:
      "Same grant, same company, same day. Sam read more about ISOs than Maya did. He exercised at the cliff. The company didn't make it.",
    blocks: [
      {
        type: "worked-example",
        title: "Sam's exercise math at year 2",
        lines: [
          "Vested options: 2,000",
          "Cost to exercise: 2,000 × $0.40 = $800",
          "Spread: ($1.20 − $0.40) × 2,000 = $1,600",
          "AMT exposure: $1,600 (no AMT triggered)",
          "His long-term holding clock: started",
        ],
      },
      {
        type: "callout",
        severity: "red",
        title: "What Sam lost",
        body: "Two years later the company missed two milestones, ran out of runway, and sold for less than the preference stack. Common stock paid out at zero. The $800 Sam spent to exercise didn't come back. There's no AMT credit because no AMT was paid in the first place.",
      },
      {
        type: "callout",
        severity: "amber",
        title: "The asymmetry of early exercise",
        body: "Exercising early at a small spread reduces tax friction if the company succeeds. It also puts cash into an asset that can go to zero. People who can absorb the loss have a different decision than people who can't. This is information, not a recommendation.",
        notAdvice: true,
      },
    ],
  },
  {
    id: "what-shed-do-differently",
    heading: "What Maya would do differently",
    takeaway:
      "Three things, in priority order. The decisions Maya almost got wrong are the same decisions most people do get wrong.",
    blocks: [
      {
        type: "callout",
        severity: "info",
        title: "1. Exercise after the cliff, not after the unicorn round",
        body: "When the spread is small, the AMT is small, and the long-term clock starts. The biggest single mistake was waiting.",
      },
      {
        type: "callout",
        severity: "info",
        title: "2. Find a CPA before the first liquidity event, not during",
        body: "By the time the tender was announced, her decision window was 30 days. A CPA who understood equity could have modeled the trade-offs in advance.",
      },
      {
        type: "callout",
        severity: "info",
        title: "3. Treat the grant letter as a budget, not a bonus",
        body: "Reading it in year 1 instead of year 2 would have changed every other decision.",
      },
    ],
  },
];

export const moduleSteps: Record<string, Step[]> = {
  basics: basicsSteps,
  isos: isosSteps,
  nsos: nsosSteps,
  rsus: rsusSteps,
  tax: taxSteps,
  liquidity: liquiditySteps,
  leaving: leavingSteps,
  "case-study": caseStudySteps,
};

export function stepsFor(moduleId: string): Step[] {
  return moduleSteps[moduleId] ?? [];
}
