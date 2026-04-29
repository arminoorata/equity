"use client";

/**
 * Expandable FAQ bank shown on the Ask empty state. Click any item
 * to send it as the first message. Verbatim from
 * spec/05-CONTENT.md FAQ bank table, grouped by category.
 */
const FAQ: Array<{ category: string; question: string }> = [
  { category: "Vesting", question: "What's the difference between grant date and vesting start date?" },
  { category: "Vesting", question: "What does a cliff actually mean for me?" },
  { category: "Options", question: "What's the difference between ISOs and NSOs?" },
  { category: "Options", question: "How do I exercise vested options?" },
  { category: "RSUs", question: "How does double trigger work for RSUs at private companies?" },
  { category: "RSUs", question: "Why do RSUs withhold shares for taxes?" },
  { category: "Tax", question: "What is AMT and when does it kick in?" },
  { category: "Tax", question: "What's a qualifying disposition for ISOs?" },
  { category: "Tax", question: "What is QSBS and could it apply to me?" },
  { category: "Tax", question: "What's an 83(b) election?" },
  { category: "Leaving", question: "What happens to my equity if I leave my company?" },
  { category: "Leaving", question: "Can I exercise after I leave?" },
  { category: "Liquidity", question: "When can I sell shares at a private company?" },
  { category: "Liquidity", question: "What's a tender offer?" },
  { category: "Liquidity", question: "What's an IPO lock-up period?" },
  { category: "Process", question: "Where can I find my plan document?" },
  { category: "Process", question: "What's a 409A valuation?" },
];

export default function FaqBank({
  onPick,
}: {
  onPick: (text: string) => void;
}) {
  const groups = FAQ.reduce<Record<string, string[]>>((acc, item) => {
    (acc[item.category] ||= []).push(item.question);
    return acc;
  }, {});

  return (
    <details
      className="rounded-md border"
      style={{ borderColor: "var(--line)", background: "var(--surface)" }}
    >
      <summary
        className="cursor-pointer px-4 py-3 text-sm font-medium"
        style={{ color: "var(--text)" }}
      >
        FAQ bank
        <span
          className="ml-2 text-[11px] font-normal uppercase tracking-[0.18em]"
          style={{ color: "var(--text-muted)" }}
        >
          17 questions, click to ask
        </span>
      </summary>
      <div className="space-y-5 px-4 pb-4">
        {Object.entries(groups).map(([cat, qs]) => (
          <div key={cat}>
            <p
              className="text-[11px] font-semibold uppercase tracking-[0.18em]"
              style={{ color: "var(--accent)" }}
            >
              {cat}
            </p>
            <ul className="mt-2 space-y-1.5">
              {qs.map((q) => (
                <li key={q}>
                  <button
                    type="button"
                    onClick={() => onPick(q)}
                    className="text-left text-sm underline-offset-4 hover:underline"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {q}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </details>
  );
}
