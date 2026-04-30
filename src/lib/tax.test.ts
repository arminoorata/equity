import { describe, expect, it } from "vitest";
import {
  amtExposure,
  exerciseNowSellAtEvent,
  exercise25NowRestAtEvent,
  isoDisqualifyingCashless,
  isoDisqualifyingHeld,
  isoQualifying,
  nsoExerciseAndSell,
  offerOutcome,
  rankScenarios,
  rsuOutcome,
  spreadAtExercise,
  waitCashlessAtEvent,
} from "./tax";

const close = (a: number, b: number, eps = 0.005) => Math.abs(a - b) < eps;

describe("spreadAtExercise", () => {
  it("returns 0 when FMV is at or below strike (underwater)", () => {
    expect(spreadAtExercise(100, 5, 5)).toBe(0);
    expect(spreadAtExercise(100, 4, 5)).toBe(0);
  });

  it("returns (FMV - strike) * shares when in the money", () => {
    expect(spreadAtExercise(1000, 10, 2)).toBe(8000);
  });
});

describe("amtExposure", () => {
  it("matches the spread for ISO exercises", () => {
    expect(amtExposure(1000, 10, 2)).toBe(8000);
  });

  it("is zero for underwater grants", () => {
    expect(amtExposure(1000, 1, 2)).toBe(0);
  });

  it("is exposure, not owed: documents the difference", () => {
    // The "owed" amount depends on the user's full tax picture, AMT
    // exemption, deductions, and whether AMT > regular tax for the
    // year. The library only models exposure (the preference item).
    // This test exists to lock that contract: the function returns the
    // bare spread, never a tentative-tax estimate.
    const exposure = amtExposure(1000, 50, 5);
    expect(exposure).toBe(45000);
    // If somebody ever changes amtExposure to apply a 26% / 28%
    // bracket, this assertion will fail and force a redesign.
    expect(exposure).not.toBeCloseTo(45000 * 0.26, 0);
  });
});

describe("isoQualifying — table-driven", () => {
  type Row = {
    name: string;
    shares: number;
    strike: number;
    fmv: number;
    sale: number;
    ordinaryRate: number;
    ltcgRate: number;
    expectCost: number;
    expectSpread: number;
    expectAmtExposure: number;
    expectTaxAtSale: number;
    expectNet: number;
  };
  const rows: Row[] = [
    {
      name: "in-the-money sale, classic example",
      shares: 1000,
      strike: 2,
      fmv: 10,
      sale: 50,
      ordinaryRate: 35,
      ltcgRate: 15,
      expectCost: 2000,
      expectSpread: 8000,
      expectAmtExposure: 8000,
      expectTaxAtSale: (50 - 2) * 1000 * 0.15,
      expectNet: 50 * 1000 - 2 * 1000 - (50 - 2) * 1000 * 0.15,
    },
    {
      name: "underwater grant: no spread, no AMT, no tax",
      shares: 500,
      strike: 10,
      fmv: 8,
      sale: 7,
      ordinaryRate: 35,
      ltcgRate: 15,
      expectCost: 5000,
      expectSpread: 0,
      expectAmtExposure: 0,
      expectTaxAtSale: 0,
      expectNet: 7 * 500 - 10 * 500,
    },
    {
      name: "FMV above strike but sale below strike: still no positive tax",
      shares: 500,
      strike: 5,
      fmv: 8,
      sale: 4,
      ordinaryRate: 35,
      ltcgRate: 15,
      expectCost: 2500,
      expectSpread: 1500,
      expectAmtExposure: 1500,
      expectTaxAtSale: 0,
      expectNet: 4 * 500 - 5 * 500,
    },
  ];
  rows.forEach((r) => {
    it(r.name, () => {
      const out = isoQualifying({
        shares: r.shares,
        strike: r.strike,
        fmv: r.fmv,
        sale: r.sale,
        ordinaryRate: r.ordinaryRate,
        ltcgRate: r.ltcgRate,
      });
      expect(out.cost).toBe(r.expectCost);
      expect(out.spread).toBe(r.expectSpread);
      expect(out.amtExposure).toBe(r.expectAmtExposure);
      expect(close(out.taxAtSale, r.expectTaxAtSale)).toBe(true);
      expect(out.taxAtExercise).toBe(0);
      expect(close(out.net, r.expectNet)).toBe(true);
    });
  });
});

