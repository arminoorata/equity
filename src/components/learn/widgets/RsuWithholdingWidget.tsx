"use client";

import { useState } from "react";
import WidgetFrame from "./WidgetFrame";
import NumberInput from "./NumberInput";
import WidgetResult from "./WidgetResult";

/**
 * RSU withholding visualizer. Inputs: count, vest price, withholding
 * rate. Outputs: gross income, tax withheld (~ shares sold × vest
 * price), shares sold to cover tax, shares delivered to the user.
 *
 * Includes a simple horizontal stacked-bar visualization showing how
 * the vested shares split between "kept" and "sold for taxes."
 */
export default function RsuWithholdingWidget() {
  const [count, setCount] = useState(100);
  const [vestPrice, setVestPrice] = useState(50);
  const [taxRate, setTaxRate] = useState(35);

  const safeCount = Math.max(0, count);
  const safePrice = Math.max(0, vestPrice);
  const safeRate = Math.min(Math.max(0, taxRate), 100);

  const grossIncome = safeCount * safePrice;
  const taxWithheld = grossIncome * (safeRate / 100);
  const sharesKept = Math.round(safeCount * (1 - safeRate / 100));
  const sharesSold = safeCount - sharesKept;
  const keptPct = safeCount === 0 ? 0 : (sharesKept / safeCount) * 100;

  return (
    <WidgetFrame
      title="RSU withholding"
      caption="At settlement, the company sells some of your vested shares to cover the tax bill. You keep what's left."
    >
      <div className="flex flex-wrap gap-4">
        <NumberInput
          label="RSUs vesting"
          value={count}
          onChange={setCount}
          min={0}
          step={10}
          width="140px"
        />
        <NumberInput
          label="Price per share at vest"
          value={vestPrice}
          onChange={setVestPrice}
          min={0}
          step={1}
          prefix="$"
          width="180px"
        />
        <NumberInput
          label="Withholding rate"
          value={taxRate}
          onChange={setTaxRate}
          min={0}
          max={100}
          step={1}
          suffix="%"
          width="140px"
        />
      </div>

      <div
        className="mt-5 overflow-hidden rounded-md border"
        style={{ borderColor: "var(--line)" }}
        aria-label={`Of ${safeCount} RSUs, you keep ${sharesKept} after withholding`}
        role="img"
      >
        <div className="flex h-7 w-full">
          <div
            className="flex items-center justify-center text-[11px] font-semibold"
            style={{
              width: `${keptPct}%`,
              background: "var(--green-bg)",
              color: "var(--green)",
              minWidth: keptPct > 0 ? 24 : 0,
            }}
          >
            {keptPct > 16 && <span className="mono">{sharesKept} kept</span>}
          </div>
          <div
            className="flex items-center justify-center text-[11px] font-semibold"
            style={{
              width: `${100 - keptPct}%`,
              background: "var(--amber-bg)",
              color: "var(--amber)",
            }}
          >
            {100 - keptPct > 16 && (
              <span className="mono">{sharesSold} sold for tax</span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-0">
        <WidgetResult
          label="Gross income at settlement"
          value={`$${grossIncome.toLocaleString()}`}
          tone="warning"
          hint="count × price per share at vest"
        />
        <WidgetResult
          label="Tax withheld (approx.)"
          value={`$${Math.round(taxWithheld).toLocaleString()}`}
          tone="warning"
        />
        <WidgetResult
          label="Shares delivered to you"
          value={sharesKept.toLocaleString()}
          tone="accent"
        />
      </div>
    </WidgetFrame>
  );
}
