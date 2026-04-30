/**
 * Tax and equity-outcome math. Pure functions only — no React, no
 * state, no I/O. Calculators import from here so the formulas can be
 * unit-tested table-style.
 *
 * Conventions:
 * - Rates (ordinaryRate, ltcgRate) are PERCENTAGES, e.g. 35 means 35%.
 * - All gain calculations floor at zero so a sale below cost basis is
 *   reported as no positive tax. Capital losses are out of scope for
 *   this tool.
 * - Educational only. Real returns depend on jurisdiction, filing
 *   status, AMT timing, holding rules, employer payroll mechanics, and
 *   many things that are not in this model. The unit tests document
 *   the assumptions explicitly.
 */

export type OptionInputs = {
  shares: number;
  strike: number;
  fmv: number;
  sale: number;
  ordinaryRate: number;
  ltcgRate: number;
};

export type OptionOutcome = {
  cost: number;
  spread: number;
  amtExposure: number;
  taxAtExercise: number;
  taxAtSale: number;
  net: number;
};

function pctToFraction(pct: number): number {
  return pct / 100;
}

export function spreadAtExercise(
  shares: number,
  fmv: number,
  strike: number,
): number {
  return Math.max(0, (fmv - strike) * shares);
}

/**
 * AMT EXPOSURE for an ISO exercise. This is the dollar amount that
 * gets added to the user's AMT income (the "preference item"). It is
 * NOT the AMT owed. Whether AMT triggers any actual tax depends on
 * the user's full income picture, deductions, AMT exemption, and
 * whether AMT > regular tax for the year.
 */
export function amtExposure(
  shares: number,
  fmv: number,
  strike: number,
): number {
  return spreadAtExercise(shares, fmv, strike);
}

/**
 * ISO QUALIFYING DISPOSITION: shares held > 1 year past exercise AND
 * > 2 years past grant. Entire (sale − strike) gain is long-term
 * capital gain. AMT exposure is recorded at exercise but the cash tax
 * happens only at sale at LTCG rates.
 */
export function isoQualifying(i: OptionInputs): OptionOutcome {
  const cost = i.shares * i.strike;
  const total = i.shares * i.sale;
  const spread = spreadAtExercise(i.shares, i.fmv, i.strike);
  const taxAtSale =
    Math.max(0, (i.sale - i.strike) * i.shares) * pctToFraction(i.ltcgRate);
  return {
    cost,
    spread,
    amtExposure: spread,
    taxAtExercise: 0,
    taxAtSale,
    net: total - cost - taxAtSale,
  };
}

/**
 * ISO DISQUALIFYING — SAME-DAY CASHLESS / SAME-YEAR SALE.
 * The shares were sold the same day or the same calendar year as the
 * exercise. The entire (sale − strike) gain is ordinary income (no
 * LTCG bifurcation), and AMT does NOT accrue because the disqualifying
 * sale in the same year unwinds the AMT preference.
 *
 * Use this for cashless-exercise patterns and short-window sales.
 */
export function isoDisqualifyingCashless(i: OptionInputs): OptionOutcome {
  const cost = i.shares * i.strike;
  const total = i.shares * i.sale;
  const spread = spreadAtExercise(i.shares, i.fmv, i.strike);
  const ordinaryGain = Math.max(0, (i.sale - i.strike) * i.shares);
  const ordinaryTax = ordinaryGain * pctToFraction(i.ordinaryRate);
  return {
    cost,
    spread,
    amtExposure: 0,
    taxAtExercise: ordinaryTax,
    taxAtSale: 0,
    net: total - cost - ordinaryTax,
  };
}

/**
 * ISO DISQUALIFYING — HELD AFTER EXERCISE.
 * Held more than 1 year past exercise but less than 2 years past
 * grant: the disposition is still disqualifying for ISO treatment,
 * but the share has met the long-term capital gain holding period
 * for any post-exercise appreciation. The bargain element at exercise
 * (FMV − strike) is ordinary income; the remaining gain (sale − FMV)
 * is LTCG. AMT preference unwinds back to regular tax in the year of
 * the disqualifying sale, so we report it as zero.
 *
 * If the share was held for less than 1 year past exercise but past
 * year-end (so STCG, not LTCG, would apply to the post-FMV gain), use
 * the cashless variant or model the post-FMV piece at the ordinary
 * rate manually. The library does not enumerate every holding-period
 * sub-case.
 */
export function isoDisqualifyingHeld(i: OptionInputs): OptionOutcome {
  const cost = i.shares * i.strike;
  const total = i.shares * i.sale;
  const spread = spreadAtExercise(i.shares, i.fmv, i.strike);
  // Bargain element capped at the gain actually realized (so a sale
  // below FMV doesn't manufacture ordinary income out of thin air).
  const ordinaryAtExercise =
    Math.min(
      Math.max(0, (i.sale - i.strike) * i.shares),
      Math.max(0, (i.fmv - i.strike) * i.shares),
    ) * pctToFraction(i.ordinaryRate);
  const postExerciseGain = Math.max(0, (i.sale - i.fmv) * i.shares);
  const ltcgPortion = postExerciseGain * pctToFraction(i.ltcgRate);
  return {
    cost,
    spread,
    amtExposure: 0,
    taxAtExercise: ordinaryAtExercise,
    taxAtSale: ltcgPortion,
    net: total - cost - ordinaryAtExercise - ltcgPortion,
  };
}

