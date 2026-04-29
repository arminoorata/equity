import ExerciseView from "@/components/exercise/ExerciseView";

export const metadata = { title: "Exercise Guide" };

/**
 * Exercise tab. Two sub-views: a five-step decision framework and a
 * post-termination exercise calculator (the 90-day clock that burns
 * more vested options than anything else).
 */
export default function ExercisePage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-12 md:px-10 md:py-16">
      <p
        className="text-xs font-medium uppercase tracking-[0.32em]"
        style={{ color: "var(--accent)" }}
      >
        Exercise guide
      </p>
      <h1 className="mt-3 text-3xl font-medium tracking-tight md:text-4xl">
        Surface the questions worth asking.
      </h1>
      <p
        className="mt-3 max-w-2xl text-base leading-7"
        style={{ color: "var(--text-secondary)" }}
      >
        The framework walks through five short questions and shows what
        applies to your shape. The post-termination calculator answers
        the 90-day question that costs people the most.
      </p>
      <div className="mt-8">
        <ExerciseView />
      </div>
    </main>
  );
}
