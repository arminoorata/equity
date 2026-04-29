"use client";

import { useState } from "react";
import WidgetFrame from "./WidgetFrame";
import NumberInput from "./NumberInput";
import WidgetResult from "./WidgetResult";

/**
 * ISO vs NSO comparison cards. Same inputs apply to both: shares,
 * strike, FMV at exercise, sale price, ordinary tax rate, LTCG rate.
 *
 * Computes net proceeds for each scenario assuming:
 *   ISO = qualifying disposition (held 1+ year past exercise + 2+ past
 *         grant). Whole gain at LTCG. AMT exposure shown separately.
 *   NSO = ordinary income on spread at exercise; LTCG on growth above
 *         FMV-at-exercise.
 */
export default function IsoVsNsoCompareWidget() {
  const [shares, setShares] = useState(1000);
  const [strike, setStrike] = useState(2);
  const [fmv, setFmv] = useState(10);
  const [sale, setSale] = useState(50);
  const [taxRate, setTaxRate] = useState(35);
  const [ltcgRate, setLtcgRate] = useState(15);

  const n = Math.max(0, shares);
  const sp = Math.max(0, strike);
  const fm = Math.max(0, fmv);
  const sa = Math.max(0, sale);
  const tr = Math.max(0, taxRate) / 100;
  const lt = Math.max(0, ltcgRate) / 100;

  const cost = n * sp;
  const total = n * sa;
  const spread = n * Math.max(0, fm - sp);

  // ISO qualifying disposition
  const isoTaxAtSale = Math.max(0, sa - sp) * n * lt;
  const isoNet = total - cost - isoTaxAtSale;
  const isoAmtExposure = spread;

  // NSO
  const nsoTaxAtExercise = spread * tr;
  const nsoTaxAtSale = Math.max(0, sa - fm) * n * lt;
  const nsoNet = total - cost - nsoTaxAtExercise - nsoTaxAtSale;

  const isoBetter = isoNet >= nsoNet;

  return (
    <WidgetFrame
      title="ISO vs NSO outcome, same numbers"
      caption="Assumes ISO qualifying disposition (held 1+ year post-exercise and 2+ years post-grant). NSOs front-load the ordinary-income hit at exercise."
    >
      <div className="flex flex-wrap gap-4">
        <NumberInput
          label="Shares"
          value={shares}
          onChange={setShares}
          min={0}
          step={100}
          width="120px"
        />
        <NumberInput
          label="Strike"
          value={strike}
          onChange={setStrike}
          min={0}
          step={0.5}
          prefix="$"
          width="110px"
        />
        <NumberInput
          label="FMV at exercise"
          value={fmv}
          onChange={setFmv}
          min={0}
          step={1}
          prefix="$"
          width="140px"
        />
        <NumberInput
          label="Sale price"
          value={sale}
          onChange={setSale}
          min={0}
          step={1}
          prefix="$"
          width="120px"
        />
        <NumberInput
          label="Ordinary"
          value={taxRate}
          onChange={setTaxRate}
          min={0}
          max={60}
          step={1}
          suffix="%"
          width="120px"
        />
        <NumberInput
          label="LTCG"
          value={ltcgRate}
          onChange={setLtcgRate}
          min={0}
          max={40}
          step={1}
          suffix="%"
          width="110px"
        />
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <ScenarioCard
          title="ISO (qualifying disposition)"
          highlight={isoBetter}
          rows={[
            ["Cash to exercise", `$${cost.toLocaleString()}`, "muted"],
            ["AMT exposure at exercise", `$${isoAmtExposure.toLocaleString()}`, "warning"],
            ["Tax at sale (LTCG)", `$${Math.round(isoTaxAtSale).toLocaleString()}`, "warning"],
            ["Net proceeds", `$${Math.round(isoNet).toLocaleString()}`, "accent"],
          ]}
        />
        <ScenarioCard
          title="NSO"
          highlight={!isoBetter}
          rows={[
            ["Cash to exercise", `$${cost.toLocaleString()}`, "muted"],
            ["Ordinary tax at exercise", `$${Math.round(nsoTaxAtExercise).toLocaleString()}`, "warning"],
            ["LTCG on post-exercise growth", `$${Math.round(nsoTaxAtSale).toLocaleString()}`, "warning"],
            ["Net proceeds", `$${Math.round(nsoNet).toLocaleString()}`, "accent"],
          ]}
        />
      </div>
    </WidgetFrame>
  );
}

function ScenarioCard({
  title,
  highlight,
  rows,
}: {
  title: string;
  highlight: boolean;
  rows: Array<[string, string, "muted" | "warning" | "accent" | "default"]>;
}) {
  return (
    <div
      className="rounded-md border p-4"
      style={{
        borderColor: highlight ? "var(--accent)" : "var(--line)",
        background: "var(--surface)",
      }}
    >
      <div className="flex items-center justify-between">
        <h4
          className="text-[14px] font-semibold"
          style={{ color: "var(--text)" }}
        >
          {title}
        </h4>
        {highlight && (
          <span
            className="rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em]"
            style={{
              color: "var(--accent)",
              borderColor: "var(--accent-soft)",
              background: "var(--accent-soft)",
            }}
          >
            Higher net
          </span>
        )}
      </div>
      <div className="mt-3 space-y-0">
        {rows.map(([label, value, tone]) => (
          <WidgetResult key={label} label={label} value={value} tone={tone} />
        ))}
      </div>
    </div>
  );
}
