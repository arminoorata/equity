"use client";

import { useState } from "react";
import WidgetFrame from "./WidgetFrame";
import NumberInput from "./NumberInput";
import WidgetResult from "./WidgetResult";

/**
 * AMT spread mini-calculator. Inputs: shares, strike, FMV. Output:
 * spread (= AMT exposure) and exercise cost. Doesn't try to compute
 * actual AMT owed — that depends on the user's full tax picture.
 */
export default function AmtSpreadWidget() {
  const [shares, setShares] = useState(1000);
  const [strike, setStrike] = useState(2);
  const [fmv, setFmv] = useState(10);

  const cost = Math.max(0, shares) * Math.max(0, strike);
  const spread = Math.max(0, shares) * Math.max(0, fmv - strike);

  return (
    <WidgetFrame
      title="ISO spread + exercise cost"
      caption="The spread is your AMT exposure. Whether AMT actually triggers depends on your full tax picture."
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
      </div>

      <div className="mt-5 space-y-0">
        <WidgetResult
          label="Cash to exercise"
          value={`$${cost.toLocaleString()}`}
          tone="muted"
          hint="shares × strike"
        />
        <WidgetResult
          label="AMT exposure (the spread)"
          value={`$${spread.toLocaleString()}`}
          tone="warning"
          hint="(FMV − strike) × shares"
        />
      </div>
    </WidgetFrame>
  );
}
