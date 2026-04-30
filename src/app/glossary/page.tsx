import { glossary } from "@/data/glossary";
import GlossaryClient from "@/components/glossary/GlossaryClient";

export const metadata = {
  title: "Glossary",
  description:
    "Plain-English definitions for the equity terms you'll run into: ISOs, NSOs, RSUs, AMT, qualifying disposition, 83(b), QSBS, and the rest.",
};

/**
 * Glossary tab. The interactive surface lives in GlossaryClient
 * (search, A-Z jump row, category filter, two-column cards). The page
 * itself just renders the eyebrow, heading, intro, and the client
 * component. Each term still has a stable slug used as its anchor id,
 * so individual definitions remain deep-linkable (e.g. /glossary#amt).
 */
export default function GlossaryPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-12 md:px-10 md:py-16">
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
        className="mt-4 max-w-2xl text-base leading-7"
        style={{ color: "var(--text-secondary)" }}
      >
        About thirty-five terms you will run into when reading anything
        about equity. Search for a specific one, jump by letter, or
        filter by category. Each term is deep-linkable, so you can share
        a single definition by URL.
      </p>

      <div className="mt-10">
        <GlossaryClient entries={glossary} />
      </div>

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
