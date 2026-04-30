"use client";

import { useMemo, useState } from "react";
import { CalcNumber, ResultRow, fmt } from "./CalcInput";
import { offerOutcome, type OfferOutcome } from "@/lib/tax";

/**
 * Offer comparison. Side-by-side 4-year expected take-home for two
 * competing offers. Inputs per side: base salary, signing bonus, target
 * bonus, equity type (option / RSU / mix), shares, strike (option),
 * current FMV, expected sale price, dilution, tax assumptions.
 *
 * This is intentionally rough. The point is to give recruits something
 * better than back-of-envelope. Outputs are framed as expected pre-tax
 * 4-year total comp and an after-tax estimate. The math:
 *
 *   pretax = (base * 4) + signing + (bonus * 4) + equityValue
 *   equityValue (option) = max(0, sale - strike) * shares
 *   equityValue (rsu)    = sale * shares
 *
 * Dilution applies as a flat haircut: equityValue *= (1 - dilution).
 */
export default function OfferCompare() {
  const [offerA, setOfferA] = useState<OfferState>(initialOffer("Offer A"));
  const [offerB, setOfferB] = useState<OfferState>(initialOffer("Offer B"));
  const [tax, setTax] = useState(35);
  const [ltcg, setLtcg] = useState(15);
  const [years, setYears] = useState(4);

  const a = useMemo(() => evaluate(offerA, tax, ltcg, years), [offerA, tax, ltcg, years]);
  const b = useMemo(() => evaluate(offerB, tax, ltcg, years), [offerB, tax, ltcg, years]);

  // Tie handling: if the two scenarios are within $1 of each other,
  // show a neutral "Tied" badge on both rather than crowning a winner
  // by floating-point noise. Otherwise the strictly greater scenario
  // gets the higher-in-this-model badge.
  const tied = Math.abs(a.afterTax - b.afterTax) < 1;
  const aHigher = !tied && a.afterTax > b.afterTax;
  const bHigher = !tied && b.afterTax > a.afterTax;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4">
        <CalcNumber
          label="Years to compare"
          value={years}
          onChange={setYears}
          min={1}
          max={10}
          step={1}
        />
        <CalcNumber label="Tax rate" value={tax} onChange={setTax} step={1} suffix="%" max={100} />
        <CalcNumber label="LTCG rate" value={ltcg} onChange={setLtcg} step={1} suffix="%" max={100} hint="long-term cap. gains" />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <OfferCard
          state={offerA}
          onChange={setOfferA}
          result={a}
          badge={aHigher ? "higher" : tied ? "tied" : "none"}
        />
        <OfferCard
          state={offerB}
          onChange={setOfferB}
          result={b}
          badge={bHigher ? "higher" : tied ? "tied" : "none"}
        />
      </div>

      <p
        className="text-xs leading-6"
        style={{ color: "var(--text-muted)" }}
      >
        Rough scenario estimate, not a verdict. The expected sale price
        is your guess, not the company&rsquo;s commitment. Options are
        modeled as long-term-capital-gains-eligible, which only applies
        to ISOs that meet the qualifying-disposition holding rules.
        Cashless exercise, leaving early before vest, holding NSOs, AMT
        on ISO exercises, and the difference between RSU vest year and
        sale year all change the picture and are not in the model. Use
        this to sanity-check tradeoffs, not to pick an offer.
      </p>
    </div>
  );
}

type OfferState = {
  name: string;
  base: number;
  signing: number;
  bonus: number;
  equityType: "option" | "rsu";
  shares: number;
  strike: number;
  sale: number;
  dilutionPct: number;
};

function initialOffer(name: string): OfferState {
  return {
    name,
    base: 180000,
    signing: 20000,
    bonus: 25000,
    equityType: "option",
    shares: 20000,
    strike: 5,
    sale: 25,
    dilutionPct: 20,
  };
}

