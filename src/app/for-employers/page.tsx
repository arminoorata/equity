import Link from "next/link";

export const metadata = {
  title: "For HR & Total Rewards leaders",
  description:
    "How to use the Equity Education Portal with your team: when to send it, what it covers, and how it complements your equity team and CPA.",
};

/**
 * For HR & Total Rewards leaders. A small page that gives TR / HR
 * peers rollout confidence. Lives at /for-employers and is reachable
 * from the footer (not the main tab nav, so employees and candidates
 * never hit it accidentally).
 *
 * Goals of this page:
 *  - Show TR-savvy readers the tool was designed by someone who has
 *    sat in their seat. The voice should reflect lived practice, not
 *    procurement copy.
 *  - Give explicit rollout suggestions tied to events that actually
 *    happen on a TR calendar (offer, refresh, leaver, pre-event).
 *  - Document what the tool does NOT do, so HR leaders know where
 *    their internal docs and equity team still need to be the source
 *    of truth.
 */
export default function ForEmployersPage() {
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
          For HR &amp; Total Rewards leaders
        </p>
        <h1 className="mt-3 text-3xl font-medium tracking-tight md:text-4xl">
          How this fits in your toolkit.
        </h1>
        <p
          className="mt-3 text-base leading-7"
          style={{ color: "var(--text-secondary)" }}
        >
          Built by a Total Rewards practitioner who got tired of
          answering the same equity questions on Slack. This is a
          public, no-strings education layer your employees and
          candidates can use without giving up data, paying for a
          login, or reading a 60-page Carta primer.
        </p>
      </header>

      <section className="mt-12 space-y-8">
        <Block heading="What it does">
          <p>
            Plain-English modules on ISOs, NSOs, RSUs, AMT, taxes,
            liquidity events, and what happens when someone leaves.
            Live calculators (options, RSUs, scenario compare, offer
            compare, dilution and preference scenarios) that take the
            reader&rsquo;s own assumptions and show the shape of the
            outcome. A worked case study that follows one person from
            grant date through IPO, with a counter-story when the
            company doesn&rsquo;t make it. Every module ends with a
            short list of questions for the reader&rsquo;s own equity
            team or CPA.
          </p>
          <p>
            Tax content is US-focused, dated, and reviewed against
            current IRS guidance. The{" "}
            <Link
              href="/methodology"
              className="underline underline-offset-4"
              style={{ color: "var(--accent)" }}
            >
              methodology page
            </Link>{" "}
            documents what the calculators compute, the post-July-2025
            §1202 split, and what the tool intentionally does not
            model.
          </p>
        </Block>

        <Block heading="When to send it">
          <Row
            label="Offer stage"
            body="Pair with the offer letter. The Equity 101 module covers what a grant letter contains and what to read in your own. The offer-compare calculator helps candidates think through cash + equity tradeoffs without you ghost-writing their decision."
          />
          <Row
            label="New hire orientation"
            body="Replace the 'figure it out from Carta' default with a guided path: Equity 101, then the grant type that applies, then the company-facts checklist. Most onboarding decks under-cover this."
          />
          <Row
            label="Annual refresh"
            body="The case study shows what compounding decisions look like over years. Useful before refresh-grant communications, especially for senior employees who already have layered grants."
          />
          <Row
            label="Pre-IPO, pre-tender, or pre-acquisition"
            body="The pre-liquidity playbook in the Liquidity module gives a 12-months-out timeline. The acceleration section explains single vs double trigger and good-reason language, which is one of the things senior employees ask about right before a deal."
          />
          <Row
            label="Leaver process"
            body="The Leaving module spells out the 90-day plan window, the 3-month ISO tax rule, what happens to early-exercised shares, and the leaving-day checklist. The Exercise tab includes a post-termination calculator that converts your departing employee's vested options into a cash-needed number."
          />
          <Row
            label="When AMT season hits"
            body="In Q1 every year, employees who exercised ISOs the prior year start asking your team about AMT. The AMT widget in the ISOs module and the calculator in the Calculators tab let them model their own number first, which raises the quality of the conversation when it gets to your CPA."
          />
        </Block>

        <Block heading="What it does not do">
          <ul
            className="list-disc space-y-2 pl-5"
            style={{ color: "var(--text-secondary)" }}
          >
            <li>
              No company-specific data. The tool does not know your
              409A, your plan terms, or your equity platform. Your
              internal docs remain the source of truth.
            </li>
            <li>
              No tax filing. The calculators show the shape of the math
              with the inputs the reader provides. They are
              illustrations, not returns.
            </li>
            <li>
              No state tax modeling. Multi-state RSU sourcing and ISO
              state allocation are flagged as topics, not computed.
            </li>
            <li>
              No negotiation guidance. The acceleration section explains
              what single trigger and good reason mean so an employee
              can read their own paperwork. It does not coach the
              reader on what to ask for.
            </li>
            <li>
              No app backend, no logged-in account, no client analytics
              tags. Vercel sees request-level traffic at the platform
              layer, the same as for any static site. The Ask tab uses
              the reader&rsquo;s own Anthropic API key to call
              Anthropic directly, with no key or conversation routed
              through this site.
            </li>
            <li>
              No actual AMT owed. The calculators show AMT exposure
              (the spread that gets added to AMT income); whether AMT
              triggers depends on the reader&rsquo;s full tax picture,
              which the tool does not know.
            </li>
            <li>
              No employer withholding, supplemental wage rates, FICA,
              or payroll mechanics. RSU withholding shows the
              percentage-of-shares model commonly used; precise
              dollar-for-dollar withholding behavior depends on your
              payroll setup.
            </li>
          </ul>
        </Block>

        <Block heading="Third-party AI notice for the Ask tab">
          <p>
            The Ask tab calls Anthropic, a third-party AI provider, from
            the reader&rsquo;s browser using their own API key. The tool
            never sees the key or the conversation. Even so, plan
            documents and grant data leave the reader&rsquo;s machine
            and reach Anthropic when uploaded or quoted.
          </p>
          <p>
            If your company prohibits sending compensation or
            plan-document data to outside AI services, tell employees
            to use the Ask tab with generic questions only and skip the
            plan-document upload. The empty-state copy and the upload
            UI both surface that warning. The educational tabs (Learn,
            Vesting, Calculators, Exercise, Glossary) do not call
            Anthropic and are unaffected.
          </p>
        </Block>

        <Block heading="What it pairs well with">
          <ul
            className="list-disc space-y-2 pl-5"
            style={{ color: "var(--text-secondary)" }}
          >
            <li>
              Your plan document and grant agreements (the source of
              truth for everything specific).
            </li>
            <li>
              Your equity platform (Carta, Pulley, Shareworks, etc.) for
              actual share counts, exercise dates, and current 409A.
            </li>
            <li>
              A CPA who has worked with equity-heavy compensation. The
              modules and calculators raise the floor on what your
              employees walk into a CPA meeting knowing.
            </li>
            <li>
              Your equity team mailbox. The questions-to-ask card at
              the end of each module routes specific questions back to
              you, instead of becoming Slack-DM noise.
            </li>
          </ul>
        </Block>

        <Block heading="Sharing it">
          <p>
            The site is open and free. There is nothing to license and
            no embed required. A direct link works for orientation
            decks, refresh comms, and Slack DMs. Module pages have
            stable anchors (e.g.{" "}
            <span
              className="mono"
              style={{ color: "var(--text-secondary)" }}
            >
              /learn/isos#amt-trap
            </span>
            ) so you can deep-link to a specific concept.
          </p>
          <p>
            The source code is open at{" "}
            <span className="mono">github.com/arminoorata/equity</span>
            . If something is wrong, a corrections issue is welcome.
          </p>
        </Block>

        <Block heading="A note on voice">
          <p>
            The modules are written in first person, in a Total Rewards
            practitioner&rsquo;s voice. They name tradeoffs out loud
            and call AMT a landmine because it is one. The directness
            is deliberate. This is easiest to share in cultures where
            employees are trusted with the full tax and liquidity
            picture.
          </p>
        </Block>
      </section>

      <p
        className="mt-12 rounded-md border px-4 py-3 text-xs italic leading-6"
        style={{
          borderColor: "var(--amber-border)",
          background: "var(--amber-bg)",
          color: "var(--text-muted)",
        }}
      >
        Educational only. Not tax, legal, or financial advice. Refer
        employees to a qualified advisor for their specific situation.
      </p>
    </main>
  );
}

function Block({
  heading,
  children,
}: {
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2
        className="text-lg font-semibold"
        style={{ color: "var(--text)" }}
      >
        {heading}
      </h2>
      <div
        className="mt-3 space-y-3 text-[15px] leading-7"
        style={{ color: "var(--text-secondary)" }}
      >
        {children}
      </div>
    </section>
  );
}

function Row({ label, body }: { label: string; body: string }) {
  return (
    <div
      className="rounded-md border p-4"
      style={{ borderColor: "var(--line)", background: "var(--surface)" }}
    >
      <p
        className="text-[11px] font-medium uppercase tracking-[0.18em]"
        style={{ color: "var(--accent)" }}
      >
        {label}
      </p>
      <p className="mt-2 text-[14.5px] leading-7" style={{ color: "var(--text)" }}>
        {body}
      </p>
    </div>
  );
}
