import Link from "next/link";
import { notFound } from "next/navigation";
import { getModule, modules, type Block } from "@/data/modules";
import { quizFor } from "@/data/quizzes";
import ModuleCompletionButton from "@/components/learn/ModuleCompletionButton";
import Quiz from "@/components/learn/Quiz";
import Callout from "@/components/learn/blocks/Callout";
import ComparisonTable from "@/components/learn/blocks/ComparisonTable";
import WorkedExample from "@/components/learn/blocks/WorkedExample";
import WidgetSlot from "@/components/learn/blocks/WidgetSlot";
import Paragraph from "@/components/learn/blocks/Paragraph";
import QuestionsToAsk from "@/components/learn/blocks/QuestionsToAsk";

type ModulePageProps = {
  params: Promise<{ id: string }>;
};

// Generate one static page per module at build time.
export const dynamicParams = false;

export function generateStaticParams() {
  return modules.map((m) => ({ id: m.id }));
}

export async function generateMetadata({ params }: ModulePageProps) {
  const { id } = await params;
  const m = getModule(id);
  if (!m) return {};
  return {
    title: m.title,
    description: m.blurb,
  };
}

/**
 * Module detail page at /learn/[id]. Server-rendered and statically
 * generated. The "Mark complete" toggle lives in a small client
 * component that talks to PortalContext.
 *
 * Each section gets a stable anchor id so individual concepts are
 * deep-linkable (e.g. /learn/isos#amt-trap). Section headings render
 * as clickable anchors.
 */
export default async function ModulePage({ params }: ModulePageProps) {
  const { id } = await params;
  const m = getModule(id);
  if (!m) notFound();

  const idx = modules.findIndex((x) => x.id === m.id);
  const prev = idx > 0 ? modules[idx - 1] : null;
  const next = idx < modules.length - 1 ? modules[idx + 1] : null;

  return (
    <main className="mx-auto max-w-3xl px-6 py-12 md:px-10 md:py-16">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-[12px] underline-offset-4 hover:underline"
        style={{ color: "var(--text-muted)" }}
      >
        <span aria-hidden>←</span> All modules
      </Link>

      <header className="mt-8">
        <p
          className="text-xs font-medium uppercase tracking-[0.32em]"
          style={{ color: "var(--accent)" }}
        >
          Module
        </p>
        <h1 className="mt-3 flex items-center gap-3 text-3xl font-medium leading-tight tracking-tight md:text-4xl">
          <span aria-hidden>{m.icon}</span>
          <span>{m.title}</span>
        </h1>
        <p
          className="mt-2 text-[12px] uppercase tracking-[0.18em]"
          style={{ color: "var(--text-muted)" }}
        >
          <span className="mono">{m.minutes}</span> min read
        </p>
      </header>

      <div className="mt-10 space-y-10">
        {m.sections.map((section) => (
          <section
            key={section.id}
            id={section.id}
            className="scroll-mt-24"
          >
            <h2
              className="text-lg font-semibold"
              style={{ color: "var(--text)" }}
            >
              <a
                href={`#${section.id}`}
                className="hover:underline underline-offset-4"
                style={{ color: "inherit" }}
              >
                {section.heading}
              </a>
            </h2>
            <div className="mt-3 space-y-4">
              {section.blocks.map((block, i) => (
                <BlockView key={i} block={block} />
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-12">
        <Quiz questions={quizFor(m.id)} />
      </div>

      <div className="mt-10">
        <QuestionsToAsk questions={m.questions} />
      </div>

      <div className="mt-10 flex flex-wrap items-center gap-3">
        <ModuleCompletionButton moduleId={m.id} />
        {prev && (
          <Link href={`/learn/${prev.id}`} className="btn">
            ← {prev.title}
          </Link>
        )}
        {next && (
          <Link href={`/learn/${next.id}`} className="btn">
            {next.title} →
          </Link>
        )}
      </div>

      <div
        className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t pt-4 text-[11px]"
        style={{
          borderColor: "var(--line)",
          color: "var(--text-muted)",
        }}
      >
        {m.lastReviewed && (
          <span className="uppercase tracking-[0.18em]">
            US-focused. Last reviewed{" "}
            <span className="mono" style={{ color: "var(--text-secondary)" }}>
              {formatReviewDate(m.lastReviewed)}
            </span>
          </span>
        )}
        <span>
          Tax math follows IRS Pub 525, §422, §1202 and current AMT
          rules. See sources in the{" "}
          <Link
            href="/methodology"
            className="underline underline-offset-4"
            style={{ color: "var(--text-secondary)" }}
          >
            methodology note
          </Link>
          .
        </span>
      </div>

      <p
        className="mt-6 rounded-md border px-4 py-3 text-xs italic leading-6"
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

function formatReviewDate(yyyyMm: string): string {
  const [y, m] = yyyyMm.split("-");
  if (!y || !m) return yyyyMm;
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const monthIndex = Number(m) - 1;
  const monthName = monthNames[monthIndex] ?? m;
  return `${monthName} ${y}`;
}

function BlockView({ block }: { block: Block }) {
  switch (block.type) {
    case "paragraph":
      return <Paragraph text={block.text} />;
    case "callout":
      return (
        <Callout
          severity={block.severity}
          title={block.title}
          body={block.body}
          notAdvice={block.notAdvice}
        />
      );
    case "table":
      return (
        <ComparisonTable
          caption={block.caption}
          headers={block.headers}
          rows={block.rows}
        />
      );
    case "worked-example":
      return (
        <WorkedExample
          title={block.title}
          lines={block.lines}
          footnote={block.footnote}
        />
      );
    case "widget":
      return <WidgetSlot widget={block.widget} />;
  }
}
