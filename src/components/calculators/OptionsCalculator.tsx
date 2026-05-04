"use client";

import { useState } from "react";
import { CalcNumber, ResultRow, fmt } from "./CalcInput";
import Abbr from "@/components/ui/Abbr";
import type { Profile } from "@/lib/state/PortalContext";
import { isoQualifying, nsoExerciseAndSell } from "@/lib/tax";

/**
 * Options calculator. Renders ISO and NSO outcomes side by side from
 * the same inputs. Math from spec/04-BUSINESS-LOGIC.md.
 *
 * If the user has at least one option grant in PortalContext, shares
 * and strike pre-fill from the first one. Re-pre-filling on grant
 * edits is handled by parent-side `key={firstOption?.id}` remount.
 */
export default function OptionsCalculator({ profile }: { profile: Profile }) {
  const firstOption = profile.grants.find(
    (g) => g.type === "iso" || g.type === "nso",
  );

  const [shares, setShares] = useState(() => firstOption?.shares ?? 1000);
  const [strike, setStrike] = useState(() => firstOption?.strike ?? 2);
  const [fmv, setFmv] = useState(10);
  const [sale, setSale] = useState(50);
  const [tax, setTax] = useState(35);
  const [ltcg, setLtcg] = useState(15);

  const inputs = {
    shares,
    strike,
    fmv,
    sale,
    ordinaryRate: tax,
    ltcgRate: ltcg,
  };
  const iso = isoQualifying(inputs);
  const nso = nsoExerciseAndSell(inputs);
  const nsoAdditional = Math.max(0, (sale - fmv) * shares);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4">
        <CalcNumber
          label="Shares"
          value={shares}
          onChange={setShares}
          step={100}
          info="The number of vested shares you'd exercise. Only count shares you've already vested unless your plan permits early exercise."
        />
        <CalcNumber
          label="Strike"
          value={strike}
          onChange={setStrike}
          step={0.01}
          prefix="$"
          info="Strike price. The fixed per-share amount you pay to exercise an option. It's set when the grant is issued and shows on your grant agreement. Cost to exercise = shares × strike."
        />
        <CalcNumber
          label="FMV"
          value={fmv}
          onChange={setFmv}
          step={1}
          prefix="$"
          hint="Fair Market Value"
          infoTitle="FMV (Fair Market Value)"
          info="Per-share value today. For public companies, the trading price. For private companies, the most recent 409A valuation. The gap between FMV and strike at the moment you exercise is the spread, which is what triggers ordinary tax on NSOs and AMT exposure on ISOs."
        />
        <CalcNumber
          label="Sale price"
          value={sale}
          onChange={setSale}
          step={1}
          prefix="$"
          info="The per-share price you'd sell at. For public companies, the trading price when you'd sell. For private companies, your best guess at a future liquidity price (tender, secondary, IPO, or acquisition)."
        />
        <CalcNumber
          label="Tax rate"
          value={tax}
          onChange={setTax}
          step={1}
          suffix="%"
          max={100}
          hint="ordinary income rate"
          info="Your marginal ordinary income tax rate (federal + state combined). Drives NSO tax at exercise and ISO tax at sale on a disqualifying disposition. A typical full-time US employee in a high-tax state lands around 35-45%."
        />
        <CalcNumber
          label="LTCG rate"
          value={ltcg}
          onChange={setLtcg}
          step={1}
          suffix="%"
          max={100}
          hint="long-term cap. gains"
          infoTitle="LTCG (Long-Term Capital Gains)"
          info="Your long-term capital gains rate. Applies if you hold the shares long enough after exercise (one year past exercise plus two years past grant for qualifying ISO treatment). Federal LTCG is 0%, 15%, or 20% depending on income; some states add their own rate."
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card title="ISO" subtitle="Qualifying disposition (held 1y past exercise + 2y past grant)">
          <ResultRow label="Exercise cost" value={fmt(iso.cost)} hint="shares × strike" />
          <ResultRow
            label="Spread at exercise"
            value={fmt(iso.spread)}
            hint={
              <>
                (
                <Abbr
                  label="FMV"
                  title="Fair Market Value"
                >
                  Per-share value. At public companies, the trading
                  price. At private companies, the most recent 409A.
                </Abbr>{" "}
                − strike) × shares
              </>
            }
          />
          <ResultRow
            label={
              <>
                <Abbr label="AMT" title="Alternative Minimum Tax">
                  A parallel US tax that ISO exercises can trigger.
                  The spread at exercise is added to AMT income.
                </Abbr>{" "}
                exposure
              </>
            }
            value={fmt(iso.amtExposure)}
            tone="warning"
            hint="separate from regular tax"
          />
          <ResultRow
            label={
              <>
                Tax at sale (
                <Abbr label="LTCG" title="Long-Term Capital Gains">
                  The tax rate on assets held more than one year.
                  Lower than ordinary income rates.
                </Abbr>
                )
              </>
            }
            value={fmt(iso.taxAtSale)}
          />
          <ResultRow label="Net proceeds" value={fmt(iso.net)} tone="good" />
        </Card>

        <Card title="NSO" subtitle="Spread is ordinary income at exercise">
          <ResultRow label="Exercise cost" value={fmt(nso.cost)} hint="shares × strike" />
          <ResultRow label="Spread at exercise" value={fmt(nso.spread)} />
          <ResultRow label="Tax at exercise" value={fmt(nso.taxAtExercise)} tone="warning" hint="ordinary income on the spread" />
          <ResultRow label="Additional gain at sale" value={fmt(nsoAdditional)} />
          <ResultRow
            label={
              <>
                Tax at sale (
                <Abbr label="LTCG" title="Long-Term Capital Gains">
                  The tax rate on assets held more than one year.
                  Lower than ordinary income rates.
                </Abbr>
                )
              </>
            }
            value={fmt(nso.taxAtSale)}
          />
          <ResultRow label="Net proceeds" value={fmt(nso.net)} tone="good" />
        </Card>
      </div>

      {firstOption?.earlyExerciseAllowed && (
        <div
          className="rounded-md border-l-4 px-4 py-3 text-sm"
          style={{
            borderColor: "var(--accent)",
            background: "var(--surface-soft)",
            color: "var(--text-secondary)",
          }}
        >
          <p className="font-medium" style={{ color: "var(--text)" }}>
            If you early-exercise
          </p>
          <p className="mt-1 leading-6">
            Spread is at today&rsquo;s FMV (likely small). 83(b) election must
            be filed within 30 days of exercise. The long-term holding clock
            starts at exercise. If you leave before the unvested shares
            vest, they get repurchased and the tax does not come back.
          </p>
        </div>
      )}
    </div>
  );
}

function Card({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-md border p-5"
      style={{ borderColor: "var(--line)", background: "var(--surface)" }}
    >
      <div>
        <p
          className="text-[11px] font-medium uppercase tracking-[0.18em]"
          style={{ color: "var(--accent)" }}
        >
          {title}
        </p>
        <p
          className="mt-1 text-xs"
          style={{ color: "var(--text-muted)" }}
        >
          {subtitle}
        </p>
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}
