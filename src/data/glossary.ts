/**
 * Glossary content. Verbatim from spec/05-CONTENT.md. Alphabetically
 * ordered. Slugs are derived for in-page anchors so individual terms
 * are deep-linkable (e.g. /glossary#amt).
 */

export type GlossaryEntry = {
  term: string;
  slug: string;
  definition: string;
};

function slugify(term: string): string {
  return term
    .toLowerCase()
    .replace(/\(.*?\)/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

const entries: Array<[string, string]> = [
  [
    "83(b) Election",
    "A US tax filing made within 30 days of exercising unvested options or receiving restricted stock. Lets you be taxed on today's (usually low) value instead of at vesting. No extensions on the 30-day deadline. Talk to a tax advisor before filing.",
  ],
  [
    "409A Valuation",
    "An independent appraisal of a private company's fair market value, used to set strike prices for new option grants. Required by the IRS. The 409A is a tax number. Actual market prices can differ meaningfully.",
  ],
  [
    "AMT (Alternative Minimum Tax)",
    "A parallel US tax calculation that can be triggered by exercising ISOs. The spread at exercise is added to AMT income. May or may not result in actual AMT owed depending on your full tax picture.",
  ],
  [
    "Capital Gains",
    "Profit from selling an asset. Short-term (held <1 year) is taxed as ordinary income. Long-term (held >1 year) is taxed at lower rates.",
  ],
  [
    "Cashless Exercise",
    "Exercising options and immediately selling enough shares to cover the cost. Requires a liquid market, so generally only available post-IPO.",
  ],
  [
    "Cliff",
    "A minimum service period before any of your equity vests. Commonly 12 months for new-hire grants, 6 months for refreshers, but everything is negotiable.",
  ],
  [
    "Common Stock",
    "Shares granted to employees. Junior to preferred stock in liquidation, which means investors get paid first.",
  ],
  [
    "Dilution",
    "When a company issues new shares, existing ownership percentages shrink. Normal at growing companies.",
  ],
  [
    "Disqualifying Disposition",
    "Selling ISO shares before meeting both holding periods (1 year post-exercise + 2 years post-grant). The spread at exercise gets taxed as ordinary income.",
  ],
  [
    "Double Trigger Vesting",
    "An RSU mechanism at private companies: shares deliver only after both time vesting AND a liquidity event (acquisition, merger, or some number of days post-IPO).",
  ],
  [
    "Early Exercise",
    "Exercising options before they vest. Often paired with an 83(b) election. Requires that the company allow it. Many don't.",
  ],
  [
    "Exercise",
    "Buying shares at the strike price specified in your grant.",
  ],
  [
    "Exercise Window (Post-Termination)",
    "The period after you leave a company during which you can still exercise vested options. Historical default is 90 days. Some companies offer longer windows now. Check your plan document.",
  ],
  [
    "Fair Market Value (FMV)",
    "Current per-share value. At public companies, the trading price. At private companies, the most recent 409A valuation.",
  ],
  [
    "Grant Date",
    "The date your equity award was officially approved and issued. Often different from your vesting start date.",
  ],
  [
    "Grant Letter",
    "The legal document describing your specific grant. Contains the terms that actually apply to you. Read it.",
  ],
  [
    "ISOs (Incentive Stock Options)",
    "US-only option type with friendlier tax treatment than NSOs if you meet specific holding-period rules. AMT applies. Available only to employees.",
  ],
  [
    "IPO",
    "Initial Public Offering. The company starts trading on a public exchange. Often a trigger for RSU settlement at private companies.",
  ],
  [
    "Liquidation Preference",
    "The order and amount in which different classes of stockholders get paid in an acquisition or wind-down. Investors typically have it. Common stockholders typically don't.",
  ],
  [
    "Lock-up Period",
    "A post-IPO restriction on insiders selling shares. Typically 90–180 days, sometimes longer.",
  ],
  [
    "LTCG (Long-Term Capital Gains)",
    "The tax rate applied to gains on assets held more than one year. Lower than ordinary income rates.",
  ],
  [
    "NSOs (Non-Qualified Stock Options)",
    "Stock options taxed as ordinary income at exercise on the spread between FMV and strike. Available to employees, directors, and contractors.",
  ],
  [
    "Ordinary Income",
    "Income taxed at regular rates (like salary). Applies to NSO spread at exercise and full FMV at RSU settlement.",
  ],
  [
    "Plan Document",
    "The legal document governing all grants under a company's equity plan. Different from your grant letter, which is your specific terms. Both matter.",
  ],
  [
    "Preferred Stock",
    "Shares held by investors with rights senior to common (priority in liquidation, sometimes board control, etc.).",
  ],
  [
    "QSBS (Qualified Small Business Stock)",
    "US Section 1202 of the tax code. If you hold qualifying shares for more than 5 years, you may exclude up to the greater of $10M or 10x your basis from federal capital gains tax. Eligibility rules are specific.",
  ],
  [
    "Qualifying Disposition",
    "Selling ISO shares after holding them at least 1 year post-exercise AND 2 years post-grant. The whole gain from strike to sale gets long-term capital-gains treatment.",
  ],
  [
    "RSU (Restricted Stock Unit)",
    "A promise of future shares at no cost. Single trigger at public companies (time vesting). Double trigger at private companies (time vesting + liquidity event).",
  ],
  [
    "Spread",
    "FMV minus strike price. Your unrealized gain per share at exercise.",
  ],
  [
    "Strike Price",
    "The fixed price you pay per share when exercising an option. Set at the FMV on the grant date.",
  ],
  [
    "Tax Withholding",
    "The portion of your equity income the company holds back to cover taxes. For RSUs, usually done by selling enough of your shares at vest.",
  ],
  [
    "Tender Offer",
    "A company-organized opportunity for employees and early investors to sell shares before an IPO, at an agreed price. Voluntary and limited.",
  ],
  [
    "Vesting",
    "Earning your equity over time according to a schedule. Until shares vest, you don't have rights to them.",
  ],
  [
    "Vesting Start Date",
    "The date your vesting clock begins. May or may not match your grant date. The vesting schedule runs from this date.",
  ],
];

export const glossary: GlossaryEntry[] = entries.map(([term, definition]) => ({
  term,
  slug: slugify(term),
  definition,
}));
