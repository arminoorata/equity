/**
 * Comparison table for module content. Used for ISO vs NSO and RSU vs
 * options sections. Caption is optional; first column is treated as a
 * row label (semibold, slightly different color) so the table reads
 * left-to-right as "attribute → value".
 */
export default function ComparisonTable({
  caption,
  headers,
  rows,
}: {
  caption?: string;
  headers: string[];
  rows: string[][];
}) {
  return (
    <div
      className="overflow-hidden rounded-md border"
      style={{ borderColor: "var(--line)" }}
    >
      <table className="w-full text-left text-[14px]">
        {caption && (
          <caption
            className="px-4 pt-3 text-[11px] uppercase tracking-[0.18em]"
            style={{ color: "var(--text-muted)" }}
          >
            {caption}
          </caption>
        )}
        <thead style={{ background: "var(--surface-alt)" }}>
          <tr>
            {headers.map((h, i) => (
              <th
                key={i}
                scope="col"
                className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.12em]"
                style={{ color: "var(--text-secondary)" }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              style={{
                borderTop: i === 0 ? undefined : "1px solid var(--line)",
              }}
            >
              {row.map((cell, j) =>
                j === 0 ? (
                  <th
                    key={j}
                    scope="row"
                    className="px-4 py-3 align-top leading-6 text-left"
                    style={{
                      color: "var(--text)",
                      fontWeight: 600,
                    }}
                  >
                    {cell}
                  </th>
                ) : (
                  <td
                    key={j}
                    className="px-4 py-3 align-top leading-6"
                    style={{
                      color: "var(--text-secondary)",
                      fontWeight: 400,
                    }}
                  >
                    {cell}
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
