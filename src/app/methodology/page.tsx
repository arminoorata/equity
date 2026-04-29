import Link from "next/link";

export const metadata = {
  title: "Methodology",
  description:
    "How the tax math, acceleration framing, and §1202 dating in this tool was sourced. April 2026 review.",
};

/**
 * Methodology and sources note. A short, plain-English page that
 * documents which IRS guidance and statutory sections back the tax
 * math used in the calculators and modules. Linked from each module
 * page footer so a TR-savvy reader can verify rigor on inspection.
 */
export default function MethodologyPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12 md:px-10 md:py-16">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-[12px] underline-offset-4 hover:underline"
        style={{ color: "var(--text-muted)" }}
      >
        <span aria-hidden>←</span> Home
      </Link>

      <header className="mt-8">
        <p
          className="text-xs font-medium uppercase tracking-[0.32em]"
          style={{ color: "var(--accent)" }}
        >
          Methodology
        </p>
        <h1 className="mt-3 text-3xl font-medium tracking-tight md:text-4xl">
          How this tool gets the math right.
        </h1>
        <p
          className="mt-3 text-base leading-7"
          style={{ color: "var(--text-secondary)" }}
        >
          A short reference for anyone who wants to see the work. US
          federal tax mechanics only. State-level differences are flagged
          where they matter but not modeled.
        </p>
      </header>

      <section className="mt-12 space-y-8">
        <Block
          heading="What the calculators compute"
          body={[
            "ISO outcomes assume a qualifying disposition (held more than 1 year past exercise and 2 years past grant) for the long-term capital gains rate. AMT exposure is shown separately because whether AMT actually triggers depends on the user's full tax picture.",
            "NSO outcomes apply ordinary income tax on the spread at exercise and long-term capital gains on any post-exercise appreciation if held past 1 year.",
            "RSU outcomes apply ordinary income tax on the full FMV at settlement. Sale value above settlement FMV is treated as capital gain (long-term if held more than 1 year past settlement).",
            "All taxes are floored at zero. A sale below strike registers as no tax owed in this view; the corresponding capital loss is a separate scenario this tool does not model.",
          ]}
        />

        <Block
          heading="Disqualifying ISO dispositions"
          body={[
            "If you sell ISO shares before meeting both holding periods, the sale is a disqualifying disposition. Any gain up to the spread at exercise is taxed as ordinary income; gain above that stays capital. A sale at a loss is a capital loss with no ordinary-income portion.",
            "This rule is asymmetric in the user's favor on the downside, which is why the calculators do not subtract a negative tax from a loss scenario.",
          ]}
        />

        <Block
          heading="ISO post-termination tax rule"
          body={[
            "Federal tax law requires ISO exercise within 3 months of separation to retain ISO tax treatment. Past the 3-month mark the option may still be exercisable under a longer plan window, but the spread at exercise is taxed as ordinary income (NSO treatment), regardless of what the plan document says about exercisability.",
            "Two clocks: the plan's post-termination exercise window (controls whether the option exists) and the federal 3-month rule (controls how the option is taxed). The 3-month tax window extends to 12 months in the case of permanent disability, and there is no time limit if exercise is by the estate after the holder's death.",
          ]}
        />

        <Block
          heading="QSBS dating (Section 1202)"
          body={[
            "For shares acquired after September 27, 2010 and on or before July 4, 2025: 100% gain exclusion at 5-year hold, with a per-issuer cap of the greater of $10M or 10x basis.",
            "For shares acquired after July 4, 2025: phased exclusions, 50% at 3 years, 75% at 4 years, 100% at 5 years, with a per-issuer cap of the greater of $15M (indexed) or 10x basis.",
            "For shares acquired on or before September 27, 2010, the exclusion percentages are lower (50% or 75% depending on date) and the excluded portion is added back as an AMT preference under §57(a)(7). This tool does not model that bucket; it flags where the topic applies and points to a CPA.",
            "Eligibility (qualified small business, original-issue stock, gross-asset thresholds, active-business requirement) is verified case by case.",
          ]}
        />

        <Block
          heading="Acceleration and change-of-control"
          body={[
            "Acceleration mechanics (single trigger, double trigger, full vs partial) are described in plain English without recommending any specific terms. The point is to teach readers to identify what their offer letter or grant agreement already says, not to suggest what to negotiate.",
          ]}
        />

        <Block
          heading="What this tool does not do"
          body={[
            "It does not model state income tax or state-specific RSU sourcing rules.",
            "It does not compute AMT owed, only AMT exposure (the spread that gets added to AMT income).",
            "It does not factor in employer payroll withholding rates, supplemental wage rates, FICA, or state withholding.",
            "It does not reflect any planning structures (gifting, charitable trusts, NUA elections, §83(i) deferrals) that depend on the user's broader financial picture.",
          ]}
        />

        <SourcesBlock />

        <Block
          heading="On the plan-language interpretation"
          body={[
            "Plain-language interpretation of common equity plan terms (post-termination exercise windows, single vs double trigger, lock-up provisions, change-of-control acceleration) is drawn from public plan documents and standard offer letters. The educational framing is not a substitute for reading your own paperwork.",
          ]}
        />

        <Block
          heading="Last reviewed"
          body={[
            "April 2026. Re-check this page when tax law changes. If you spot a stale figure or rule, the source code is open at github.com/arminoorata/equity and a corrections issue is welcome.",
          ]}
        />
      </section>

      <p
        className="mt-12 rounded-md border px-4 py-3 text-xs italic leading-6"
        style={{
          borderColor: "var(--amber-border)",
          background: "var(--amber-bg)",
          color: "var(--text-muted)",
        }}
      >
        Educational only. Not tax, legal, or financial advice. Talk to a
        qualified advisor for your specific situation.
      </p>
    </main>
  );
}

