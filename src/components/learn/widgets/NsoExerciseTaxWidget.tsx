"use client";

import { useState } from "react";
import WidgetFrame from "./WidgetFrame";
import NumberInput from "./NumberInput";
import WidgetResult from "./WidgetResult";

/**
 * NSO exercise-tax mini-calculator. Inputs: shares, strike, FMV,
 * ordinary income tax rate. Outputs: spread (= ordinary income), tax
 * owed at exercise, total cash needed (strike + tax).
 */
export default function NsoExerciseTaxWidget() {
  const [shares, setShares] = useState(1000);
  const [strike, setStrike] = useState(2);
  const [fmv, setFmv] = useState(10);
  const [taxRate, setTaxRate] = useState(35);

  const cost = Math.max(0, shares) * Math.max(0, strike);
  const spread = Math.max(0, shares) * Math.max(0, fmv - strike);
  const tax = spread * (Math.max(0, taxRate) / 100);
  const totalCash = cost + tax;

  return (
    <WidgetFrame
      title="NSO exercise tax"
      caption="The spread is taxed as ordinary income at exercise. Total cash needed includes strike plus the tax bill."
    >
      <div className="flex flex-wrap gap-4">
        <NumberInput
          label="Shares"
          value={shares}
          onChange={setShares}
          min={0}
          step={100}
          width="130px"
        />
        <NumberInput
          label="Strike"
          value={strike}
          onChange={setStrike}
          min={0}
          step={0.5}
          prefix="$"
          width="120px"
        />
        <NumberInput
          label="FMV"
          value={fmv}
          onChange={setFmv}
          min={0}
          step={1}
          prefix="$"
          width="120px"
        />
        <NumberInput
          label="Tax rate"
          value={taxRate}
          onChange={setTaxRate}
          min={0}
          max={60}
          step={1}
          suffix="%"
          width="120px"
        />
      </div>

      <div className="mt-5 space-y-0">
        <WidgetResult
          label="Spread (ordinary income at exercise)"
          value={`$${spread.toLocaleString()}`}
          tone="warning"
          hint="(FMV − strike) × shares"
        />
        <WidgetResult
          label="Tax at exercise"
          value={`$${Math.round(tax).toLocaleString()}`}
          tone="warning"
          hint="spread × tax rate"
        />
        <WidgetResult
          label="Total cash needed"
          value={`$${Math.round(totalCash).toLocaleString()}`}
          tone="default"
          hint="strike cost + tax"
        />
      </div>
    </WidgetFrame>
  );
}
