import { modules } from "@/data/modules";
import PathSelector from "@/components/learn/PathSelector";
import SetupGrantsButton from "@/components/grants/SetupGrantsButton";

export const metadata = {
  title: { absolute: "Equity Education Portal" },
  description:
    "A free public tool for understanding stock options, RSUs, vesting, taxes, and the decisions that come with all of it.",
};

/**
 * Learn home (`/`). The intro is intentionally short — visitors scan,
 * they don't read. One hook, one trust line, one primary CTA. The
 * PathSelector below it is where the actual choosing happens.
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
        <h1
          className="mt-4 text-2xl font-medium leading-snug tracking-tight md:text-[28px]"
          style={{ color: "var(--text)" }}
        >
          Equity can expire, surprise you with taxes, or become real money.
          Pick what you have and see the few decisions that matter.
        </h1>
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <SetupGrantsButton labelOverride="Start with my grant" />
          <span
            className="text-xs"
            style={{ color: "var(--text-muted)" }}
          >
            Private by default. Numbers stay on your device.
          </span>
        </div>
      </section>

      {/* Path selector + module grid */}
      <div className="mt-12">
        <PathSelector modules={modules} />
      </div>
    </main>
  );
}
