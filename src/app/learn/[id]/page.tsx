import Link from "next/link";
import { notFound } from "next/navigation";
import { getModule, modules } from "@/data/modules";
import { stepsFor } from "@/data/module-steps";
import ModuleExperience from "@/components/learn/ModuleExperience";

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
 * Module detail page at /learn/[id]. Server-rendered for SEO
 * (metadata uses the canonical title + blurb), with the actual
 * step-based learning experience handed off to a client component
 * so progress, disclosures, and decision reveals stay interactive.
 */
export default async function ModulePage({ params }: ModulePageProps) {
  const { id } = await params;
  const m = getModule(id);
  if (!m) notFound();

  const steps = stepsFor(m.id);
  const idx = modules.findIndex((x) => x.id === m.id);
  const prev = idx > 0 ? modules[idx - 1] : null;
  const next = idx < modules.length - 1 ? modules[idx + 1] : null;

  // If a module has no steps yet for any reason, fall back to a stub
  // rather than crashing the build.
  if (steps.length === 0) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-12 md:px-10 md:py-16">
        <Link
          href="/"
          className="text-[12px] underline-offset-4 hover:underline"
          style={{ color: "var(--text-muted)" }}
        >
          ← All modules
        </Link>
        <h1 className="mt-8 text-3xl font-medium tracking-tight">
          {m.title}
        </h1>
        <p
          className="mt-3 text-[14.5px] leading-7"
          style={{ color: "var(--text-muted)" }}
        >
          This module doesn&apos;t have step content yet.
        </p>
      </main>
    );
  }

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
          <span>{m.cardTitle ?? m.title}</span>
        </h1>
        {m.hook && (
          <p
            className="mt-3 text-[15px] leading-7"
            style={{ color: "var(--text-secondary)" }}
          >
            {m.hook}
          </p>
        )}
        <p
          className="mt-3 text-[12px] uppercase tracking-[0.18em]"
          style={{ color: "var(--text-muted)" }}
        >
          <span className="mono">{m.minutes}</span> min ·{" "}
          <span className="mono">{steps.length}</span> steps
        </p>
      </header>

      <div className="mt-10">
        <ModuleExperience
          module={m}
          steps={steps}
          prev={
            prev
              ? { id: prev.id, title: prev.title, cardTitle: prev.cardTitle }
              : null
          }
          next={
            next
              ? { id: next.id, title: next.title, cardTitle: next.cardTitle }
              : null
          }
        />
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
          Tax math follows IRS Pub 525, §422, §1202 and current AMT rules.
          See sources in the{" "}
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
