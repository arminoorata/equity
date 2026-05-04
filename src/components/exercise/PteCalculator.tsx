"use client";

import { useMemo, useState } from "react";
import { CalcNumber, ResultRow, fmt } from "@/components/calculators/CalcInput";
import Abbr from "@/components/ui/Abbr";
import { usePortal } from "@/lib/state/PortalContext";
import { deriveStatus } from "@/lib/vesting";

/**
 * Post-termination exercise calculator. The 90-day clock is the most
 * common reason vested options get forfeited. This view answers three
 * questions:
 *
 *   1. How much cash do I need to exercise everything I have vested?
 *   2. How much AMT exposure (ISOs) or ordinary income (NSOs) do I owe
 *      if I exercise?
 *   3. What share count do I forfeit if I do nothing before the
 *      window closes?
 *
 * Pulls the first option grant if one exists.
 */
export default function PteCalculator() {
  const { profile, openBuilder } = usePortal();
  const firstOption = profile.grants.find(
    (g) => g.type === "iso" || g.type === "nso",
  );

  const [shares, setShares] = useState(() => firstOption?.shares ?? 1000);
  const [strike, setStrike] = useState(() => firstOption?.strike ?? 2);
  const [fmv, setFmv] = useState(15);
  const [taxRate, setTaxRate] = useState(35);
  const [windowDays, setWindowDays] = useState(
    () => firstOption?.exerciseWindowDays ?? 90,
  );
  const [type, setType] = useState<"iso" | "nso">(() =>
    firstOption?.type === "nso" ? "nso" : "iso",
  );

  // Use vested-now if a grant is set up, else fall back to "all entered shares".
  const vestedNow = useMemo(() => {
    if (!firstOption) return shares;
    const status = deriveStatus(firstOption);
    return status.vestedNow;
  }, [firstOption, shares]);

  const exerciseCost = vestedNow * strike;
  const spread = Math.max(0, (fmv - strike) * vestedNow);
  const amt = type === "iso" ? spread : 0;
  const ordinaryTax = type === "nso" ? spread * (taxRate / 100) : 0;
  // For NSOs, ordinary tax is owed at exercise alongside the share
  // cost, so it's part of "cash today". For ISOs, AMT is shown as a
  // separate exposure (whether it triggers depends on the user's full
  // tax picture).
  const cashAtExercise = exerciseCost + ordinaryTax;
  const forfeitedIfNothing = vestedNow;

  return (
    <div className="space-y-6">
      <div
        className="rounded-md border-l-4 p-4 text-sm"
        style={{
          borderColor: "var(--red)",
          background: "var(--surface)",
        }}
      >
        <p className="font-medium" style={{ color: "var(--text)" }}>
          The 90-day question
        </p>
        <p
          className="mt-1 leading-6"
          style={{ color: "var(--text-secondary)" }}
        >
          When you leave a company, your vested options usually have a
          fixed window before they expire. The historical default is 90
          days. Some companies offer 5 to 10 years now. Find your
          number in your plan document, then decide whether to exercise
          or walk.
        </p>
      </div>

      {!firstOption && (
        <p
          className="text-sm"
          style={{ color: "var(--text-muted)" }}
        >
          Numbers below use what you type. To pre-fill from your real
          grant,{" "}
          <button
            type="button"
            onClick={openBuilder}
            className="underline underline-offset-4"
            style={{ color: "var(--accent)" }}
          >
            set up your grants
          </button>
          .
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <span
          className="text-[11px] font-medium uppercase tracking-[0.18em]"
          style={{ color: "var(--text-muted)" }}
        >
          Type
        </span>
        <div
          className="inline-flex gap-1 rounded-full border p-1"
          style={{ borderColor: "var(--line)", background: "var(--surface)" }}
        >
          {(["iso", "nso"] as const).map((t) => {
            const active = type === t;
            return (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className="rounded-full px-3 py-1 text-xs uppercase tracking-wider"
                style={{
                  background: active ? "var(--accent-soft)" : "transparent",
                  color: active ? "var(--text)" : "var(--text-muted)",
                  fontWeight: active ? 600 : 500,
                }}
              >
                {t}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <CalcNumber
          label="Vested options"
          value={firstOption ? vestedNow : shares}
          onChange={firstOption ? () => undefined : setShares}
          step={100}
          hint={firstOption ? "from your grant" : "edit to model"}
          width="180px"
          info="Number of options that have vested and would be exercisable today. Pre-fills from the first option grant in your profile if you've set one up."
        />
        <CalcNumber
          label="Strike"
          value={strike}
          onChange={setStrike}
          step={0.01}
          prefix="$"
          info="Per-share strike price set at grant. Cost to exercise = vested options × strike."
        />
        <CalcNumber
          label="FMV today"
          value={fmv}
          onChange={setFmv}
          step={1}
          prefix="$"
          hint="Fair Market Value"
          infoTitle="FMV today"
          info="Per-share value today. For public companies, the trading price. For private companies, the most recent 409A. The gap between FMV and strike is the spread, which drives NSO ordinary tax and ISO AMT exposure at exercise."
        />
        <CalcNumber
          label="Window"
          value={windowDays}
          onChange={setWindowDays}
          step={1}
          suffix="days"
          width="170px"
          infoTitle="Post-termination exercise window"
          info="How many days after leaving the company you have to exercise vested options before they expire. Default is 90 days; some plans extend this to 7-10 years (PTEP / extended exercise window). Check your plan document."
        />
        {type === "nso" && (
          <CalcNumber
            label="Tax rate"
            value={taxRate}
            onChange={setTaxRate}
            step={1}
            suffix="%"
            max={100}
            info="Your marginal ordinary income tax rate (federal + state combined). For NSOs, the spread at exercise is taxed at this rate immediately."
          />
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div
          className="rounded-md border p-5"
          style={{ borderColor: "var(--line)", background: "var(--surface)" }}
        >
          <p
            className="text-[11px] font-medium uppercase tracking-[0.18em]"
            style={{ color: "var(--accent)" }}
          >
            If you exercise everything
          </p>
          <ResultRow label="Exercise cost" value={fmt(exerciseCost)} tone="warning" hint="vested × strike" />
          {type === "nso" && (
            <ResultRow
              label="Tax at exercise"
              value={fmt(ordinaryTax)}
              tone="warning"
              hint="ordinary income on the spread"
            />
          )}
          <ResultRow
            label="Cash needed today"
            value={fmt(cashAtExercise)}
            tone="danger"
            hint={type === "nso" ? "cost + tax at exercise" : "share cost only"}
          />
          {type === "iso" && (
            <ResultRow
              label={
                <>
                  <Abbr label="AMT" title="Alternative Minimum Tax">
                    A parallel US tax that ISO exercises can trigger.
                    The spread at exercise is added to AMT income.
                  </Abbr>{" "}
                  exposure (separate)
                </>
              }
              value={fmt(amt)}
              tone="warning"
              hint="may be owed at tax time, depends on your full picture"
            />
          )}
        </div>

        <div
          className="rounded-md border p-5"
          style={{ borderColor: "var(--line)", background: "var(--surface)" }}
        >
          <p
            className="text-[11px] font-medium uppercase tracking-[0.18em]"
            style={{ color: "var(--red)" }}
          >
            If you do nothing before day {windowDays}
          </p>
          <ResultRow
            label="Vested options forfeited"
            value={forfeitedIfNothing.toLocaleString()}
            tone="danger"
          />
          <ResultRow
            label="Estimated paper value lost"
            value={fmt(spread)}
            tone="danger"
            hint="at today's FMV minus strike"
          />
          <p
            className="mt-3 text-xs leading-5"
            style={{ color: "var(--text-muted)" }}
          >
            This is a one-way door. After the window closes, the
            unexercised options expire and the chance to own the
            underlying shares is gone with them. Talk to a tax advisor
            before pulling the trigger on a meaningful slice.
          </p>
        </div>
      </div>

      <div
        className="rounded-md border-l-4 p-4 text-sm"
        style={{
          borderColor: "var(--accent)",
          background: "var(--surface-soft)",
        }}
      >
        <p className="font-medium" style={{ color: "var(--text)" }}>
          Things to do this week
        </p>
        <ol
          className="mt-2 list-decimal space-y-1 pl-5 leading-6"
          style={{ color: "var(--text-secondary)" }}
        >
          <li>Find your exact exercise window in the plan document.</li>
          <li>Confirm vested share count with your equity team.</li>
          <li>Decide a partial-exercise number you can fund without strain.</li>
          <li>Talk to a tax advisor before you wire money.</li>
          <li>Mark the deadline in your calendar.</li>
        </ol>
      </div>
    </div>
  );
}
