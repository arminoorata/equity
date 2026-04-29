"use client";

import { useMemo, useState } from "react";
import { CalcNumber, ResultRow, fmt } from "./CalcInput";
import type { Profile } from "@/lib/state/PortalContext";

/**
 * "What it's actually worth" view. Models how an option grant's value
 * shifts under three scenarios that most education tools skip:
 *
 *   1. Up round at the target valuation (typical tech-press headline).
 *   2. Flat round (or sideways exit at today's valuation).
 *   3. Liquidation preference event (acquisition where preferred gets
 *      paid first).
 *
 * Inputs: company valuation today, target valuation, total shares
 * outstanding, your shares + strike, future dilution percent, total
 * preference stack.
 *
 * Math intentionally simple. The point is to show that the headline
 * number depends on assumptions investors make routinely and
 * employees rarely do.
 */
export default function DilutionScenarios({ profile }: { profile: Profile }) {
  const firstOption = profile.grants.find(
    (g) => g.type === "iso" || g.type === "nso",
  );

  const [valuationToday, setValuationToday] = useState(1_000_000_000);
  const [targetValuation, setTargetValuation] = useState(5_000_000_000);
  const [sharesOutstanding, setSharesOutstanding] = useState(100_000_000);
  const [shares, setShares] = useState(() => firstOption?.shares ?? 10_000);
  const [strike, setStrike] = useState(() => firstOption?.strike ?? 2);
  const [futureDilution, setFutureDilution] = useState(20);
  const [preferenceStack, setPreferenceStack] = useState(300_000_000);

  const result = useMemo(() => {
    const ownership = shares / Math.max(1, sharesOutstanding);
    const dilFactor = Math.max(0, 1 - futureDilution / 100);

    const grossUp = targetValuation * ownership;
    const upRoundCommon = grossUp * dilFactor;
    const upRoundNet = Math.max(0, upRoundCommon - shares * strike);

    const flatCommon = valuationToday * ownership * dilFactor;
    const flatNet = Math.max(0, flatCommon - shares * strike);

    // Liquidation preference: at sale price, preferred gets up to its stack
    // before common sees a dollar. Common's pool is max(0, valuation - stack).
    const preferenceCase = Math.max(0, valuationToday - preferenceStack);
    const prefCommon = preferenceCase * ownership * dilFactor;
    const prefNet = Math.max(0, prefCommon - shares * strike);

    const headlineFmv = ownership * valuationToday;
    const headlineUp = ownership * targetValuation;

    return {
      ownership,
      headlineFmv,
      headlineUp,
      upRoundNet,
      flatNet,
      prefNet,
    };
  }, [
    valuationToday,
    targetValuation,
    sharesOutstanding,
    shares,
    strike,
    futureDilution,
    preferenceStack,
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4">
        <CalcNumber
          label="Valuation today"
          value={valuationToday}
          onChange={setValuationToday}
          step={50_000_000}
          prefix="$"
          width="220px"
          hint="from your last 409A or round"
        />
        <CalcNumber
          label="Target valuation"
          value={targetValuation}
          onChange={setTargetValuation}
          step={50_000_000}
          prefix="$"
          width="220px"
          hint="what an exit might look like"
        />
        <CalcNumber
          label="Shares outstanding"
          value={sharesOutstanding}
          onChange={setSharesOutstanding}
          step={1_000_000}
          width="200px"
          hint="fully diluted, all classes"
        />
      </div>

      <div className="flex flex-wrap gap-4">
        <CalcNumber label="Your shares" value={shares} onChange={setShares} step={100} />
        <CalcNumber label="Strike" value={strike} onChange={setStrike} step={0.01} prefix="$" />
        <CalcNumber
          label="Future dilution"
          value={futureDilution}
          onChange={setFutureDilution}
          step={5}
          suffix="%"
          max={90}
          width="180px"
          hint="rounds before exit"
        />
        <CalcNumber
          label="Preference stack"
          value={preferenceStack}
          onChange={setPreferenceStack}
          step={50_000_000}
          prefix="$"
          width="220px"
          hint="preferred paid before common"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div
          className="rounded-md border p-5"
          style={{ borderColor: "var(--line)", background: "var(--surface)" }}
        >
          <p
            className="text-[11px] font-medium uppercase tracking-[0.18em]"
            style={{ color: "var(--text-muted)" }}
          >
            Headline math (what people see)
          </p>
          <ResultRow
            label="Your ownership today"
            value={`${(result.ownership * 100).toFixed(3)}%`}
            hint="your shares / shares outstanding"
          />
          <ResultRow
            label="At today's valuation"
            value={fmt(result.headlineFmv)}
            tone="accent"
          />
          <ResultRow
            label="At target valuation"
            value={fmt(result.headlineUp)}
            tone="accent"
          />
        </div>

        <div
          className="rounded-md border p-5"
          style={{
            borderColor: "var(--accent-soft)",
            background: "var(--surface)",
          }}
        >
          <p
            className="text-[11px] font-medium uppercase tracking-[0.18em]"
            style={{ color: "var(--accent)" }}
          >
            What you actually walk with
          </p>
          <ResultRow
            label="Up round (target, after dilution)"
            value={fmt(result.upRoundNet)}
            tone="good"
            hint="net of strike + dilution"
          />
          <ResultRow
            label="Flat round / sideways exit"
            value={fmt(result.flatNet)}
            tone="warning"
            hint="today's valuation, after dilution"
          />
          <ResultRow
            label="Sale at today's valuation, preferred paid first"
            value={fmt(result.prefNet)}
            tone="danger"
            hint="common after the preference stack"
          />
        </div>
      </div>

      <p
        className="text-xs leading-6"
        style={{ color: "var(--text-muted)" }}
      >
        Three numbers, same grant. The first is what gets written in
        Slack DMs. The second and third are what actually shows up.
        Liquidation preferences sit in the term sheet you have not seen.
        Ask before you sign.
      </p>
    </div>
  );
}
