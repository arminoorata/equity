/**
 * Learn modules. Content adapted from spec/05-CONTENT.md, with
 * callouts, comparison tables, and worked-example boxes layered in
 * for clarity. Six modules in display order. Each module has a stable
 * slug used as the URL segment at /learn/[id]; sections within a
 * module each have an anchor slug for deep-linking.
 */

export type Block =
  | { type: "paragraph"; text: string }
  | {
      type: "callout";
      severity: "red" | "amber" | "green" | "info";
      title?: string;
      body: string;
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

export type ModuleSection = {
  id: string;
  heading: string;
  blocks: Block[];
};

export type LearnModule = {
  id: string;
  title: string;
  icon: string;
  minutes: number;
  blurb: string;
  sections: ModuleSection[];
};

const p = (text: string): Block => ({ type: "paragraph", text });

export const modules: LearnModule[] = [
  // ────────────────────────────────────────────────────────────────
  {
    id: "basics",
    title: "Equity 101",
    icon: "🎓",
    minutes: 5,
    blurb:
      "What equity actually is, why companies grant it, and what to read in your own grant.",
    sections: [
      {
        id: "what-equity-is",
        heading: "What \"equity\" actually is",
        blocks: [
          p(
            "Equity is part-ownership of the company you work for. Not all of it. Usually a small slice. The slice can grow if the company grows, and disappear if it doesn't. That's the whole pitch.",
          ),
        ],
      },
      {
        id: "why-companies-grant-it",
        heading: "Why companies grant it",
        blocks: [
          p(
            "Two reasons. Cash conservation: equity costs the company nothing today. Alignment: if you own a piece of the upside, you're more likely to care about the upside. The second reason is the better one.",
          ),
        ],
      },
      {
        id: "fmv-before-market",
        heading: "What FMV means before there's a market",
        blocks: [
          p(
            "At a private company, your shares aren't traded anywhere, so the company hires an outside firm to estimate their value. That estimate is called a 409A valuation in the US. It's what your strike price is set against.",
          ),
          {
            type: "callout",
            severity: "info",
            title: "Read this twice",
            body: "Treat the 409A as a tax number, not a financial forecast. Actual market prices can be much higher or much lower.",
          },
        ],
      },
      {
        id: "vesting-briefly",
        heading: "Vesting, briefly",
        blocks: [
          p(
            "Vesting is how you actually earn the equity over time. Most grants vest over four years with a one-year cliff, but everything is negotiable and a lot of grants don't follow that pattern anymore.",
          ),
          {
            type: "callout",
            severity: "green",
            title: "One thing to do today",
            body: "Open your grant letter and find the vesting start date. It's not always the grant date. The vesting clock runs from this date.",
          },
          { type: "widget", widget: "vesting-timeline" },
        ],
      },
    ],
  },
  // ────────────────────────────────────────────────────────────────
  {
    id: "isos",
    title: "ISOs",
    icon: "⭐",
    minutes: 6,
    blurb:
      "Incentive stock options: friendlier tax if you play it right, AMT if you don't.",
    sections: [
      {
        id: "what-isos-are",
        heading: "What ISOs are",
        blocks: [
          p(
            "Incentive Stock Options. The right to buy shares at a fixed strike price, with US tax treatment that's friendlier than regular options if you play it right. ISOs are only available to employees of the issuing company.",
          ),
        ],
      },
      {
        id: "tax-shape",
        heading: "The tax shape",
        blocks: [
          p(
            "At exercise: no regular income tax. (Yes, really.) At sale: if you held shares for more than 1 year past exercise AND more than 2 years past grant, the entire gain from strike to sale is taxed at long-term capital-gains rates. That's the qualifying disposition. Miss either holding period and you have a disqualifying disposition: the spread at exercise gets taxed as ordinary income retroactively.",
          ),
          {
            type: "callout",
            severity: "green",
            title: "Qualifying disposition rules",
            body: "Hold 1+ year past exercise AND 2+ years past grant. Both. Miss either and the favorable treatment evaporates.",
          },
        ],
      },
      {
        id: "amt-trap",
        heading: "The AMT trap",
        blocks: [
          p(
            "At exercise, your ISO spread (FMV minus strike, multiplied by shares) is added to your Alternative Minimum Tax income. If the AMT calculation comes out higher than your regular tax, you owe the difference.",
          ),
          {
            type: "callout",
            severity: "red",
            title: "AMT is the single biggest ISO landmine",
            body: "People have been bankrupted by AMT bills on shares they couldn't sell. Talk to a tax advisor before exercising any meaningful number of ISOs. Use the calculator below to see your spread, then call someone who actually does this for a living.",
          },
          { type: "widget", widget: "amt-spread" },
        ],
      },
      {
        id: "leaving",
        heading: "Leaving",
        blocks: [
          p(
            "When you leave a company, your unvested options stop vesting. Your vested options usually have an exercise window after termination. The historical default is 90 days, but more companies are offering longer windows now.",
          ),
          {
            type: "callout",
            severity: "amber",
            title: "Easiest deadline to miss",
            body: "Check your plan document or your company's equity team for your specific exercise window. Miss it and you forfeit the options. Put it in your calendar the day you give notice.",
          },
        ],
      },
    ],
  },
  // ────────────────────────────────────────────────────────────────
  {
    id: "nsos",
    title: "NSOs",
    icon: "📋",
    minutes: 5,
    blurb:
      "Non-qualified options: ordinary income at exercise, broader eligibility, no AMT.",
    sections: [
      {
        id: "what-nsos-are",
        heading: "What NSOs are",
        blocks: [
          p(
            "Non-qualified Stock Options. Same mechanic as ISOs (right to buy at a strike price), different tax treatment. NSOs can be granted to anyone: employees, directors, contractors, advisors.",
          ),
        ],
      },
      {
        id: "tax-shape",
        heading: "The tax shape",
        blocks: [
          p(
            "At exercise: the spread between FMV and strike is taxed as ordinary income, like salary. The company will usually withhold taxes through payroll. At sale: any gain above the FMV-at-exercise is capital gains. Long-term if held more than 1 year from exercise.",
          ),
          { type: "widget", widget: "nso-exercise-tax" },
        ],
      },
      {
        id: "isos-vs-nsos",
        heading: "ISOs vs NSOs at a glance",
        blocks: [
          {
            type: "table",
            headers: ["", "ISOs", "NSOs"],
            rows: [
              ["Who can receive them", "Employees only", "Anyone (employees, directors, contractors, advisors)"],
              ["Tax at exercise", "None on regular income (AMT applies)", "Ordinary income on the spread"],
              ["AMT exposure", "Yes (spread counts toward AMT)", "No"],
              ["$100K rule", "Only $100K worth can become exercisable per year", "No limit"],
              ["Friendlier long-term tax", "Yes, with qualifying disposition", "Capital gains only on post-exercise growth"],
            ],
          },
          p(
            "Many people end up with both because of the $100K ISO cap. Anything over the cap is automatically treated as NSO.",
          ),
        ],
      },
      {
        id: "early-exercise",
        heading: "Early exercise",
        blocks: [
          p(
            "Some companies let you exercise options before they vest. If you do, file an 83(b) election within 30 days of exercise to be taxed at today's (low) FMV. The clock for long-term capital gains starts at exercise.",
          ),
          {
            type: "callout",
            severity: "amber",
            title: "The 83(b) tradeoff",
            body: "If you leave before the unvested shares vest, you lose them, and the tax you paid doesn't come back. Don't early-exercise more than you can afford to forfeit.",
          },
        ],
      },
    ],
  },
  // ────────────────────────────────────────────────────────────────
  {
    id: "rsus",
    title: "RSUs",
    icon: "🔒",
    minutes: 5,
    blurb:
      "Restricted stock units: no cost to receive, ordinary income at settlement, single or double trigger.",
    sections: [
      {
        id: "what-rsus-are",
        heading: "What RSUs are",
        blocks: [
          p(
            "Restricted Stock Units. A promise of future shares at no cost. You don't pay anything to get them. You pay tax when they're delivered.",
          ),
        ],
      },
      {
        id: "single-vs-double-trigger",
        heading: "Single trigger vs double trigger",
        blocks: [
          p(
            "At public companies, RSUs typically have a single trigger: time vesting. As they vest, shares get delivered and taxes get withheld. At private companies, RSUs almost always have a double trigger: time vesting AND a liquidity event (acquisition, merger, or some number of days post-IPO). Both have to happen before shares deliver.",
          ),
          {
            type: "callout",
            severity: "info",
            title: "Why double trigger exists",
            body: "Without a market, you'd owe ordinary income tax on shares you can't sell. The second trigger waits until there's actually a way to cover the tax bill.",
          },
        ],
      },
      {
        id: "withholding",
        heading: "Withholding and what you actually receive",
        blocks: [
          p(
            "At settlement, the full FMV is treated as ordinary income. Most companies withhold by selling enough of your shares to cover taxes.",
          ),
          {
            type: "worked-example",
            title: "Hypothetical: 100 RSUs settling at $50",
            lines: [
              "Gross income: 100 × $50 = $5,000",
              "Withholding rate: 35%",
              "Shares sold to cover taxes: ~35",
              "Shares delivered to you: ~65",
            ],
            footnote: "Actual withholding rates vary by employer and your tax situation.",
          },
          { type: "widget", widget: "rsu-withholding" },
        ],
      },
      {
        id: "rsus-vs-options",
        heading: "RSUs vs options",
        blocks: [
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
            "The right answer depends on the company stage and your risk tolerance. In practice you may receive both, in which case treat them as separate decisions.",
          ),
        ],
      },
    ],
  },
  // ────────────────────────────────────────────────────────────────
  {
    id: "tax",
    title: "Tax scenarios",
    icon: "🧮",
    minutes: 7,
    blurb:
      "Hypothetical numbers showing how the same grant can produce very different after-tax outcomes.",
    sections: [
      {
        id: "why-this-matters",
        heading: "Why this matters",
        blocks: [
          p(
            "The same grant can produce very different after-tax outcomes depending on when and how you exercise. The numbers aren't huge for a small grant, but they get serious fast.",
          ),
          {
            type: "callout",
            severity: "info",
            body: "None of this is tax advice. The point is to show you the shape of the math so you know what to ask.",
          },
        ],
      },
      {
        id: "iso-exercise-example",
        heading: "ISO exercise, hypothetical",
        blocks: [
          {
            type: "worked-example",
            title: "1,000 ISOs at $2 strike, FMV at exercise $10, sale price $50",
            lines: [
              "Cash to exercise: 1,000 × $2 = $2,000",
              "Spread at exercise: ($10 − $2) × 1,000 = $8,000",
              "Regular income tax at exercise: $0",
              "AMT exposure: $8,000 (whether AMT triggers depends on your full tax picture)",
              "Hold 1+ year past exercise + 2+ years past grant, then sell at $50:",
              "Long-term capital gain: ($50 − $2) × 1,000 = $48,000 at LTCG rates",
            ],
          },
        ],
      },
      {
        id: "rsu-settlement-example",
        heading: "RSU settlement, hypothetical",
        blocks: [
          {
            type: "worked-example",
            title: "500 RSUs settling at $40, 35% effective withholding",
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
        id: "compare-cards",
        heading: "Compare: ISO qualifying disposition vs NSO, same numbers",
        blocks: [
          { type: "widget", widget: "iso-vs-nso-compare" },
          p(
            "Same grant size, same exit price. The tax treatment is the difference. ISOs reward patience with the qualifying disposition rules. NSOs front-load the ordinary-income hit.",
          ),
        ],
      },
      {
        id: "section-83b",
        heading: "83(b) election",
        blocks: [
          p(
            "If you early-exercise unvested options or receive restricted stock subject to vesting, an 83(b) election lets you be taxed at today's (low) value instead of waiting until vesting. You have 30 days from exercise to file. There are no extensions.",
          ),
          {
            type: "callout",
            severity: "amber",
            title: "Real risk, real upside",
            body: "If you leave before the shares vest, you lose them and you don't get the tax back. If the company grows substantially, all subsequent gain is at LTCG rates. Get a professional involved.",
          },
        ],
      },
      {
        id: "qsbs",
        heading: "A note on QSBS",
        blocks: [
          p(
            "If you hold qualified small business stock (Section 1202) for more than 5 years, you may exclude up to the greater of $10M or 10× your basis from federal capital gains tax. The rules are specific and easy to break.",
          ),
          {
            type: "callout",
            severity: "green",
            title: "Worth asking about",
            body: "If your company qualifies, this can be the single most valuable tax benefit you'll ever encounter. Not a calculation to DIY. Ask your tax advisor whether your shares are §1202-eligible before you sell.",
          },
        ],
      },
    ],
  },
  // ────────────────────────────────────────────────────────────────
  {
    id: "liquidity",
    title: "Liquidity",
    icon: "💰",
    minutes: 5,
    blurb:
      "Why private shares are hard to sell, what events change that, and how to plan around real selling windows.",
    sections: [
      {
        id: "illiquidity-problem",
        heading: "The illiquidity problem",
        blocks: [
          p(
            "If your company is private, your shares aren't easy to sell. Even when you've fully vested and exercised, the only buyer is usually the company or the next investor.",
          ),
          {
            type: "callout",
            severity: "info",
            body: "The 409A valuation tells you what the IRS thinks your shares are worth. It does not tell you what someone will actually pay.",
          },
        ],
      },
      {
        id: "event-types",
        heading: "Liquidity event types",
        blocks: [
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
        id: "lockups-blackouts",
        heading: "Lock-ups and blackouts",
        blocks: [
          p(
            "Even at public companies, you can't always sell. Insiders are blacked out around earnings. Post-IPO lock-ups commonly run 90–180 days.",
          ),
          { type: "widget", widget: "lockup-timeline" },
          p(
            "Plan around your real selling windows, not around vest dates. Vesting tells you what's yours; the calendar tells you when you can act on it.",
          ),
        ],
      },
      {
        id: "planning",
        heading: "Planning, not predicting",
        blocks: [
          {
            type: "callout",
            severity: "amber",
            title: "The two rules that keep people out of trouble",
            body: "Don't make financial commitments based on paper value. Don't count on equity for short-term cash needs.",
          },
          p(
            "If your company has a public market, build a sale plan. If it doesn't, treat equity as upside, not income.",
          ),
        ],
      },
    ],
  },
];

export function getModule(id: string): LearnModule | undefined {
  return modules.find((m) => m.id === id);
}
