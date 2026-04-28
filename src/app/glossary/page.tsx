import { glossary } from "@/data/glossary";

export const metadata = {
  title: "Glossary",
  description:
    "Plain-English definitions for the equity terms you'll run into: ISOs, NSOs, RSUs, AMT, qualifying disposition, 83(b), QSBS, and the rest.",
};

/**
 * Glossary tab. Alphabetised list of ~34 terms. Each term has a stable
 * slug used as its anchor id, so individual definitions are
 * deep-linkable (e.g. /glossary#amt). Content is verbatim from the
 * spec; structure is a definition list (<dl>) for accessibility.
 */
export default function GlossaryPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12 md:px-10 md:py-16">
      <p
        className="text-xs font-medium uppercase tracking-[0.32em]"
        style={{ color: "var(--accent)" }}
      >
        Glossary
      </p>
      <h1 className="mt-3 text-2xl font-medium leading-tight tracking-tight md:text-3xl">
        The terms, in plain English.
      </h1>
      <p
        className="mt-4 text-base leading-7"
        style={{ color: "var(--muted)" }}
      >
        About thirty-five terms you will run into when reading anything about
        equity. No company-specific jargon. Each term is deep-linkable, so
        you can share a single definition by URL.
      </p>

      <dl className="mt-12">
        {glossary.map((entry, index) => (
          <div
            key={entry.slug}
            id={entry.slug}
            className="scroll-mt-24"
            style={{
              borderTop:
                index === 0 ? undefined : "1px solid var(--line)",
              paddingTop: index === 0 ? 0 : "1.25rem",
              paddingBottom: "1.25rem",
            }}
          >
            <dt
              className="text-base font-semibold"
              style={{ color: "var(--text)" }}
            >
              <a
                href={`#${entry.slug}`}
                className="hover:underline underline-offset-4"
                style={{ color: "inherit" }}
              >
                {entry.term}
              </a>
            </dt>
            <dd
              className="mt-1.5 text-[15px] leading-7"
              style={{ color: "var(--text-secondary)" }}
            >
              {entry.definition}
            </dd>
          </div>
        ))}
      </dl>

      <p
        className="mt-12 rounded-md border px-4 py-3 text-xs italic leading-6"
        style={{
          borderColor: "var(--amber-border)",
          background: "var(--amber-bg)",
          color: "var(--text-muted)",
        }}
      >
        Educational only. Not tax, legal, or financial advice. Talk to a
        qualified advisor.
      </p>
    </main>
  );
}