function Block({
  heading,
  body,
}: {
  heading: string;
  body: string[];
}) {
  return (
    <section>
      <h2
        className="text-lg font-semibold"
        style={{ color: "var(--text)" }}
      >
        {heading}
      </h2>
      <div className="mt-3 space-y-3">
        {body.map((paragraph, i) => (
          <p
            key={i}
            className="text-[15px] leading-7"
            style={{ color: "var(--text-secondary)" }}
          >
            {paragraph}
          </p>
        ))}
      </div>
    </section>
  );
}

const sourceLinks: Array<{ label: string; href: string }> = [
  {
    label: "IRS Publication 525, Taxable and Nontaxable Income",
    href: "https://www.irs.gov/publications/p525",
  },
  {
    label: "IRS Form 6251 instructions, Alternative Minimum Tax",
    href: "https://www.irs.gov/instructions/i6251",
  },
  {
    label: "26 U.S.C. §83, Property transferred in connection with services",
    href: "https://www.law.cornell.edu/uscode/text/26/83",
  },
  {
    label: "26 U.S.C. §422, Incentive stock options",
    href: "https://www.law.cornell.edu/uscode/text/26/422",
  },
  {
    label: "26 U.S.C. §1202, Partial exclusion for gain from QSBS",
    href: "https://www.law.cornell.edu/uscode/text/26/1202",
  },
  {
    label: "26 U.S.C. §55-§59, Alternative Minimum Tax",
    href: "https://www.law.cornell.edu/uscode/text/26/55",
  },
  {
    label: "Public Law 119-21 (One Big Beautiful Bill Act)",
    href: "https://www.congress.gov/bill/119th-congress/house-bill/1/text",
  },
];

function SourcesBlock() {
  return (
    <section>
      <h2
        className="text-lg font-semibold"
        style={{ color: "var(--text)" }}
      >
        Sources
      </h2>
      <p
        className="mt-3 text-[15px] leading-7"
        style={{ color: "var(--text-secondary)" }}
      >
        Tax math and statutory citations come from the following primary
        sources. Linked so the reader can verify directly.
      </p>
      <ul
        className="mt-3 list-disc space-y-2 pl-5 text-[15px] leading-7"
        style={{ color: "var(--text-secondary)" }}
      >
        {sourceLinks.map((s) => (
          <li key={s.href}>
            <a
              href={s.href}
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-4"
              style={{ color: "var(--accent)" }}
            >
              {s.label}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