describe("isoDisqualifyingCashless — same-day / same-year sale", () => {
  it("entire (sale - strike) is ordinary; no LTCG bifurcation; AMT clears", () => {
    const out = isoDisqualifyingCashless({
      shares: 1000,
      strike: 2,
      fmv: 10,
      sale: 50,
      ordinaryRate: 35,
      ltcgRate: 15,
    });
    expect(out.amtExposure).toBe(0);
    expect(close(out.taxAtExercise, (50 - 2) * 1000 * 0.35)).toBe(true);
    expect(out.taxAtSale).toBe(0);
    const expectedNet = 50 * 1000 - 2 * 1000 - (50 - 2) * 1000 * 0.35;
    expect(close(out.net, expectedNet)).toBe(true);
  });

  it("ltcgRate has no effect on cashless: doubling it changes nothing", () => {
    const inputs = {
      shares: 1000,
      strike: 2,
      fmv: 10,
      sale: 50,
      ordinaryRate: 35,
      ltcgRate: 15,
    };
    const a = isoDisqualifyingCashless(inputs);
    const b = isoDisqualifyingCashless({ ...inputs, ltcgRate: 30 });
    expect(a.net).toBe(b.net);
    expect(a.taxAtSale).toBe(b.taxAtSale);
  });

  it("sale below strike: zero tax", () => {
    const out = isoDisqualifyingCashless({
      shares: 1000,
      strike: 5,
      fmv: 4,
      sale: 3,
      ordinaryRate: 35,
      ltcgRate: 15,
    });
    expect(out.taxAtExercise).toBe(0);
    expect(out.taxAtSale).toBe(0);
  });
});

describe("isoDisqualifyingHeld — held >1yr past exercise, <2yr past grant", () => {
  it("bargain element ordinary, post-FMV gain LTCG, AMT clears", () => {
    const out = isoDisqualifyingHeld({
      shares: 1000,
      strike: 2,
      fmv: 10,
      sale: 50,
      ordinaryRate: 35,
      ltcgRate: 15,
    });
    expect(out.amtExposure).toBe(0);
    expect(close(out.taxAtExercise, (10 - 2) * 1000 * 0.35)).toBe(true);
    expect(close(out.taxAtSale, (50 - 10) * 1000 * 0.15)).toBe(true);
    const expectedNet =
      50 * 1000 - 2 * 1000 - (10 - 2) * 1000 * 0.35 - (50 - 10) * 1000 * 0.15;
    expect(close(out.net, expectedNet)).toBe(true);
  });

  it("sale below FMV: bargain element capped at gain, no LTCG", () => {
    const out = isoDisqualifyingHeld({
      shares: 1000,
      strike: 2,
      fmv: 10,
      sale: 6,
      ordinaryRate: 35,
      ltcgRate: 15,
    });
    expect(out.amtExposure).toBe(0);
    expect(close(out.taxAtExercise, (6 - 2) * 1000 * 0.35)).toBe(true);
    expect(out.taxAtSale).toBe(0);
  });

  it("held variant beats cashless variant when sale exceeds FMV (LTCG advantage)", () => {
    const inputs = {
      shares: 1000,
      strike: 2,
      fmv: 10,
      sale: 50,
      ordinaryRate: 35,
      ltcgRate: 15,
    };
    const cashless = isoDisqualifyingCashless(inputs);
    const held = isoDisqualifyingHeld(inputs);
    // Held path uses LTCG on the post-FMV gain, cashless uses ordinary.
    expect(held.net).toBeGreaterThan(cashless.net);
  });
});

describe("nsoExerciseAndSell", () => {
  it("classic in-the-money: ordinary at exercise, LTCG on additional gain", () => {
    const out = nsoExerciseAndSell({
      shares: 1000,
      strike: 2,
      fmv: 10,
      sale: 50,
      ordinaryRate: 35,
      ltcgRate: 15,
    });
    expect(out.amtExposure).toBe(0);
    expect(close(out.taxAtExercise, (10 - 2) * 1000 * 0.35)).toBe(true);
    expect(close(out.taxAtSale, (50 - 10) * 1000 * 0.15)).toBe(true);
    const expectedNet =
      50 * 1000 - 2 * 1000 - (10 - 2) * 1000 * 0.35 - (50 - 10) * 1000 * 0.15;
    expect(close(out.net, expectedNet)).toBe(true);
  });

  it("sale below FMV: only ordinary tax fires", () => {
    const out = nsoExerciseAndSell({
      shares: 1000,
      strike: 2,
      fmv: 10,
      sale: 8,
      ordinaryRate: 35,
      ltcgRate: 15,
    });
    expect(close(out.taxAtExercise, (10 - 2) * 1000 * 0.35)).toBe(true);
    expect(out.taxAtSale).toBe(0);
  });
});

