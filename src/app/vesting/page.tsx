import VestingView from "@/components/vesting/VestingView";

export const metadata = { title: "Vesting" };

/**
 * Vesting tab. Two sub-views: Schedule (timeline + summary cards) and
 * Lifecycle (stage bar + value at each stage). Empty state when no
 * grants exist. Wraps the client view component.
 */
export default function VestingPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-12 md:px-10 md:py-16">
      <p
        className="text-xs font-medium uppercase tracking-[0.32em]"
        style={{ color: "var(--accent)" }}
      >
        Vesting
      </p>
      <h1 className="mt-3 text-3xl font-medium tracking-tight md:text-4xl">
        See your schedule.
      </h1>
      <p
        className="mt-3 max-w-2xl text-base leading-7"
        style={{ color: "var(--text-secondary)" }}
      >
        Once your grants are entered, the schedule view shows what is
        vested today, what is next, and the full timeline. The lifecycle
        view maps the same numbers across the stages your grant moves
        through.
      </p>
      <div className="mt-8">
        <VestingView />
      </div>
    </main>
  );
}
