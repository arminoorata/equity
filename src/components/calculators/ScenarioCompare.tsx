"use client";

import { useState } from "react";
import { CalcNumber, ResultRow, fmt } from "./CalcInput";
import Abbr from "@/components/ui/Abbr";
import { usePortal, type Profile } from "@/lib/state/PortalContext";

/**
 * Compare three exercise strategies for the user's first option grant:
 * exercise now, wait + cashless, exercise 25% now. Math from
 * spec/04-BUSINESS-LOGIC.md.
 *
 * Empty state when there is no option grant: link to the grant
 * builder.
 */
export default function ScenarioCompare({ profile }: { profile: Profile }) {
  const firstOption = profile.grants.find(
    (g) => g.type === "iso" || g.type === "nso",
  );
  const isPublic = profile.companyType === "public";
  const eventLabel = isPublic ? "future sale price" : "liquidity event price";

  const [shares, setShares] = useState(() => firstOption?.shares ?? 1000);
  const [strike, setStrike] = useState(() => firstOption?.strike ?? 2);
  const [type, setType] = useState<"iso" | "nso">(() =>
    firstOption?.type === "nso" ? "nso" : "iso",
  );
  const [fmv, setFmv] = useState(10);
  const [ipo, setIpo] = useState(50);
  const [tax, setTax] = useState(35);
  const [ltcg, setLtcg] = useState(15);

  if (!firstOption) {
    return <EmptyOption hasGrants={profile.grants.length > 0} />;
  }

  // Scenario 1: exercise now, sell at event. Floor LTCG and ordinary
  // tax at zero so a sale below strike registers as no tax (a capital
  // loss is a separate model that this view does not surface).
  const s1Cash =
    shares * strike +
    (type === "nso" ? Math.max(0, (fmv - strike) * shares) * (tax / 100) : 0);
  const s1TaxNow =
    type === "iso" ? 0 : Math.max(0, (fmv - strike) * shares) * (tax / 100);
  const s1TaxLater =
    type === "iso"
      ? Math.max(0, (ipo - strike) * shares) * (ltcg / 100)
      : Math.max(0, (ipo - fmv) * shares) * (ltcg / 100);
  const s1Amt = type === "iso" ? Math.max(0, (fmv - strike) * shares) : 0;
  const s1Net = shares * ipo - shares * strike - s1TaxNow - s1TaxLater;

  // Scenario 2: wait, cashless at event
  const s2Cash = 0;
  const s2TaxLater = Math.max(0, (ipo - strike) * shares) * (tax / 100);
  const s2Amt = 0;
  const s2Net = shares * ipo - shares * strike - s2TaxLater;

  // Scenario 3: exercise 25% now
  const q = shares * 0.25;
  const r = shares * 0.75;
  const s3Cash =
    q * strike +
    (type === "nso" ? Math.max(0, (fmv - strike) * q) * (tax / 100) : 0);
  const s3TaxNow =
    type === "iso" ? 0 : Math.max(0, (fmv - strike) * q) * (tax / 100);
  const s3TaxLater =
    (type === "iso"
      ? Math.max(0, (ipo - strike) * q) * (ltcg / 100)
      : Math.max(0, (ipo - fmv) * q) * (ltcg / 100)) +
    Math.max(0, (ipo - strike) * r) * (tax / 100);
  const s3Amt = type === "iso" ? Math.max(0, (fmv - strike) * q) : 0;
  const s3Net = shares * ipo - shares * strike - s3TaxNow - s3TaxLater;

  const winnerNet = Math.max(s1Net, s2Net, s3Net);
  const anyAmt = type === "iso" && (s1Amt > 0 || s3Amt > 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4">
        <CalcNumber label="Shares" value={shares} onChange={setShares} step={100} />
        <CalcNumber label="Strike" value={strike} onChange={setStrike} step={0.01} prefix="$" />
        <CalcNumber label="FMV today" value={fmv} onChange={setFmv} step={1} prefix="$" hint="Fair Market Value" />
        <CalcNumber
          label={`Estimated ${eventLabel}`}
          value={ipo}
          onChange={setIpo}
          step={1}
          prefix="$"
          width="220px"
        />
        <CalcNumber label="Tax rate" value={tax} onChange={setTax} step={1} suffix="%" max={100} hint="ordinary income rate" />
        <CalcNumber label="LTCG rate" value={ltcg} onChange={setLtcg} step={1} suffix="%" max={100} hint="long-term cap. gains" />
      </div>

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

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ScenarioCard
          title="Exercise now, sell at event"
          desc="Pay for shares + tax now. Sell at event."
          cash={s1Cash}
          amt={s1Amt}
          totalTax={s1TaxNow + s1TaxLater}
          net={s1Net}
          isWinner={s1Net === winnerNet}
        />
        <ScenarioCard
          title="Wait, cashless at event"
          desc="No cash needed up front. All gain ordinary at event."
          cash={s2Cash}
          amt={s2Amt}
          totalTax={s2TaxLater}
          net={s2Net}
          isWinner={s2Net === winnerNet}
        />
        <ScenarioCard
          title="Exercise 25% now, rest at event"
          desc="Partial cost now. 25% gets LTCG, 75% ordinary."
          cash={s3Cash}
          amt={s3Amt}
          totalTax={s3TaxNow + s3TaxLater}
          net={s3Net}
          isWinner={s3Net === winnerNet}
        />
      </div>

      <p
        className="text-xs leading-6"
        style={{ color: "var(--text-muted)" }}
      >
        Net is modeled before AMT timing. ISO exercises can owe AMT in
        the year you exercise even when the highlighted scenario shows
        the strongest net at sale, and the AMT credit may take years to
        recover. The &ldquo;Highest modeled net&rdquo; tag compares
        scenarios on the same simplifying assumptions, not on full tax
        timing.{anyAmt
          ? " The AMT exposure rows above show the spread that gets added to AMT income for ISO scenarios; it is not a tax bill on its own."
          : ""}
      </p>
    </div>
  );
}

