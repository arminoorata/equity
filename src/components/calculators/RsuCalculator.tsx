"use client";

import { useState } from "react";
import { CalcNumber, ResultRow, fmt } from "./CalcInput";
import Abbr from "@/components/ui/Abbr";
import type { Profile } from "@/lib/state/PortalContext";
import { rsuOutcome } from "@/lib/tax";

/**
 * RSU calculator. Math from spec/04-BUSINESS-LOGIC.md. Pre-fills from
 * the first RSU grant if one exists. Re-prefill on grant edit via
 * parent-side `key={firstRsu?.id}` remount.
 */
export default function RsuCalculator({ profile }: { profile: Profile }) {
  const firstRsu = profile.grants.find((g) => g.type === "rsu");

  const [count, setCount] = useState(() => firstRsu?.shares ?? 500);
  const [vp, setVp] = useState(40);
  const [sp, setSp] = useState(60);
  const [tax, setTax] = useState(35);
  const [ltcg, setLtcg] = useState(15);

  const outcome = rsuOutcome({
    count,
    vestPrice: vp,
    salePrice: sp,
    ordinaryRate: tax,
    ltcgRate: ltcg,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4">
        <CalcNumber label="RSU count" value={count} onChange={setCount} step={10} />
        <CalcNumber label="Vest price" value={vp} onChange={setVp} step={1} prefix="$" />
        <CalcNumber label="Sale price" value={sp} onChange={setSp} step={1} prefix="$" />
        <CalcNumber label="Tax rate" value={tax} onChange={setTax} step={1} suffix="%" max={100} hint="ordinary income rate" />
        <CalcNumber label="LTCG rate" value={ltcg} onChange={setLtcg} step={1} suffix="%" max={100} hint="long-term cap. gains" />
      </div>

      <div
        className="rounded-md border p-5"
        style={{ borderColor: "var(--line)", background: "var(--surface)" }}
      >
        <p
          className="text-[11px] font-medium uppercase tracking-[0.18em]"
          style={{ color: "var(--accent)" }}
        >
          RSU outcome
        </p>
        <p
          className="mt-1 text-xs"
          style={{ color: "var(--text-muted)" }}
        >
          Full{" "}
          <Abbr label="FMV" title="Fair Market Value">
            Per-share value. At public companies, the trading price.
            At private companies, the most recent 409A.
          </Abbr>{" "}
          at settlement is ordinary income. The company sells shares to
          cover withholding. You keep what is left.
        </p>
        <div className="mt-4">
          <ResultRow label="Value at vest" value={fmt(outcome.valueAtVest)} hint="count × vest price" />
          <ResultRow label="Tax withheld" value={fmt(outcome.taxWithheld)} tone="warning" />
          <ResultRow
            label="Shares delivered to you"
            value={outcome.sharesDelivered.toLocaleString()}
            tone="accent"
          />
          <ResultRow label="Sale value" value={fmt(outcome.saleValue)} />
          <ResultRow label="Gain since vest" value={fmt(outcome.gainAfterVest)} hint="(sale − vest) × shares" />
          <ResultRow
            label={
              <>
                <Abbr label="LTCG" title="Long-Term Capital Gains">
                  The tax rate on assets held more than one year.
                  Lower than ordinary income rates.
                </Abbr>{" "}
                tax (if held 1+ year)
              </>
            }
            value={fmt(outcome.ltcgTax)}
          />
          <ResultRow label="Net proceeds" value={fmt(outcome.net)} tone="good" />
        </div>
      </div>
    </div>
  );
}
