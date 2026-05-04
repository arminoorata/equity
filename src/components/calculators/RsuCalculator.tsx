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
        <CalcNumber
          label="RSU count"
          value={count}
          onChange={setCount}
          step={10}
          info="The number of restricted stock units in this grant. RSUs become real shares only when they vest."
        />
        <CalcNumber
          label="Price per share at vest"
          value={vp}
          onChange={setVp}
          step={1}
          prefix="$"
          width="200px"
          info="The per-share price of the stock on the day your RSUs vest. For public companies, that's the trading price that day. For private companies, it's the most recent 409A valuation. Your employer reports this number on the vest event; the IRS uses it to calculate the ordinary income tax owed on the vest."
        />
        <CalcNumber
          label="Sale price"
          value={sp}
          onChange={setSp}
          step={1}
          prefix="$"
          info="What you sell each share for, after vest. For public companies, your real-world or expected sale price. For private companies before liquidity, your best guess at the future sale price (tender, secondary, IPO, or acquisition)."
        />
        <CalcNumber
          label="Tax rate"
          value={tax}
          onChange={setTax}
          step={1}
          suffix="%"
          max={100}
          hint="ordinary income rate"
          info="Your marginal ordinary income tax rate (federal + state combined). RSUs vest as ordinary income, so this drives the withholding at vest. A typical full-time US employee in a high-tax state lands around 35-45%."
        />
        <CalcNumber
          label="LTCG rate"
          value={ltcg}
          onChange={setLtcg}
          step={1}
          suffix="%"
          max={100}
          hint="long-term cap. gains"
          info="Your long-term capital gains rate. Applies if you hold the shares more than one year past vest before selling. Federal LTCG is 0%, 15%, or 20% depending on income; some states add their own rate."
        />
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
          <ResultRow label="Value at vest" value={fmt(outcome.valueAtVest)} hint="count × price per share at vest" />
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
