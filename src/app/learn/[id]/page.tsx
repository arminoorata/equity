import Link from "next/link";
import { notFound } from "next/navigation";
import { getModule, modules } from "@/data/modules";
import ModuleCompletionButton from "@/components/learn/ModuleCompletionButton";

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

      <div className="mt-10 space-y-8">
        {m.sections.map((section, i) => (
          <section key={i}>
            <h2
              className="text-lg font-semibold"
              style={{ color: "var(--text)" }}
            >
              {section.heading}
            </h2>
            <p
              className="mt-2 text-[15px] leading-7"
              style={{ color: "var(--text-secondary)" }}
            >
              {section.body}
            </p>
          </section>
        ))}
      </div>

      <div className="mt-12 flex flex-wrap items-center gap-3">
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
