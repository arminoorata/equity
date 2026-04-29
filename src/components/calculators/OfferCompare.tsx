"use client";

import { useMemo, useState } from "react";
import { CalcNumber, ResultRow, fmt } from "./CalcInput";

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

  const winnerNet = Math.max(a.afterTax, b.afterTax);

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
        <CalcNumber label="LTCG rate" value={ltcg} onChange={setLtcg} step={1} suffix="%" max={100} />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <OfferCard
          state={offerA}
          onChange={setOfferA}
          result={a}
          isWinner={a.afterTax === winnerNet}
        />
        <OfferCard
          state={offerB}
          onChange={setOfferB}
          result={b}
          isWinner={b.afterTax === winnerNet}
        />
      </div>

      <p
        className="text-xs leading-6"
        style={{ color: "var(--text-muted)" }}
      >
        Equity is the wildcard. The expected sale price below is your
        guess, not the company&rsquo;s commitment. The dilution slider
        approximates future raises shrinking your slice. Treat this as a
        sanity check, not the answer.
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

type Result = {
  cashTotal: number;
  equityGross: number;
  equityAfterDilution: number;
  pretax: number;
  afterTax: number;
};

function evaluate(
  o: OfferState,
  taxRate: number,
  ltcgRate: number,
  years: number,
): Result {
  const cashTotal = o.base * years + o.signing + o.bonus * years;
  const equityGross =
    o.equityType === "rsu"
      ? o.sale * o.shares
      : Math.max(0, o.sale - o.strike) * o.shares;
  const equityAfterDilution = equityGross * Math.max(0, 1 - o.dilutionPct / 100);
  const cashAfterTax = cashTotal * (1 - taxRate / 100);
  const equityAfterTax =
    o.equityType === "rsu"
      ? // RSUs: full FMV at vest is ordinary income. Subsequent
        // appreciation past vest only matters if shares are held, and
        // a 4-year horizon at offer time is too rough to model that
        // here. Treat as fully ordinary so the comparison doesn't
        // overstate after-tax value.
        equityAfterDilution * (1 - taxRate / 100)
      : // Options: assume LTCG-eligible (qualified-disposition shape).
        equityAfterDilution * (1 - ltcgRate / 100);
  const pretax = cashTotal + equityAfterDilution;
  const afterTax = cashAfterTax + equityAfterTax;
  return { cashTotal, equityGross, equityAfterDilution, pretax, afterTax };
}

function OfferCard({
  state,
  onChange,
  result,
  isWinner,
}: {
  state: OfferState;
  onChange: (next: OfferState) => void;
  result: Result;
  isWinner: boolean;
}) {
  const update = <K extends keyof OfferState>(key: K, v: OfferState[K]) =>
    onChange({ ...state, [key]: v });

  return (
    <div
      className="rounded-md border p-5"
      style={{
        borderColor: isWinner ? "var(--accent)" : "var(--line)",
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
        {isWinner && (
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
            style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
          >
            Highest net
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
        <ResultRow label="After-tax estimate" value={fmt(result.afterTax)} tone="good" />
      </div>
    </div>
  );
}
