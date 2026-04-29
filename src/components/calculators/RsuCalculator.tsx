"use client";

import { useState } from "react";
import { CalcNumber, ResultRow, fmt } from "./CalcInput";
import type { Profile } from "@/lib/state/PortalContext";

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

  const vestValue = count * vp;
  const taxAtVest = vestValue * (tax / 100);
  const sharesReceived = Math.round(count * (1 - tax / 100));
  const saleValue = sharesReceived * sp;
  const gainAfterVest = Math.max(0, (sp - vp) * sharesReceived);
  const ltcgTax = gainAfterVest * (ltcg / 100);
  const net = saleValue - ltcgTax;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4">
        <CalcNumber label="RSU count" value={count} onChange={setCount} step={10} />
        <CalcNumber label="Vest price" value={vp} onChange={setVp} step={1} prefix="$" />
        <CalcNumber label="Sale price" value={sp} onChange={setSp} step={1} prefix="$" />
        <CalcNumber label="Tax rate" value={tax} onChange={setTax} step={1} suffix="%" max={100} />
        <CalcNumber label="LTCG rate" value={ltcg} onChange={setLtcg} step={1} suffix="%" max={100} />
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
          Full FMV at settlement is ordinary income. The company sells
          shares to cover withholding. You keep what is left.
        </p>
        <div className="mt-4">
          <ResultRow label="Value at vest" value={fmt(vestValue)} hint="count × vest price" />
          <ResultRow label="Tax withheld" value={fmt(taxAtVest)} tone="warning" />
          <ResultRow
            label="Shares delivered to you"
            value={sharesReceived.toLocaleString()}
            tone="accent"
          />
          <ResultRow label="Sale value" value={fmt(saleValue)} />
          <ResultRow label="Gain since vest" value={fmt(gainAfterVest)} hint="(sale − vest) × shares" />
          <ResultRow label="LTCG tax (if held 1+ year)" value={fmt(ltcgTax)} />
          <ResultRow label="Net proceeds" value={fmt(net)} tone="good" />
        </div>
      </div>
    </div>
  );
}
