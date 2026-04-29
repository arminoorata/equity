"use client";

import { useState } from "react";

/**
 * Five-step decision framework. Question text and option labels follow
 * spec/04-BUSINESS-LOGIC.md. Cards are additive: multiple advice cards
 * can fire from one set of answers.
 */

type Situation = "staying" | "leaving" | "event" | "exploring";
type GrantTypeAns = "iso" | "nso" | "both" | "unsure";
type Spread = "low" | "moderate" | "high" | "underwater";
type Cash = "comfortable" | "stretch" | "difficult" | "no";
type Risk = "high_risk" | "moderate_risk" | "low_risk" | "minimal_risk";

type Answers = {
  situation?: Situation;
  type?: GrantTypeAns;
  spread?: Spread;
  cash?: Cash;
  risk?: Risk;
};

type StepDef = {
  key: keyof Answers;
  title: string;
  question: string;
  options: Array<{ id: string; label: string; icon: string }>;
};

const steps: StepDef[] = [
  {
    key: "situation",
    title: "Your situation",
    question: "Which one fits right now?",
    options: [
      { id: "staying", label: "I'm staying", icon: "🪑" },
      { id: "leaving", label: "I'm leaving (or just left)", icon: "🚪" },
      { id: "event", label: "Liquidity event coming", icon: "🚀" },
      { id: "exploring", label: "Just exploring", icon: "🔍" },
    ],
  },
  {
    key: "type",
    title: "What you have",
    question: "What kind of grants are we talking about?",
    options: [
      { id: "iso", label: "ISOs only", icon: "⭐" },
      { id: "nso", label: "NSOs only", icon: "📋" },
      { id: "both", label: "Both", icon: "🧩" },
      { id: "unsure", label: "Not sure", icon: "🤔" },
    ],
  },
  {
    key: "spread",
    title: "The spread",
    question: "How big is FMV minus your strike right now?",
    options: [
      { id: "low", label: "Low (under 2x strike)", icon: "🌱" },
      { id: "moderate", label: "Moderate (2x to 5x)", icon: "📈" },
      { id: "high", label: "High (over 5x)", icon: "🚀" },
      { id: "underwater", label: "Underwater (FMV < strike)", icon: "📉" },
    ],
  },
  {
    key: "cash",
    title: "Cash comfort",
    question: "If you exercise, how does the cost feel?",
    options: [
      { id: "comfortable", label: "Comfortable", icon: "💪" },
      { id: "stretch", label: "A stretch", icon: "🫠" },
      { id: "difficult", label: "Difficult", icon: "😬" },
      { id: "no", label: "I cannot afford it", icon: "🛑" },
    ],
  },
  {
    key: "risk",
    title: "Risk tolerance",
    question: "How would you feel if the shares were worth zero?",
    options: [
      { id: "high_risk", label: "I'd be fine", icon: "🧘" },
      { id: "moderate_risk", label: "Sting, but OK", icon: "😐" },
      { id: "low_risk", label: "Hurt", icon: "😟" },
      { id: "minimal_risk", label: "Devastated", icon: "💔" },
    ],
  },
];

export default function ExerciseFramework() {
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <Results
        answers={answers}
        onRestart={() => {
          setAnswers({});
          setStepIndex(0);
          setDone(false);
        }}
      />
    );
  }

  const step = steps[stepIndex];

  const handlePick = (id: string) => {
    const next = { ...answers, [step.key]: id } as Answers;
    setAnswers(next);
    if (stepIndex === steps.length - 1) setDone(true);
    else setStepIndex(stepIndex + 1);
  };

  return (
    <div>
      <ProgressBar current={stepIndex} total={steps.length} />
      <p
        className="mt-6 text-[11px] font-medium uppercase tracking-[0.32em]"
        style={{ color: "var(--accent)" }}
      >
        Step {stepIndex + 1} of {steps.length}
      </p>
      <h2 className="mt-2 text-2xl font-medium tracking-tight md:text-3xl">
        {step.question}
      </h2>
      <ul className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
        {step.options.map((o) => (
          <li key={o.id}>
            <button
              type="button"
              onClick={() => handlePick(o.id)}
              className="flex w-full items-center gap-3 rounded-md border px-4 py-3 text-left text-sm transition-colors"
              style={{
                borderColor: "var(--line)",
                background: "var(--surface)",
                color: "var(--text)",
              }}
            >
              <span aria-hidden className="text-lg">
                {o.icon}
              </span>
              <span>{o.label}</span>
            </button>
          </li>
        ))}
      </ul>
      {stepIndex > 0 && (
        <button
          type="button"
          onClick={() => setStepIndex(stepIndex - 1)}
          className="mt-6 text-xs underline underline-offset-4"
          style={{ color: "var(--text-muted)" }}
        >
          ← Back
        </button>
      )}
    </div>
  );
}

function ProgressBar({ current, total }: { current: number; total: number }) {
  return (
    <ol className="flex gap-1.5" aria-label="Progress">
      {Array.from({ length: total }, (_, i) => {
        const tone =
          i < current
            ? "var(--green)"
            : i === current
            ? "var(--accent)"
            : "var(--text-muted)";
        return (
          <li
            key={i}
            className="h-1.5 flex-1 rounded-full"
            style={{ background: tone, opacity: i === current ? 1 : 0.6 }}
            aria-current={i === current ? "step" : undefined}
          />
        );
      })}
    </ol>
  );
}