/**
 * NSO: exercise + sale. Spread at exercise is ordinary income. Any
 * additional gain between FMV-at-exercise and sale price is LTCG (if
 * held the qualifying period). The simplified model treats it as LTCG;
 * shorter holds would use ordinary rates.
 */
export function nsoExerciseAndSell(i: OptionInputs): OptionOutcome {
  const cost = i.shares * i.strike;
  const total = i.shares * i.sale;
  const spread = spreadAtExercise(i.shares, i.fmv, i.strike);
  const taxAtExercise = spread * pctToFraction(i.ordinaryRate);
  const additionalGain = Math.max(0, (i.sale - i.fmv) * i.shares);
  const taxAtSale = additionalGain * pctToFraction(i.ltcgRate);
  return {
    cost,
    spread,
    amtExposure: 0,
    taxAtExercise,
    taxAtSale,
    net: total - cost - taxAtExercise - taxAtSale,
  };
}

export type RsuInputs = {
  count: number;
  vestPrice: number;
  salePrice: number;
  ordinaryRate: number;
  ltcgRate: number;
};

export type RsuOutcome = {
  valueAtVest: number;
  taxWithheld: number;
  sharesDelivered: number;
  saleValue: number;
  gainAfterVest: number;
  ltcgTax: number;
  net: number;
};

/**
 * RSU vest + sell. Models the common "sell-to-cover" pattern where
 * the company withholds shares at the ordinary rate. Real employers
 * use a flat supplemental rate (typically 22% federal up to a
 * threshold, then 37%); the calculator surfaces the ordinary-rate
 * approximation as a teaching tool.
 */
export function rsuOutcome(i: RsuInputs): RsuOutcome {
  const valueAtVest = i.count * i.vestPrice;
  const taxWithheld = valueAtVest * pctToFraction(i.ordinaryRate);
  const sharesDelivered = Math.round(
    i.count * (1 - pctToFraction(i.ordinaryRate)),
  );
  const saleValue = sharesDelivered * i.salePrice;
  const gainAfterVest = Math.max(
    0,
    (i.salePrice - i.vestPrice) * sharesDelivered,
  );
  const ltcgTax = gainAfterVest * pctToFraction(i.ltcgRate);
  return {
    valueAtVest,
    taxWithheld,
    sharesDelivered,
    saleValue,
    gainAfterVest,
    ltcgTax,
    net: saleValue - ltcgTax,
  };
}

export type OfferInputs = {
  base: number;
  signing: number;
  bonus: number;
  equityType: "option" | "rsu";
  shares: number;
  strike: number;
  sale: number;
  dilutionPct: number;
  years: number;
  ordinaryRate: number;
  ltcgRate: number;
};

export type OfferOutcome = {
  cashTotal: number;
  equityGross: number;
  equityAfterDilution: number;
  pretax: number;
  afterTax: number;
};

/**
 * OfferCompare evaluation. Intentionally simplified:
 *
 * - Options assumed LTCG-eligible (qualifying-disposition shape).
 *   Cashless exercise, leaving early, or holding NSOs would all
 *   change the picture.
 * - RSUs taxed at the ordinary rate at vest. Subsequent appreciation
 *   isn't separately modeled at offer time.
 * - AMT timing for ISO offers is not in the model.
 *
 * The UI calls these out in a paragraph disclaimer below the cards.
 */
export function offerOutcome(i: OfferInputs): OfferOutcome {
  const cashTotal = i.base * i.years + i.signing + i.bonus * i.years;
  const equityGross =
    i.equityType === "rsu"
      ? i.sale * i.shares
      : Math.max(0, i.sale - i.strike) * i.shares;
  const equityAfterDilution =
    equityGross * Math.max(0, 1 - pctToFraction(i.dilutionPct));
  const cashAfterTax = cashTotal * (1 - pctToFraction(i.ordinaryRate));
  const equityAfterTax =
    i.equityType === "rsu"
      ? equityAfterDilution * (1 - pctToFraction(i.ordinaryRate))
      : equityAfterDilution * (1 - pctToFraction(i.ltcgRate));
  return {
    cashTotal,
    equityGross,
    equityAfterDilution,
    pretax: cashTotal + equityAfterDilution,
    afterTax: cashAfterTax + equityAfterTax,
  };
}

export type ScenarioInputs = {
  type: "iso" | "nso";
  shares: number;
  strike: number;
  fmv: number;
  eventPrice: number;
  ordinaryRate: number;
  ltcgRate: number;
};

export type ScenarioOutcome = {
  cash: number;
  amtExposure: number;
  taxNow: number;
  taxLater: number;
  totalTax: number;
  net: number;
};

