/**
 * Learn modules. Verbatim from spec/05-CONTENT.md. Six modules in
 * display order. Each module has a stable slug used as the URL segment
 * at /learn/[id], so module pages are deep-linkable and SEO-friendly.
 */

export type ModuleSection = {
  heading: string;
  body: string;
};

export type LearnModule = {
  id: string;
  title: string;
  icon: string;
  minutes: number;
  blurb: string;
  sections: ModuleSection[];
};

export const modules: LearnModule[] = [
  {
    id: "basics",
    title: "Equity 101",
    icon: "🎓",
    minutes: 5,
    blurb:
      "What equity actually is, why companies grant it, and what to read in your own grant.",
    sections: [
      {
        heading: "What \"equity\" actually is",
        body:
          "Equity is part-ownership of the company you work for. Not all of it. Usually a small slice. The slice can grow if the company grows, and disappear if it doesn't. That's the whole pitch.",
      },
      {
        heading: "Why companies grant it",
        body:
          "Two reasons. Cash conservation: equity costs the company nothing today. Alignment: if you own a piece of the upside, you're more likely to care about the upside. The second reason is the better one.",
      },
      {
        heading: "What FMV means before there's a market",
        body:
          "At a private company, your shares aren't traded anywhere, so the company hires an outside firm to estimate their value. That estimate is called a 409A valuation in the US. It's what your strike price is set against. The actual market price (when there is one) can be much higher or much lower. Treat the 409A as a tax number, not a financial forecast.",
      },
      {
        heading: "Vesting, briefly",
        body:
          "Vesting is how you actually earn the equity over time. Most grants vest over four years with a one-year cliff, but everything is negotiable and a lot of grants don't follow that pattern anymore. Your grant has a vesting start date. Read it.",
      },
    ],
  },
  {
    id: "isos",
    title: "ISOs",
    icon: "⭐",
    minutes: 6,
    blurb:
      "Incentive stock options: friendlier tax if you play it right, AMT if you don't.",
    sections: [
      {
        heading: "What ISOs are",
        body:
          "Incentive Stock Options. The right to buy shares at a fixed strike price, with US tax treatment that's friendlier than regular options if you play it right. ISOs are only available to employees of the issuing company.",
      },
      {
        heading: "The tax shape",
        body:
          "At exercise: no regular income tax. (Yes, really.) At sale: if you held shares for more than 1 year past exercise AND more than 2 years past grant, the entire gain from strike to sale is taxed at long-term capital-gains rates. That's the qualifying disposition. Miss either holding period and you have a disqualifying disposition: the spread at exercise gets taxed as ordinary income retroactively.",
      },
      {
        heading: "The AMT trap",
        body:
          "At exercise, your ISO spread (FMV minus strike, multiplied by shares) is added to your Alternative Minimum Tax income. If the AMT calculation comes out higher than your regular tax, you owe the difference. People have been bankrupted by AMT bills on shares they couldn't sell. This is the single biggest ISO landmine. Talk to a tax advisor before exercising any meaningful number of ISOs.",
      },
      {
        heading: "Leaving",
        body:
          "When you leave a company, your unvested options stop vesting. Your vested options usually have an exercise window after termination. The historical default is 90 days, but more companies are offering longer windows now. Check your plan document or your company's equity team. Miss the window and you forfeit the options.",
      },
    ],
  },
  {
    id: "nsos",
    title: "NSOs",
    icon: "📋",
    minutes: 5,
    blurb:
      "Non-qualified options: ordinary income at exercise, broader eligibility, no AMT.",
    sections: [
      {
        heading: "What NSOs are",
        body:
          "Non-qualified Stock Options. Same mechanic as ISOs (right to buy at a strike price), different tax treatment. NSOs can be granted to anyone: employees, directors, contractors, advisors.",
      },
      {
        heading: "The tax shape",
        body:
          "At exercise: the spread between FMV and strike is taxed as ordinary income, like salary. The company will usually withhold taxes through payroll. At sale: any gain above the FMV-at-exercise is capital gains. Long-term if held more than 1 year from exercise.",
      },
      {
        heading: "ISOs vs NSOs at a glance",
        body:
          "ISOs: employees only, friendlier tax if you hit the holding periods, AMT risk. NSOs: anyone eligible, ordinary income at exercise, no AMT, no $100K limit. Many people end up with both because of the $100K ISO cap.",
      },
      {
        heading: "Early exercise",
        body:
          "Some companies let you exercise options before they vest. If you do, file an 83(b) election within 30 days of exercise to be taxed at today's (low) FMV. The clock for long-term capital gains starts at exercise. The risk: if you leave before the unvested shares vest, you lose them, and the tax you paid doesn't come back.",
      },
    ],
  },
  {
    id: "rsus",
    title: "RSUs",
    icon: "🔒",
    minutes: 5,
    blurb:
      "Restricted stock units: no cost to receive, ordinary income at settlement, single or double trigger.",
    sections: [
      {
        heading: "What RSUs are",
        body:
          "Restricted Stock Units. A promise of future shares at no cost. You don't pay anything to get them. You pay tax when they're delivered.",
      },
      {
        heading: "Single trigger vs double trigger",
        body:
          "At public companies, RSUs typically have a single trigger: time vesting. As they vest, shares get delivered and taxes get withheld. At private companies, RSUs almost always have a double trigger: time vesting AND a liquidity event (acquisition, merger, or some number of days post-IPO). Both have to happen before shares deliver. The reason is tax: without a market, you'd owe ordinary income tax on shares you can't sell.",
      },
      {
        heading: "Withholding and what you actually receive",
        body:
          "At settlement, the full FMV is treated as ordinary income. Most companies withhold by selling enough of your shares to cover taxes. So if you vest 100 RSUs at $50 and your withholding rate is 35%, you end up holding around 65 shares. The rest were sold for taxes.",
      },
      {
        heading: "RSUs vs options",
        body:
          "RSUs are always worth something at vest (assuming the stock has any value). Options can go to zero if the strike is above market. Options have more upside if the company grows a lot. RSUs have less risk and less upside. The right answer depends on the company stage and your risk tolerance.",
      },
    ],
  },
  {
    id: "tax",
    title: "Tax scenarios",
    icon: "🧮",
    minutes: 7,
    blurb:
      "Hypothetical numbers showing how the same grant can produce very different after-tax outcomes.",
    sections: [
      {
        heading: "Why this matters",
        body:
          "The same grant can produce very different after-tax outcomes depending on when and how you exercise. The numbers aren't huge for a small grant, but they get serious fast. None of this is tax advice. The point is to show you the shape of the math so you know what to ask.",
      },
      {
        heading: "ISO exercise, hypothetical",
        body:
          "You hold 1,000 ISOs at a $2 strike. Current FMV is $10. To exercise: $2,000 cash. Spread at exercise: $8,000. Regular income tax at exercise: $0. AMT exposure: $8,000 (whether AMT actually triggers depends on your full tax picture). If you hold the shares 1+ year past exercise and 2+ years past grant and sell at $50, the full $48,000 gain per share group goes at long-term capital gains rates.",
      },
      {
        heading: "RSU settlement, hypothetical",
        body:
          "You vest 500 RSUs when the stock is at $40. Ordinary income at settlement: $20,000. If your effective rate is 35%, the company withholds about $7,000 worth, usually by selling roughly 175 of your shares. You end up with about 325 shares delivered.",
      },
      {
        heading: "83(b) election",
        body:
          "If you early-exercise unvested options or receive restricted stock subject to vesting, an 83(b) election lets you be taxed at today's (low) value instead of waiting until vesting. You have 30 days from exercise to file. There are no extensions. The benefit is potentially huge if the company grows. The risk is real. If you leave before the shares vest, you lose them and you don't get the tax back. Get a professional involved.",
      },
      {
        heading: "A note on QSBS",
        body:
          "If you hold qualified small business stock (Section 1202) for more than 5 years, you may exclude up to the greater of $10M or 10× your basis from federal capital gains tax. The rules are specific and easy to break. If your company qualifies, this can be the single most valuable tax benefit you'll ever encounter. Not a calculation to DIY.",
      },
    ],
  },
  {
    id: "liquidity",
    title: "Liquidity",
    icon: "💰",
    minutes: 5,
    blurb:
      "Why private shares are hard to sell, what events change that, and how to plan around real selling windows.",
    sections: [
      {
        heading: "The illiquidity problem",
        body:
          "If your company is private, your shares aren't easy to sell. Even when you've fully vested and exercised, the only buyer is usually the company or the next investor. The 409A valuation tells you what the IRS thinks your shares are worth. It does not tell you what someone will pay.",
      },
      {
        heading: "Liquidity event types",
        body:
          "IPO: the company goes public. Vested shares can usually be sold after a lock-up window (commonly 90–180 days for insiders, sometimes longer). Acquisition or merger: shares convert per the deal terms. Tender offer: a company-organized opportunity for employees to sell some of their shares to new investors at an agreed price. Tender offers are voluntary and limited.",
      },
      {
        heading: "Lock-ups and blackouts",
        body:
          "Even at public companies, you can't always sell. Insiders are blacked out around earnings. Post-IPO lock-ups commonly run 90–180 days. Plan around your real selling windows, not around vest dates.",
      },
      {
        heading: "Planning, not predicting",
        body:
          "Don't make financial commitments based on paper value. Don't count on equity for short-term cash needs. If your company has a public market, build a sale plan. If it doesn't, treat equity as upside, not income.",
      },
    ],
  },
];

export function getModule(id: string): LearnModule | undefined {
  return modules.find((m) => m.id === id);
}