describe("rsuOutcome — withholding and share delivery", () => {
  it("withholds at the ordinary rate and rounds delivered shares", () => {
    const out = rsuOutcome({
      count: 100,
      vestPrice: 50,
      salePrice: 60,
      ordinaryRate: 35,
      ltcgRate: 15,
    });
    expect(out.valueAtVest).toBe(5000);
    expect(close(out.taxWithheld, 1750)).toBe(true);
    // 100 * (1 - 0.35) = 65 shares delivered (already integer)
    expect(out.sharesDelivered).toBe(65);
    expect(out.saleValue).toBe(65 * 60);
  });

  it("rounds half-share withhold to nearest integer", () => {
    // 333 RSUs at 50% withhold = 166.5 → rounds to 167 shares delivered
    const out = rsuOutcome({
      count: 333,
      vestPrice: 50,
      salePrice: 60,
      ordinaryRate: 50,
      ltcgRate: 15,
    });
    expect(out.sharesDelivered).toBe(167);
  });

  it("LTCG fires only on post-vest appreciation, never on vest value", () => {
    const flat = rsuOutcome({
      count: 100,
      vestPrice: 50,
      salePrice: 50,
      ordinaryRate: 35,
      ltcgRate: 15,
    });
    expect(flat.gainAfterVest).toBe(0);
    expect(flat.ltcgTax).toBe(0);

    const up = rsuOutcome({
      count: 100,
      vestPrice: 50,
      salePrice: 80,
      ordinaryRate: 35,
      ltcgRate: 15,
    });
    expect(up.gainAfterVest).toBeGreaterThan(0);
    expect(up.ltcgTax).toBeGreaterThan(0);
  });

  it("loss after vest: gainAfterVest is zero, no negative LTCG", () => {
    const out = rsuOutcome({
      count: 100,
      vestPrice: 50,
      salePrice: 30,
      ordinaryRate: 35,
      ltcgRate: 15,
    });
    expect(out.gainAfterVest).toBe(0);
    expect(out.ltcgTax).toBe(0);
  });
});

describe("offerOutcome — assumptions made explicit", () => {
  it("RSU equity is FMV-of-shares times sale price (no strike subtraction)", () => {
    const out = offerOutcome({
      base: 100000,
      signing: 0,
      bonus: 0,
      equityType: "rsu",
      shares: 1000,
      strike: 0,
      sale: 25,
      dilutionPct: 0,
      years: 4,
      ordinaryRate: 35,
      ltcgRate: 15,
    });
    expect(out.equityGross).toBe(25000);
  });

  it("Option equity is (sale - strike) * shares, floored at zero", () => {
    const above = offerOutcome({
      base: 100000,
      signing: 0,
      bonus: 0,
      equityType: "option",
      shares: 1000,
      strike: 5,
      sale: 25,
      dilutionPct: 0,
      years: 4,
      ordinaryRate: 35,
      ltcgRate: 15,
    });
    expect(above.equityGross).toBe(20000);

    const underwater = offerOutcome({
      base: 100000,
      signing: 0,
      bonus: 0,
      equityType: "option",
      shares: 1000,
      strike: 25,
      sale: 5,
      dilutionPct: 0,
      years: 4,
      ordinaryRate: 35,
      ltcgRate: 15,
    });
    expect(underwater.equityGross).toBe(0);
  });

  it("Dilution is a flat haircut on equity (clamped at 0)", () => {
    const out = offerOutcome({
      base: 0,
      signing: 0,
      bonus: 0,
      equityType: "rsu",
      shares: 1000,
      strike: 0,
      sale: 100,
      dilutionPct: 25,
      years: 1,
      ordinaryRate: 35,
      ltcgRate: 15,
    });
    expect(out.equityAfterDilution).toBe(75000);
  });

  it("Cash totals = base * years + signing + bonus * years", () => {
    const out = offerOutcome({
      base: 100000,
      signing: 20000,
      bonus: 10000,
      equityType: "rsu",
      shares: 0,
      strike: 0,
      sale: 0,
      dilutionPct: 0,
      years: 4,
      ordinaryRate: 35,
      ltcgRate: 15,
    });
    expect(out.cashTotal).toBe(100000 * 4 + 20000 + 10000 * 4);
  });

  it("Options are taxed at LTCG, RSUs at ordinary (the documented assumption)", () => {
    const opt = offerOutcome({
      base: 0,
      signing: 0,
      bonus: 0,
      equityType: "option",
      shares: 1000,
      strike: 0,
      sale: 100,
      dilutionPct: 0,
      years: 1,
      ordinaryRate: 35,
      ltcgRate: 15,
    });
    const rsu = offerOutcome({
      base: 0,
      signing: 0,
      bonus: 0,
      equityType: "rsu",
      shares: 1000,
      strike: 0,
      sale: 100,
      dilutionPct: 0,
      years: 1,
      ordinaryRate: 35,
      ltcgRate: 15,
    });
    // Same gross equity, different tax. Option after-tax > RSU after-tax
    // because LTCG rate is lower in the inputs above.
    expect(opt.equityGross).toBe(rsu.equityGross);
    expect(opt.afterTax).toBeGreaterThan(rsu.afterTax);
  });
});

