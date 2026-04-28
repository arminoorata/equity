"use client";

import { useState } from "react";
import type { QuizQuestion } from "@/data/quizzes";

/**
 * End-of-module quiz block. Renders 2 to 3 multiple-choice questions
 * stacked. Each option, when clicked, reveals an explanation tied to
 * that specific option (not just "wrong" or "right"). The point is
 * self-check, not grading. State is local to the component, no
 * scoring, no submit button.
 */
export default function Quiz({ questions }: { questions: QuizQuestion[] }) {
  if (questions.length === 0) return null;

  return (
    <section
      aria-label="Check yourself"
      className="rounded-md border"
      style={{
        borderColor: "var(--line)",
        background: "var(--surface)",
      }}
    >
      <header
        className="border-b px-5 py-3"
        style={{ borderColor: "var(--line)" }}
      >
        <p
          className="text-[11px] font-semibold uppercase tracking-[0.18em]"
          style={{ color: "var(--accent)" }}
        >
          Check yourself
        </p>
        <p
          className="mt-1 text-[12.5px]"
          style={{ color: "var(--text-muted)" }}
        >
          Click an answer for an explanation. No scoring, no submit. The
          point is to test your own understanding.
        </p>
      </header>
      <ol className="divide-y" style={{ borderColor: "var(--line)" }}>
        {questions.map((q, i) => (
          <li
            key={q.id}
            className="px-5 py-5"
            style={{ borderColor: "var(--line)" }}
          >
            <QuizQuestionView question={q} index={i + 1} />
          </li>
        ))}
      </ol>
    </section>
  );
}

function QuizQuestionView({
  question,
  index,
}: {
  question: QuizQuestion;
  index: number;
}) {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <div>
      <p
        className="text-[10px] font-semibold uppercase tracking-[0.18em]"
        style={{ color: "var(--text-muted)" }}
      >
        Question {index}
      </p>
      <h3
        className="mt-1.5 text-[15px] font-semibold leading-6"
        style={{ color: "var(--text)" }}
      >
        {question.prompt}
      </h3>
      <ul className="mt-4 space-y-2">
        {question.options.map((opt, i) => {
          const isSelected = selected === i;
          const showExplanation = isSelected;
          const tone = isSelected
            ? opt.correct
              ? {
                  border: "var(--green-border)",
                  bg: "var(--green-bg)",
                  ring: "var(--green)",
                  badge: "Right",
                }
              : {
                  border: "var(--red-border)",
                  bg: "var(--red-bg)",
                  ring: "var(--red)",
                  badge: "Not quite",
                }
            : null;

          return (
            <li key={i}>
              <button
                type="button"
                onClick={() => setSelected(i)}
                aria-pressed={isSelected}
                className="w-full rounded-md border px-4 py-2.5 text-left text-[14px] leading-6 transition-colors"
                style={{
                  borderColor: tone?.border ?? "var(--line)",
                  background: tone?.bg ?? "var(--surface-alt)",
                  color: "var(--text)",
                  cursor: "pointer",
                }}
              >
                {opt.label}
              </button>
              {showExplanation && tone && (
                <div
                  className="mt-1.5 rounded-md border-l-[3px] px-4 py-2.5 text-[13.5px] leading-6"
                  style={{
                    borderLeftColor: tone.ring,
                    background: tone.bg,
                    color: "var(--text)",
                  }}
                >
                  <p
                    className="text-[10px] font-semibold uppercase tracking-[0.18em]"
                    style={{ color: tone.ring }}
                  >
                    {tone.badge}
                  </p>
                  <p className="mt-1">{opt.explanation}</p>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
