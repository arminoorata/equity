"use client";

import { useState } from "react";
import type { QuizQuestion } from "@/data/quizzes";

/**
 * Single-question active-recall check, rendered inline inside a
 * step. Reuses the same `QuizQuestion` shape as the end-of-module
 * Quiz so existing question copy lives in one place.
 *
 * No scoring, no submit, no progress — clicking an option reveals
 * the explanation tied to that option. Replays cleanly on click.
 */
export default function InlineQuiz({ question }: { question: QuizQuestion }) {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <div
      className="rounded-md border"
      style={{
        borderColor: "var(--line)",
        background: "var(--surface-alt)",
      }}
    >
      <div
        className="border-b px-4 py-2.5"
        style={{ borderColor: "var(--line)" }}
      >
        <p
          className="text-[10px] font-semibold uppercase tracking-[0.18em]"
          style={{ color: "var(--accent)" }}
        >
          Quick check
        </p>
        <h3
          className="mt-1 text-[14.5px] font-semibold leading-6"
          style={{ color: "var(--text)" }}
        >
          {question.prompt}
        </h3>
      </div>
      <ul className="space-y-2 px-4 py-3">
        {question.options.map((opt, i) => {
          const isSelected = selected === i;
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
                className="w-full rounded-md border px-3.5 py-2 text-left text-[13.5px] leading-6 transition-colors"
                style={{
                  borderColor: tone?.border ?? "var(--line)",
                  background: tone?.bg ?? "var(--surface)",
                  color: "var(--text)",
                  cursor: "pointer",
                }}
              >
                {opt.label}
              </button>
              {isSelected && tone && (
                <div
                  className="mt-1.5 rounded-md border-l-[3px] px-3.5 py-2 text-[13px] leading-6"
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
