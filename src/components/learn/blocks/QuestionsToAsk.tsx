/**
 * Closing card on each module page (and the exercise framework
 * results) that turns passive understanding into action. Lists the
 * questions worth asking the user's own equity team or CPA. Renders
 * nothing if no questions are provided, so this is safe to drop in
 * everywhere.
 */
export default function QuestionsToAsk({
  questions,
  audience = "your equity team or CPA",
  title = "Questions to ask",
}: {
  questions?: string[];
  audience?: string;
  title?: string;
}) {
  if (!questions || questions.length === 0) return null;

  return (
    <aside
      className="rounded-md border-l-4 p-5"
      style={{
        borderColor: "var(--accent)",
        background: "var(--surface)",
        border: "1px solid var(--line)",
        borderLeftColor: "var(--accent)",
        borderLeftWidth: 4,
      }}
      aria-label={title}
    >
      <p
        className="text-[11px] font-semibold uppercase tracking-[0.18em]"
        style={{ color: "var(--accent)" }}
      >
        {title}
      </p>
      <p
        className="mt-1 text-xs"
        style={{ color: "var(--text-muted)" }}
      >
        Take these to {audience}. Specific questions get specific
        answers.
      </p>
      <ol
        className="mt-4 list-decimal space-y-2 pl-5 text-[14.5px] leading-7"
        style={{ color: "var(--text)" }}
      >
        {questions.map((q, i) => (
          <li key={i}>{q}</li>
        ))}
      </ol>
    </aside>
  );
}
