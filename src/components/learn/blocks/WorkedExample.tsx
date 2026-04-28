/**
 * Worked-example block. Used for the hypothetical-numbers content in
 * Modules 4 and 5 (RSU settlement, ISO exercise, etc.). Visually
 * distinct from a paragraph so the reader knows this is "math worth
 * staring at" rather than narrative prose. Numbers render in
 * JetBrains Mono so columns line up at a glance.
 */
export default function WorkedExample({
  title,
  lines,
  footnote,
}: {
  title: string;
  lines: string[];
  footnote?: string;
}) {
  return (
    <figure
      className="rounded-md border"
      style={{
        borderColor: "var(--line)",
        background: "var(--surface-alt)",
      }}
    >
      <figcaption
        className="border-b px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em]"
        style={{
          borderColor: "var(--line)",
          color: "var(--accent)",
        }}
      >
        Worked example: {title}
      </figcaption>
      <div className="px-5 py-4">
        <ul className="space-y-1.5 text-[14px] leading-7">
          {lines.map((line, i) => (
            <li key={i} className="mono" style={{ color: "var(--text)" }}>
              {line}
            </li>
          ))}
        </ul>
        {footnote && (
          <p
            className="mt-3 text-[11.5px] italic leading-6"
            style={{ color: "var(--text-muted)" }}
          >
            {footnote}
          </p>
        )}
      </div>
    </figure>
  );
}
