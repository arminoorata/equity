"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Block, LearnModule } from "@/data/modules";
import type { Step } from "@/data/module-steps";
import Callout from "@/components/learn/blocks/Callout";
import ComparisonTable from "@/components/learn/blocks/ComparisonTable";
import Paragraph from "@/components/learn/blocks/Paragraph";
import WidgetSlot from "@/components/learn/blocks/WidgetSlot";
import WorkedExample from "@/components/learn/blocks/WorkedExample";
import QuestionsToAsk from "@/components/learn/blocks/QuestionsToAsk";
import InlineQuiz from "@/components/learn/InlineQuiz";
import ModuleCompletionButton from "@/components/learn/ModuleCompletionButton";

/**
 * Step-based module experience. Replaces the old article-style
 * vertical render of every section. The user moves through one step
 * at a time:
 *
 *   heading
 *   takeaway (1-3 sentences)
 *   optional widget / table / worked-example / checklist
 *   optional inline quiz
 *   optional <details> disclosure for depth
 *   Back / Next controls
 *
 * Disclosures use native <details>/<summary> for keyboard and screen
 * reader correctness. The Maya case study uses the optional `decision`
 * field on a step to render a "what would you do?" card with a soft
 * reveal of what Maya actually did.
 */
export default function ModuleExperience({
  module: m,
  steps,
  prev,
  next,
}: {
  module: LearnModule;
  steps: Step[];
  prev: { id: string; title: string; cardTitle?: string } | null;
  next: { id: string; title: string; cardTitle?: string } | null;
}) {
  const total = steps.length;
  const [index, setIndex] = useState(0);

  const safeIndex = Math.min(Math.max(index, 0), Math.max(total - 1, 0));
  const step = steps[safeIndex];

  const goPrev = () => setIndex((i) => Math.max(0, i - 1));
  const goNext = () => setIndex((i) => Math.min(total - 1, i + 1));

  // Used to build the in-page step rail (compact dots).
  const stepIndices = useMemo(
    () => Array.from({ length: total }, (_, i) => i),
    [total],
  );

  const isLast = safeIndex === total - 1;

  return (
    <div>
      {/* Progress bar + dot rail */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <p
            className="text-[11px] font-semibold uppercase tracking-[0.18em]"
            style={{ color: "var(--text-muted)" }}
          >
            Step <span className="mono">{safeIndex + 1}</span> of{" "}
            <span className="mono">{total}</span>
          </p>
          <button
            type="button"
            onClick={() => setIndex(0)}
            className="text-[11px] uppercase tracking-[0.18em] underline-offset-4 hover:underline"
            style={{ color: "var(--text-muted)" }}
            aria-label="Restart at step 1"
          >
            Restart
          </button>
        </div>
        <div
          className="mt-3 h-1 w-full overflow-hidden rounded-full"
          style={{ background: "var(--line)" }}
          aria-hidden
        >
          <div
            className="h-full transition-[width] duration-300"
            style={{
              width: `${((safeIndex + 1) / total) * 100}%`,
              background: "var(--accent)",
            }}
          />
        </div>
        <ol
          className="mt-3 flex flex-wrap items-center"
          aria-label="Module steps"
        >
          {stepIndices.map((i) => {
            const active = i === safeIndex;
            const visited = i < safeIndex;
            return (
              <li key={i}>
                <button
                  type="button"
                  aria-current={active ? "step" : undefined}
                  aria-label={`Go to step ${i + 1}: ${steps[i].heading}`}
                  onClick={() => setIndex(i)}
                  className="inline-flex items-center justify-center bg-transparent"
                  style={{
                    width: 32,
                    height: 32,
                    padding: 0,
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  <span
                    aria-hidden
                    className="rounded-full block"
                    style={{
                      width: 22,
                      height: 6,
                      background: active
                        ? "var(--accent)"
                        : visited
                          ? "var(--accent-soft)"
                          : "var(--line)",
                    }}
                  />
                </button>
              </li>
            );
          })}
        </ol>
      </div>

      {/* The step itself */}
      <article
        key={step.id}
        className="rounded-[var(--radius-card)] border p-6 md:p-8"
        style={{
          borderColor: "var(--line)",
          background: "var(--surface)",
        }}
      >
        <h2
          className="text-xl font-semibold leading-snug md:text-2xl"
          style={{ color: "var(--text)" }}
        >
          {step.heading}
        </h2>
        {step.takeaway && (
          <p
            className="mt-3 text-[15.5px] leading-7"
            style={{ color: "var(--text-secondary)" }}
          >
            {step.takeaway}
          </p>
        )}

        {step.blocks && step.blocks.length > 0 && (
          <div className="mt-5 space-y-4">
            {step.blocks.map((block, i) => (
              <BlockView key={i} block={block} />
            ))}
          </div>
        )}

        {step.checklist && (
          <ChecklistCard
            title={step.checklist.title}
            items={step.checklist.items}
          />
        )}

        {step.decision && (
          <DecisionCard
            prompt={step.decision.prompt}
            options={step.decision.options}
            revealHeading={step.decision.revealHeading}
            revealBlocks={step.decision.revealBlocks}
          />
        )}

        {step.inlineQuiz && (
          <div className="mt-5">
            <InlineQuiz question={step.inlineQuiz} />
          </div>
        )}

        {step.details && step.details.length > 0 && (
          <details
            className="mt-5 rounded-md border"
            style={{
              borderColor: "var(--line)",
              background: "var(--surface-alt)",
            }}
          >
            <summary
              className="cursor-pointer list-none rounded-md px-4 py-2.5 text-[12.5px] font-semibold uppercase tracking-[0.18em] outline-none"
              style={{ color: "var(--accent)" }}
            >
              <span aria-hidden style={{ marginRight: 8 }}>
                ＋
              </span>
              {step.detailsLabel ?? "Show details"}
            </summary>
            <div className="space-y-4 px-4 pb-5 pt-1">
              {step.details.map((block, i) => (
                <BlockView key={i} block={block} />
              ))}
            </div>
          </details>
        )}
      </article>

      {/* Step controls */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={goPrev}
          disabled={safeIndex === 0}
          className="btn"
          style={{ opacity: safeIndex === 0 ? 0.45 : 1 }}
          aria-label="Previous step"
        >
          ← Back
        </button>
        {!isLast && (
          <button
            type="button"
            onClick={goNext}
            className="btn btn-primary"
            aria-label="Next step"
          >
            Next →
          </button>
        )}
        {isLast && (
          <ModuleCompletionButton moduleId={m.id} />
        )}
        <Link
          href="/"
          className="ml-auto text-[12px] underline-offset-4 hover:underline"
          style={{ color: "var(--text-muted)" }}
        >
          ← All modules
        </Link>
      </div>

      {/* Closing rail (last step only): questions-to-ask, prev/next module */}
      {isLast && (
        <div className="mt-10 space-y-6">
          <QuestionsToAsk questions={m.questions} />
          {(prev || next) && (
            <div className="flex flex-wrap items-center gap-3">
              {prev && (
                <Link href={`/learn/${prev.id}`} className="btn">
                  ← {prev.cardTitle ?? prev.title}
                </Link>
              )}
              {next && (
                <Link href={`/learn/${next.id}`} className="btn">
                  {next.cardTitle ?? next.title} →
                </Link>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
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

function ChecklistCard({
  title,
  items,
}: {
  title?: string;
  items: string[];
}) {
  return (
    <section
      className="mt-5 rounded-md border p-4 md:p-5"
      style={{
        borderColor: "var(--line)",
        background: "var(--surface-alt)",
      }}
      aria-label={title ?? "Checklist"}
    >
      {title && (
        <p
          className="text-[10px] font-semibold uppercase tracking-[0.18em]"
          style={{ color: "var(--accent)" }}
        >
          {title}
        </p>
      )}
      <ul className={`${title ? "mt-3" : ""} space-y-2`}>
        {items.map((it, i) => (
          <li key={i} className="flex items-start gap-3">
            <span
              aria-hidden
              className="mt-[6px] inline-block flex-shrink-0 rounded-sm"
              style={{
                width: 8,
                height: 8,
                background: "var(--accent)",
              }}
            />
            <span
              className="text-[14.5px] leading-7"
              style={{ color: "var(--text)" }}
            >
              {it}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function DecisionCard({
  prompt,
  options,
  revealHeading,
  revealBlocks,
}: {
  prompt: string;
  options: { label: string; mayaChose?: boolean }[];
  revealHeading: string;
  revealBlocks: Block[];
}) {
  const [revealed, setRevealed] = useState(false);

  return (
    <section
      className="mt-5 rounded-md border"
      style={{
        borderColor: revealed ? "var(--accent-soft)" : "var(--line)",
        background: "var(--surface-alt)",
      }}
      aria-label="Decision point"
    >
      <header
        className="border-b px-5 py-3"
        style={{ borderColor: "var(--line)" }}
      >
        <p
          className="text-[10px] font-semibold uppercase tracking-[0.18em]"
          style={{ color: "var(--accent)" }}
        >
          What would you do?
        </p>
        <p
          className="mt-1 text-[14.5px] leading-6"
          style={{ color: "var(--text)" }}
        >
          {prompt}
        </p>
      </header>
      <ul className="space-y-2 px-5 py-4">
        {options.map((opt, i) => (
          <li key={i}>
            <button
              type="button"
              onClick={() => setRevealed(true)}
              className="w-full rounded-md border px-3.5 py-2 text-left text-[13.5px] leading-6 transition-colors"
              style={{
                borderColor: revealed && opt.mayaChose
                  ? "var(--accent)"
                  : "var(--line)",
                background:
                  revealed && opt.mayaChose
                    ? "var(--accent-soft)"
                    : "var(--surface)",
                color: "var(--text)",
                cursor: "pointer",
              }}
            >
              {opt.label}
              {revealed && opt.mayaChose && (
                <span
                  className="ml-2 text-[10.5px] font-semibold uppercase tracking-[0.16em]"
                  style={{ color: "var(--accent)" }}
                >
                  Maya&apos;s move
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>
      {revealed && (
        <div
          className="border-t px-5 py-4"
          style={{ borderColor: "var(--line)" }}
        >
          <p
            className="text-[10px] font-semibold uppercase tracking-[0.18em]"
            style={{ color: "var(--accent)" }}
          >
            Reveal
          </p>
          <h4
            className="mt-1 text-[15px] font-semibold leading-6"
            style={{ color: "var(--text)" }}
          >
            {revealHeading}
          </h4>
          <div className="mt-3 space-y-4">
            {revealBlocks.map((block, i) => (
              <BlockView key={i} block={block} />
            ))}
          </div>
        </div>
      )}
      {!revealed && (
        <div
          className="border-t px-5 py-2.5"
          style={{ borderColor: "var(--line)" }}
        >
          <p
            className="text-[11.5px]"
            style={{ color: "var(--text-muted)" }}
          >
            No right answer. Pick one to see what Maya actually did, and
            why.
          </p>
        </div>
      )}
    </section>
  );
}
