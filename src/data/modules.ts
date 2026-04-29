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
      {
        id: "83b-flag",
        heading: "If your grant lets you early-exercise: 83(b)",
        blocks: [
          p(
            "Some companies let you exercise options before they vest. If you do, an 83(b) election lets you be taxed at today's (low) value instead of waiting until vesting. The tax savings can be substantial. There is a 30-day deadline from the exercise date. No extensions.",
          ),
          {
            type: "callout",
            severity: "red",
            title: "30-day deadline, no extensions",
            body: "Miss the 30 days and you forfeit the favorable treatment forever. Same applies if you receive restricted stock subject to vesting.",
            notAdvice: true,
          },
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
            body: "People have been bankrupted by AMT bills on shares they couldn't sell. Use the calculator below to see your spread, then call someone who actually does this for a living.",
            notAdvice: true,
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
            notAdvice: true,
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
        id: "if-you-moved",
        heading: "If you moved during vesting",
        blocks: [
          p(
            "RSUs settling at vest get taxed as W-2 income for the state where you earned them. If you moved during the vesting period, multiple states want a piece of the same shares.",
          ),
          {
            type: "callout",
            severity: "amber",
            title: "Source-of-income rules vary",
            body: "California, New York, Massachusetts, and a handful of other states allocate RSU income across the period the shares were earned, not just where you live at vest. If you moved between any of those, you may owe tax to a state you no longer live in. Confirm with a CPA who works across state lines.",
          },
          p(
            "Two practical moves. Keep your work-location history (and dates) for every quarter your RSUs were vesting. And ask your equity team or payroll how they handle multi-state withholding before the first vest after a move.",
          ),
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
            body: "If you leave before the shares vest, you lose them and you don't get the tax back. If the company grows substantially, all subsequent gain is at LTCG rates.",
            notAdvice: true,
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
      {
        id: "pre-liquidity-playbook",
        heading: "Pre-liquidity playbook",
        blocks: [
          p(
            "If a tender offer or IPO is on the horizon, the most common mistake is doing nothing until the announcement. By then your tax-planning options narrow. The shape of what to do, working backwards from the event:",
          ),
          {
            type: "table",
            caption: "Educational framing only. Talk to a tax advisor about your specific situation.",
            headers: ["When", "What to do"],
            rows: [
              [
                "12+ months out",
                "Pull together your basis records (grant date, strike, exercise date, FMV at exercise). Find a CPA who has handled equity events before.",
              ],
              [
                "6 to 12 months out",
                "Model AMT scenarios if you hold ISOs and have not exercised. Pre-funding an exercise gets cheaper the earlier you do it.",
              ],
              [
                "3 to 6 months out",
                "Decide your sale plan in advance. Tender percentages, lock-up windows, and tax-year edges all matter. Write it down before adrenaline takes over.",
              ],
              [
                "60 days out",
                "Confirm your exercise window if you might leave. Confirm withholding mechanics with your equity team. Block off time for the paperwork.",
              ],
              [
                "Day of",
                "Don't make irreversible moves on the announcement day. Sleep on it. Let your CPA model the actual numbers.",
              ],
            ],
          },
          {
            type: "callout",
            severity: "amber",
            title: "The plan is the point",
            body: "The expensive part of a liquidity event is often the rushed decisions, not the tax bill itself. A rough plan beats no plan, every time.",
          },
        ],
      },
    ],
  },
  // ────────────────────────────────────────────────────────────────
  {
    id: "leaving",
    title: "Leaving",
    icon: "🚪",
    minutes: 5,
    blurb:
      "The 90-day clock, what happens to unvested shares, and the 83(b) caveat if you early-exercised.",
    sections: [
      {
        id: "the-clock",
        heading: "The post-termination clock",
        blocks: [
          p(
            "When you leave a company, your unvested options stop vesting that day. Your vested options usually have a fixed window after termination during which you can still exercise them. After that window, they expire and the shares are gone.",
          ),
          {
            type: "callout",
            severity: "red",
            title: "The historical default is 90 days",
            body: "Some companies offer 5 to 10 years now (Pinterest and Coinbase set the example). Some offer less than 90 days. The number in your plan document is the one that controls whether the option still exists. Find it before you give notice.",
          },
          {
            type: "callout",
            severity: "amber",
            title: "ISOs have a separate 3-month rule",
            body: "Federal tax law requires ISO exercise within 3 months of employment ending to keep ISO tax treatment. Past 90 days, the option may still be exercisable under your plan, but it gets taxed as an NSO (ordinary income on the spread at exercise). Two clocks: your plan window and the 3-month ISO clock. Often they line up. Sometimes they don't.",
          },
        ],
      },
      {
        id: "what-it-costs",
        heading: "What it costs to exercise",
        blocks: [
          p(
            "Two pieces. First, the strike price times your vested shares. That's the cash you owe the company for the shares. Second, depending on grant type, tax. NSOs trigger ordinary income tax on the spread at exercise. ISOs trigger AMT exposure (which may or may not produce an actual tax bill, but counts toward your tax picture).",
          ),
          { type: "widget", widget: "vesting-timeline" },
          p(
            "Use the post-termination calculator in the Exercise tab to see your number with your specific grant and current FMV.",
          ),
        ],
      },
      {
        id: "if-you-early-exercised",
        heading: "If you early-exercised",
        blocks: [
          p(
            "If your company allowed early exercise and you took it, the unvested shares you bought get repurchased by the company at your original strike price when you leave. You don't get the tax you paid back. The 83(b) election locked in your tax basis at today's FMV when you exercised; the company's repurchase right unwinds that for the unvested portion only.",
          ),
          {
            type: "callout",
            severity: "amber",
            title: "Don't early-exercise more than you can afford to forfeit",
            body: "If the company succeeds and you stay, this is great. If you leave before the shares vest, you lose them, and the tax doesn't come back. The math has to work both ways.",
            notAdvice: true,
          },
        ],
      },
      {
        id: "what-vests-on-the-way-out",
        heading: "What vests on the way out",
        blocks: [
          p(
            "Most plans use cliff vesting. If you leave before your one-year cliff, you typically get nothing. After the cliff, your vested portion is yours; everything past your last day stops accruing.",
          ),
          p(
            "Some plans have acceleration provisions on a change of control or termination without cause. Those are negotiated up front and live in your offer paperwork. Read it.",
          ),
        ],
      },
      {
        id: "leaving-checklist",
        heading: "A checklist for the day you give notice",
        blocks: [
          {
            type: "callout",
            severity: "info",
            title: "Five things to do before HR has your laptop",
            body:
              "1. Find your exact post-termination exercise window in the plan document.\n" +
              "2. Pull a current FMV from the equity team or your last 409A.\n" +
              "3. List your vested option count and your strike price.\n" +
              "4. Decide a partial-exercise number you can fund without strain.\n" +
              "5. Talk to a CPA before you wire money. Same week, not same year.",
          },
        ],
      },
    ],
  },
  // ────────────────────────────────────────────────────────────────
  {
    id: "case-study",
    title: "Case study: Maya",
    icon: "📖",
    minutes: 8,
    blurb:
      "One person, grant date through IPO. The decisions that mattered, the ones that didn't, and what she'd do differently.",
    sections: [
      {
        id: "intro",
        heading: "The setup",
        blocks: [
          p(
            "Maya joined a Series B startup in 2018. She received 8,000 ISOs at a $0.40 strike, vesting over four years with a one-year cliff. Her grant letter mentioned a 90-day post-termination exercise window.",
          ),
          p(
            "She was 28. The job paid well enough that the equity felt like a bonus. She filed the grant letter and didn't think about it for a year.",
          ),
        ],
      },
      {
        id: "year-2",
        heading: "Year 2: the first decision she didn't know she was making",
        blocks: [
          p(
            "After the cliff, Maya had 2,000 vested ISOs at $0.40 strike. The company's 409A had moved to $1.20.",
          ),
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
            "She didn't exercise. She didn't know that exercising early would have started her long-term capital gains clock at the cheapest possible spread.",
          ),
        ],
      },
      {
        id: "year-3",
        heading: "Year 3: the unicorn round",
        blocks: [
          p(
            "The company raised a Series D at a $5B valuation. The 409A jumped to $25 a share. Tech press called it a unicorn.",
          ),
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
      {
        id: "year-5",
        heading: "Year 5: the tender",
        blocks: [
          p(
            "The company ran a tender offer at $40 a share. Employees could sell up to 25% of their vested shares. Maya, fully vested with 8,000 options, qualified to sell 2,000.",
          ),
          p(
            "She had still not exercised. To participate, she had to exercise the 2,000 (cost: $800) and sell them in the same tender window. Same-year exercise and sale is a disqualifying disposition for ISOs, so the spread was taxed as ordinary income, not as AMT. Her CPA estimated a five-figure ordinary-income tax hit on the $40 minus $0.40 spread.",
          ),
          {
            type: "callout",
            severity: "amber",
            title: "Same-year exercise and sale = disqualifying disposition",
            body: "If she had wanted the friendlier ISO treatment on the tendered shares, she would have needed to exercise at least a year earlier and hold past the tender. The tender itself made qualifying impossible.",
          },
          p(
            "She participated anyway. After tax, the cash from the tender funded her down payment. The remaining 6,000 options stayed unexercised because she still could not comfortably cover the AMT exposure on a full exercise.",
          ),
        ],
      },
      {
        id: "year-6",
        heading: "Year 6: starting the clock",
        blocks: [
          p(
            "After working with her CPA, Maya exercised her remaining 6,000 options 4 months before the rumored IPO. The 409A had moved to $30. Spread at exercise: ($30 minus $0.40) times 6,000 = $177,600. AMT exposure was significant, and she pre-funded estimated tax payments to cover it.",
          ),
          p(
            "By exercising and holding, she started the long-term holding clock. The grant date was already far enough back that the 2-year-from-grant rule was satisfied. The remaining requirement was 1 year past exercise.",
          ),
          {
            type: "callout",
            severity: "green",
            title: "The clock she should have started in year 2",
            body: "This is the move she didn't make at the cliff. Late is better than never, and waiting any longer would have meant exercising at IPO-day FMV.",
          },
        ],
      },
      {
        id: "year-7",
        heading: "Year 7: IPO",
        blocks: [
          p(
            "The company IPO'd. Lock-up was 180 days. By the time the lock-up expired, Maya was about 10 months past her year-6 exercise. Selling then would have been a disqualifying disposition (still under 1 year from exercise), with the spread taxed as ordinary income.",
          ),
          p(
            "She waited the additional 2 months. After the 1-year-from-exercise mark, her sale qualified for long-term capital gains treatment on the entire gain from strike to sale. The AMT she had pre-funded in year 6 became a minimum-tax credit she carried into the next several tax years.",
          ),
          {
            type: "callout",
            severity: "green",
            title: "Patience past the lock-up paid off",
            body: "Selling at lock-up end would have been disqualifying. Two more months of waiting flipped the entire gain to LTCG treatment. The decision Maya made in year 6 was what made the year-7 patience worth something.",
          },
        ],
      },
      {
        id: "what-she-would-do-differently",
        heading: "What she'd do differently",
        blocks: [
          p(
            "Three things, in priority order:",
          ),
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
          p(
            "Maya did fine in the end. Most of the people in her cohort did not, because the same decisions Maya almost got wrong, others did get wrong. The tools, the calendar, and a five-page grant letter would have been enough.",
          ),
        ],
      },
    ],
  },
];

export function getModule(id: string): LearnModule | undefined {
  return modules.find((m) => m.id === id);
}