describe("ScenarioCompare ranking", () => {
  // Inputs picked so each scenario has a distinguishable net.
  const isoBase = {
    type: "iso" as const,
    shares: 1000,
    strike: 2,
    fmv: 10,
    eventPrice: 50,
    ordinaryRate: 35,
    ltcgRate: 15,
  };

  it("ISO scenario 1 carries AMT exposure equal to spread", () => {
    const s1 = exerciseNowSellAtEvent(isoBase);
    expect(s1.amtExposure).toBe(8000);
  });

  it("ISO scenario 2 has no AMT (didn't exercise) and no cash up front", () => {
    const s2 = waitCashlessAtEvent(isoBase);
    expect(s2.amtExposure).toBe(0);
    expect(s2.cash).toBe(0);
  });

  it("Scenario 3 cash is 25% of strike for ISO and (strike + ordinary tax on 25% spread) for NSO", () => {
    const isoS3 = exercise25NowRestAtEvent(isoBase);
    expect(isoS3.cash).toBe(0.25 * 1000 * 2);

    const nsoS3 = exercise25NowRestAtEvent({ ...isoBase, type: "nso" });
    const expectedNsoCash =
      0.25 * 1000 * 2 + 0.25 * 1000 * (10 - 2) * 0.35;
    expect(close(nsoS3.cash, expectedNsoCash)).toBe(true);
  });

  it("Ranking: ISO with high LTCG advantage favors scenario 1 over cashless", () => {
    const r = rankScenarios(isoBase);
    // s1 (LTCG entire gain) should beat s2 (ordinary entire gain)
    expect(r.s1.net).toBeGreaterThan(r.s2.net);
    expect(r.highest).toBe(1);
  });

  it("Ranking: when LTCG ≥ ordinary, cashless ties or wins (no LTCG benefit)", () => {
    const flat = rankScenarios({ ...isoBase, ordinaryRate: 15, ltcgRate: 15 });
    // Equal rates erase the LTCG advantage; s1 and s2 net should match.
    expect(close(flat.s1.net, flat.s2.net)).toBe(true);
  });

  it("Three-way tie: highest is null and all three are listed as top", () => {
    // Construct a case where all three nets are equal: ordinary == LTCG
    // and FMV == strike removes both the spread and the post-exercise
    // gain from the picture.
    const flat = rankScenarios({
      type: "iso",
      shares: 1000,
      strike: 5,
      fmv: 5,
      eventPrice: 20,
      ordinaryRate: 20,
      ltcgRate: 20,
    });
    expect(close(flat.s1.net, flat.s2.net)).toBe(true);
    expect(close(flat.s2.net, flat.s3.net)).toBe(true);
    expect(flat.highest).toBeNull();
    expect(flat.topScenarios).toEqual([1, 2, 3]);
  });

  it("Two-way tie: highest is null and the two tied scenarios are listed", () => {
    // ordinaryRate === ltcgRate makes scenarios 1 and 2 net the same
    // for ISO, while scenario 3 differs because of the 25/75 split.
    // Pick numbers so s3.net actually diverges by more than $1.
    const flat = rankScenarios({
      type: "iso",
      shares: 1000,
      strike: 2,
      fmv: 50,
      eventPrice: 50,
      ordinaryRate: 20,
      ltcgRate: 20,
    });
    // Sanity: s1 and s2 should be tied.
    expect(close(flat.s1.net, flat.s2.net)).toBe(true);
    expect(flat.highest).toBeNull();
    expect(flat.topScenarios).toContain(1);
    expect(flat.topScenarios).toContain(2);
  });

  it("Unique winner: highest is set and topScenarios has length 1", () => {
    const r = rankScenarios({
      type: "iso",
      shares: 1000,
      strike: 2,
      fmv: 10,
      eventPrice: 50,
      ordinaryRate: 35,
      ltcgRate: 15,
    });
    expect(r.highest).not.toBeNull();
    expect(r.topScenarios).toHaveLength(1);
    expect(r.topScenarios[0]).toBe(r.highest);
  });

  it("NSO scenario 1 pays ordinary tax up front and LTCG on appreciation", () => {
    const s1 = exerciseNowSellAtEvent({ ...isoBase, type: "nso" });
    expect(s1.amtExposure).toBe(0);
    expect(close(s1.taxNow, (10 - 2) * 1000 * 0.35)).toBe(true);
    expect(close(s1.taxLater, (50 - 10) * 1000 * 0.15)).toBe(true);
  });

  it("Scenario nets all reduce to (sale - strike) * shares - taxes", () => {
    const r = rankScenarios(isoBase);
    const grossGain = (50 - 2) * 1000;
    expect(close(r.s1.net, grossGain - r.s1.totalTax)).toBe(true);
    expect(close(r.s2.net, grossGain - r.s2.totalTax)).toBe(true);
    expect(close(r.s3.net, grossGain - r.s3.totalTax)).toBe(true);
  });
});
