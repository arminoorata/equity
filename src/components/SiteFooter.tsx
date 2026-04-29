import Link from "next/link";

/**
 * Footer. Two zones per the sibling pattern:
 *  - Top bar: attribution + back-link to the main site, plus the
 *    domain badge on the right.
 *  - Bottom strip: long-form educational disclaimer. Equity decisions
 *    are high-stakes enough that the disclaimer rides everywhere,
 *    not just on the calculator outputs.
 */
export default function SiteFooter() {
  return (
    <footer
      className="mt-24 border-t"
      style={{ borderColor: "var(--line)" }}
    >
      <div
        className="mx-auto max-w-6xl px-6 py-10 text-sm md:px-10"
        style={{ color: "var(--muted)" }}
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p>
              Built by{" "}
              <Link
                href="https://arminoorata.com"
                className="underline underline-offset-4"
                style={{ color: "var(--text)" }}
              >
                Armi Noorata
              </Link>
              .
            </p>
            <p className="mt-1.5 text-xs">
              Free tools for total rewards, equity, and the systems around people.
            </p>
          </div>
          <div className="flex flex-col gap-1 text-xs md:items-end">
            <Link
              href="/for-employers"
              className="underline underline-offset-4"
              style={{ color: "var(--text-secondary)" }}
            >
              For HR &amp; Total Rewards leaders
            </Link>
            <Link
              href="/methodology"
              className="underline underline-offset-4"
              style={{ color: "var(--text-secondary)" }}
            >
              Methodology &amp; sources
            </Link>
            <p className="mt-2 uppercase tracking-[0.24em]">
              equity.arminoorata.com
            </p>
          </div>
        </div>

        <p
          className="mt-7 border-t pt-5 text-[11.5px] italic leading-7 opacity-85"
          style={{ borderColor: "var(--line)" }}
        >
          This tool is for educational purposes only. It is not tax, legal, or
          financial advice. Equity compensation rules vary by jurisdiction,
          employer, plan terms, and personal circumstances. Always consult a
          qualified tax advisor, financial planner, or attorney before making
          decisions about your equity. The calculations shown are illustrations
          using inputs you provide. They are not predictions and should not be
          relied on for filing taxes, planning sales, or making any financial
          commitment.
        </p>
      </div>
    </footer>
  );
}