type Severity = "red" | "amber" | "green" | "accent";

type AdviceCard = {
  title: string;
  severity: Severity;
  body: string;
};

function buildAdvice(a: Answers): AdviceCard[] {
  const cards: AdviceCard[] = [];

  if (a.situation === "leaving") {
    cards.push({
      title: "⏰ Exercise window is on a clock",
      severity: "red",
      body: "Vested options usually expire within a fixed window after termination. The historical default is 90 days. Find your number in your plan document, mark the calendar, and decide before it lapses.",
    });
  }
  if (a.situation === "exploring") {
    cards.push({
      title: "🎉 No rush, just learn first",
      severity: "green",
      body: "If you are not under a clock, the cost of waiting is information. Read your grant letter, find the FMV, and come back when you have specific numbers to model.",
    });
  }
  if (a.situation === "event") {
    cards.push({
      title: "🚀 Liquidity timing",
      severity: "accent",
      body: "Events compress decisions. Lock-ups, blackout windows, and tax-year edges all matter. Sketch the next 12 months on a calendar before doing anything irreversible.",
    });
  }

  if (a.spread === "underwater") {
    cards.push({
      title: "📉 No reason to exercise underwater",
      severity: "amber",
      body: "If FMV is below strike, the option is not worth more than the strike. Wait. The window for action is when the spread is meaningful.",
    });
  }
  if (
    a.spread === "low" &&
    (a.cash === "comfortable" || a.cash === "stretch")
  ) {
    cards.push({
      title: "💡 Low spread, low downside",
      severity: "green",
      body: "When the spread is small, the AMT and ordinary-income hits are small too. If you can cover the cash and the holding period works for you, this is the cheapest moment to start the LTCG clock.",
    });
  }
  if (a.spread === "high") {
    cards.push({
      title: "⚠️ High tax exposure",
      severity: "red",
      body: "Big spread means big AMT (ISOs) or big ordinary-income tax (NSOs). Run the numbers in the calculators. Talk to a tax advisor before pulling the trigger on a meaningful slice.",
    });
  }

  if (a.cash === "difficult" || a.cash === "no") {
    cards.push({
      title: "💸 Affordability concern",
      severity: "amber",
      body: "Do not exercise more than you can afford to lose. The shares can go to zero and the tax does not come back. Partial exercise is a real option.",
    });
  }

  if (a.type === "iso" || a.type === "both") {
    cards.push({
      title: "⭐ ISO specifics: AMT and the 1+2 rule",
      severity: "accent",
      body: "ISOs are friendlier on the LTCG side if you hold 1+ year past exercise and 2+ years past grant. Miss either and any gain up to the exercise spread is taxed as ordinary income; gain above the spread stays capital, and a loss is a capital loss. AMT is a separate calculation that can owe even when regular tax does not.",
    });
  }

  cards.push({
    title: "📋 Action items",
    severity: "accent",
    body:
      "1. Read your plan document. It is the source of truth for your specific grant.\n" +
      "2. Find the most recent FMV from your equity team.\n" +
      "3. Talk to a qualified tax advisor before exercising.\n" +
      "4. Don't exercise more than you can afford to lose.\n" +
      "5. Mark your exercise window in your calendar.",
  });

  return cards;
}

function Results({
  answers,
  onRestart,
}: {
  answers: Answers;
  onRestart: () => void;
}) {
  const cards = buildAdvice(answers);

  return (
    <div>
      <p
        className="text-[11px] font-medium uppercase tracking-[0.32em]"
        style={{ color: "var(--accent)" }}
      >
        Your shape
      </p>
      <h2 className="mt-2 text-2xl font-medium tracking-tight md:text-3xl">
        Here is what fits.
      </h2>

      <ul className="mt-4 flex flex-wrap gap-2">
        {Object.entries(answers).map(([k, v]) => (
          <li
            key={k}
            className="rounded-full border px-3 py-1 text-xs"
            style={{
              borderColor: "var(--line)",
              color: "var(--text-muted)",
              background: "var(--surface-soft)",
            }}
          >
            <span className="uppercase tracking-wider">{k}: </span>
            <span>{v}</span>
          </li>
        ))}
      </ul>

      <div className="mt-6 space-y-4">
        {cards.map((c, i) => (
          <Card key={i} card={c} />
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onRestart}
          className="rounded-full px-4 py-2 text-sm font-medium"
          style={{
            background: "var(--accent)",
            color: "var(--bg)",
          }}
        >
          Restart
        </button>
      </div>
    </div>
  );
}

function Card({ card }: { card: AdviceCard }) {
  const colorMap = {
    red: "var(--red)",
    amber: "var(--amber)",
    green: "var(--green)",
    accent: "var(--accent)",
  } as const;
  return (
    <div
      className="rounded-md border-l-4 p-4"
      style={{
        borderColor: colorMap[card.severity],
        background: "var(--surface)",
      }}
    >
      <p className="text-sm font-medium" style={{ color: "var(--text)" }}>
        {card.title}
      </p>
      <p
        className="mt-2 whitespace-pre-line text-sm leading-6"
        style={{ color: "var(--text-secondary)" }}
      >
        {card.body}
      </p>
    </div>
  );
}