function ScenarioCard({
  title,
  desc,
  cash,
  amt,
  totalTax,
  net,
  isWinner,
}: {
  title: string;
  desc: string;
  cash: number;
  amt: number;
  totalTax: number;
  net: number;
  isWinner: boolean;
}) {
  return (
    <div
      className="rounded-md border p-5"
      style={{
        borderColor: isWinner ? "var(--accent)" : "var(--line)",
        background: "var(--surface)",
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-base font-medium" style={{ color: "var(--text)" }}>
          {title}
        </p>
        {isWinner && (
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
            style={{
              background: "var(--accent-soft)",
              color: "var(--accent)",
            }}
            title="Highest net under the modeled assumptions. AMT timing is not included."
          >
            Highest modeled net
          </span>
        )}
      </div>
      <p
        className="mt-1 text-xs"
        style={{ color: "var(--text-muted)" }}
      >
        {desc}
      </p>
      <div className="mt-4">
        <ResultRow label="Cash needed up front" value={fmt(cash)} tone="warning" />
        {amt > 0 && (
          <ResultRow
            label={
              <>
                <Abbr label="AMT" title="Alternative Minimum Tax">
                  A parallel US tax that ISO exercises can trigger.
                  The spread at exercise is added to AMT income.
                </Abbr>{" "}
                exposure (ISO)
              </>
            }
            value={fmt(amt)}
            tone="warning"
            hint="separate from regular tax"
          />
        )}
        <ResultRow label="Total tax" value={fmt(totalTax)} />
        <ResultRow label="Net proceeds" value={fmt(net)} tone="good" />
      </div>
    </div>
  );
}

function EmptyOption({ hasGrants }: { hasGrants: boolean }) {
  const { openBuilder } = usePortal();
  return (
    <div
      className="rounded-md border p-6"
      style={{ borderColor: "var(--line)", background: "var(--surface)" }}
    >
      <p
        className="text-[11px] font-medium uppercase tracking-[0.18em]"
        style={{ color: "var(--accent)" }}
      >
        Compare needs an option grant
      </p>
      <p
        className="mt-2 text-sm"
        style={{ color: "var(--text-secondary)" }}
      >
        {hasGrants
          ? "Your current grants are RSUs. The compare view is built around exercise strategies for ISOs or NSOs."
          : "Add an ISO or NSO grant to compare strategies."}
      </p>
      <button
        type="button"
        onClick={openBuilder}
        className="mt-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium"
        style={{ background: "var(--accent)", color: "var(--bg)" }}
      >
        {hasGrants ? "Add an option grant" : "Set up your grants"}
      </button>
    </div>
  );
}