/**
 * Scenario 1: exercise NOW, sell at the liquidity event.
 * For ISO: assumes hold qualifies for LTCG at sale. AMT exposure
 * accrues at exercise.
 * For NSO: pays ordinary on the spread now, LTCG on additional gain.
 */
export function exerciseNowSellAtEvent(i: ScenarioInputs): ScenarioOutcome {
  const spread = spreadAtExercise(i.shares, i.fmv, i.strike);
  const taxNow =
    i.type === "iso" ? 0 : spread * pctToFraction(i.ordinaryRate);
  const taxLater =
    i.type === "iso"
      ? Math.max(0, (i.eventPrice - i.strike) * i.shares) *
        pctToFraction(i.ltcgRate)
      : Math.max(0, (i.eventPrice - i.fmv) * i.shares) *
        pctToFraction(i.ltcgRate);
  const cash = i.shares * i.strike + taxNow;
  const amt = i.type === "iso" ? spread : 0;
  return {
    cash,
    amtExposure: amt,
    taxNow,
    taxLater,
    totalTax: taxNow + taxLater,
    net: i.shares * i.eventPrice - i.shares * i.strike - taxNow - taxLater,
  };
}

/**
 * Scenario 2: WAIT, cashless exercise at the event. No cash needed up
 * front. Entire gain is taxed as ordinary income at the event because
 * it's a same-day exercise/sale. No AMT.
 */
export function waitCashlessAtEvent(i: ScenarioInputs): ScenarioOutcome {
  const taxLater =
    Math.max(0, (i.eventPrice - i.strike) * i.shares) *
    pctToFraction(i.ordinaryRate);
  return {
    cash: 0,
    amtExposure: 0,
    taxNow: 0,
    taxLater,
    totalTax: taxLater,
    net: i.shares * i.eventPrice - i.shares * i.strike - taxLater,
  };
}

/**
 * Scenario 3: exercise 25% NOW (held into event for LTCG path),
 * remaining 75% cashless at the event.
 */
export function exercise25NowRestAtEvent(i: ScenarioInputs): ScenarioOutcome {
  const q = i.shares * 0.25;
  const r = i.shares * 0.75;
  const spreadQ = Math.max(0, (i.fmv - i.strike) * q);
  const taxNow =
    i.type === "iso" ? 0 : spreadQ * pctToFraction(i.ordinaryRate);
  const earlyPortionTaxAtSale =
    i.type === "iso"
      ? Math.max(0, (i.eventPrice - i.strike) * q) * pctToFraction(i.ltcgRate)
      : Math.max(0, (i.eventPrice - i.fmv) * q) * pctToFraction(i.ltcgRate);
  const latePortionTaxAtSale =
    Math.max(0, (i.eventPrice - i.strike) * r) *
    pctToFraction(i.ordinaryRate);
  const taxLater = earlyPortionTaxAtSale + latePortionTaxAtSale;
  const cash = q * i.strike + taxNow;
  const amt = i.type === "iso" ? spreadQ : 0;
  return {
    cash,
    amtExposure: amt,
    taxNow,
    taxLater,
    totalTax: taxNow + taxLater,
    net: i.shares * i.eventPrice - i.shares * i.strike - taxNow - taxLater,
  };
}

export type ScenarioRanking = {
  s1: ScenarioOutcome;
  s2: ScenarioOutcome;
  s3: ScenarioOutcome;
  // Single winner index, or null when two or more scenarios are tied
  // within $1 of each other. Mirrors OfferCompare neutral-tie behavior
  // so the UI doesn't crown a winner created by floating-point noise
  // or by genuinely equal nets.
  highest: 1 | 2 | 3 | null;
  // The set of scenario indices sharing the top net (length 1 if a
  // unique winner, 2-3 if tied).
  topScenarios: Array<1 | 2 | 3>;
  highestNet: number;
};

/**
 * Rank the three scenarios by modeled net. Ranking is BEFORE AMT
 * timing — the ScenarioCompare UI surfaces AMT exposure separately
 * and warns that the ranking does not include AMT carrying cost.
 *
 * Tie threshold is $1: any scenarios within a dollar of the highest
 * net are treated as tied. With multiple top scenarios, `highest` is
 * null and `topScenarios` lists all of them; the UI paints a neutral
 * "Tied at top" badge on each instead of crowning the first by
 * iteration order.
 */
export function rankScenarios(i: ScenarioInputs): ScenarioRanking {
  const s1 = exerciseNowSellAtEvent(i);
  const s2 = waitCashlessAtEvent(i);
  const s3 = exercise25NowRestAtEvent(i);
  const highestNet = Math.max(s1.net, s2.net, s3.net);
  const tieEpsilon = 1;
  const topScenarios: Array<1 | 2 | 3> = [];
  if (Math.abs(s1.net - highestNet) < tieEpsilon) topScenarios.push(1);
  if (Math.abs(s2.net - highestNet) < tieEpsilon) topScenarios.push(2);
  if (Math.abs(s3.net - highestNet) < tieEpsilon) topScenarios.push(3);
  const highest = topScenarios.length === 1 ? topScenarios[0] : null;
  return { s1, s2, s3, highest, topScenarios, highestNet };
}
