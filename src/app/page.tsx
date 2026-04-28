import { modules } from "@/data/modules";
import LearnModuleGrid from "@/components/learn/LearnModuleGrid";

export const metadata = {
  title: { absolute: "Equity Education Portal" },
  description:
    "A free public tool for understanding stock options, RSUs, vesting, taxes, and the decisions that come with all of it.",
};

/**
 * Learn tab (`/`). Top: intro card in Armi's voice from spec/05-CONTENT.md.
 * Then the six-module grid (LearnModuleGrid is a client component because
 * it reads the completion state from PortalContext).
 */
export default function LearnPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-12 md:px-10 md:py-16">
      {/* Intro card */}
      <section
        className="rounded-[var(--radius-card)] border p-6 md:p-8"
        style={{
          borderColor: "var(--line)",
          background: "var(--surface)",
        }}
      >
        <p
          className="text-xs font-medium uppercase tracking-[0.32em]"
          style={{ color: "var(--accent)" }}
        >
          Equity Education Portal
        </p>
        <div
          className="mt-4 space-y-4 text-base leading-7 md:text-lg md:leading-[1.6]"
          style={{ color: "var(--text)" }}
        >
          <p>
            Equity is one of the most important parts of compensation, and
            one of the least understood. Most people get a grant letter, a
            vesting schedule, and a hope for the best.
          </p>
          <p>
            This is the version of that grant letter I wish I had the first
            time I received an equity grant. Open the modules to learn the
            basics, set up your grants to see your own numbers, or jump
            straight to Ask if you have something specific.
          </p>
          <p>
            Free, no strings. I built this because it helped me and I hope
            it helps others.
          </p>
        </div>
      </section>

      {/* Module grid */}
      <section className="mt-12">
        <p
          className="text-xs font-medium uppercase tracking-[0.32em]"
          style={{ color: "var(--text-muted)" }}
        >
          Modules ({modules.length})
        </p>
        <h2 className="mt-3 text-2xl font-medium tracking-tight md:text-3xl">
          Start here.
        </h2>
        <p
          className="mt-3 text-base leading-7"
          style={{ color: "var(--muted)" }}
        >
          Six short modules. Pick what&rsquo;s relevant or work through them
          in order. Each one is roughly five minutes.
        </p>
        <div className="mt-8">
          <LearnModuleGrid modules={modules} />
        </div>
      </section>
    </main>
  );
}