function evaluate(
  o: OfferState,
  taxRate: number,
  ltcgRate: number,
  years: number,
): OfferOutcome {
  return offerOutcome({
    base: o.base,
    signing: o.signing,
    bonus: o.bonus,
    equityType: o.equityType,
    shares: o.shares,
    strike: o.strike,
    sale: o.sale,
    dilutionPct: o.dilutionPct,
    years,
    ordinaryRate: taxRate,
    ltcgRate,
  });
}

function OfferCard({
  state,
  onChange,
  result,
  badge,
}: {
  state: OfferState;
  onChange: (next: OfferState) => void;
  result: OfferOutcome;
  badge: "higher" | "tied" | "none";
}) {
  const update = <K extends keyof OfferState>(key: K, v: OfferState[K]) =>
    onChange({ ...state, [key]: v });

  const borderColor =
    badge === "higher"
      ? "var(--accent)"
      : badge === "tied"
        ? "var(--amber)"
        : "var(--line)";

  return (
    <div
      className="rounded-md border p-5"
      style={{
        borderColor,
        background: "var(--surface)",
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <input
          type="text"
          value={state.name}
          onChange={(e) => update("name", e.target.value)}
          className="bg-transparent text-base font-medium"
          style={{ color: "var(--text)" }}
        />
        {badge === "higher" && (
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider whitespace-nowrap"
            style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
          >
            Higher in this simplified model
          </span>
        )}
        {badge === "tied" && (
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider whitespace-nowrap"
            style={{ background: "var(--surface-alt)", color: "var(--amber)" }}
          >
            Tied in this model
          </span>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <CalcNumber label="Base salary" value={state.base} onChange={(n) => update("base", n)} step={1000} prefix="$" />
        <CalcNumber label="Signing bonus" value={state.signing} onChange={(n) => update("signing", n)} step={1000} prefix="$" />
        <CalcNumber label="Target bonus / yr" value={state.bonus} onChange={(n) => update("bonus", n)} step={1000} prefix="$" />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <span
          className="text-[11px] font-medium uppercase tracking-[0.18em]"
          style={{ color: "var(--text-muted)" }}
        >
          Equity type
        </span>
        <div
          className="inline-flex gap-1 rounded-full border p-1"
          style={{ borderColor: "var(--line)", background: "var(--bg)" }}
        >
          {(["option", "rsu"] as const).map((t) => {
            const active = state.equityType === t;
            return (
              <button
                key={t}
                type="button"
                onClick={() => update("equityType", t)}
                className="rounded-full px-3 py-1 text-xs uppercase tracking-wider"
                style={{
                  background: active ? "var(--accent-soft)" : "transparent",
                  color: active ? "var(--text)" : "var(--text-muted)",
                  fontWeight: active ? 600 : 500,
                }}
              >
                {t === "option" ? "Options" : "RSUs"}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-3">
        <CalcNumber label="Shares" value={state.shares} onChange={(n) => update("shares", n)} step={100} />
        {state.equityType === "option" && (
          <CalcNumber label="Strike" value={state.strike} onChange={(n) => update("strike", n)} step={0.01} prefix="$" />
        )}
        <CalcNumber label="Expected sale price" value={state.sale} onChange={(n) => update("sale", n)} step={1} prefix="$" width="180px" />
        <CalcNumber
          label="Dilution"
          value={state.dilutionPct}
          onChange={(n) => update("dilutionPct", n)}
          step={5}
          suffix="%"
          max={90}
          hint="future rounds shrinking your slice"
          width="180px"
        />
      </div>

      <div className="mt-5">
        <ResultRow label="Cash over period" value={fmt(result.cashTotal)} hint={`base × yrs + signing + bonus × yrs`} />
        <ResultRow label="Equity (gross)" value={fmt(result.equityGross)} />
        <ResultRow
          label="Equity after dilution"
          value={fmt(result.equityAfterDilution)}
          tone="warning"
          hint={`${state.dilutionPct}% haircut`}
        />
        <ResultRow label="Pre-tax total" value={fmt(result.pretax)} />
        <ResultRow
          label="After-tax (rough estimate)"
          value={fmt(result.afterTax)}
          tone="good"
          hint="options assumed LTCG-eligible; RSUs ordinary at vest"
        />
      </div>
    </div>
  );
}
