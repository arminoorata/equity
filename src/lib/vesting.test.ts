import { describe, expect, it } from "vitest";
import {
  buildSchedule,
  condenseEvents,
  deriveStatus,
  formatDate,
  parseISODate,
} from "./vesting";
import type { Grant } from "@/lib/state/PortalContext";

function grant(overrides: Partial<Grant> = {}): Grant {
  return {
    id: "g1",
    type: "iso",
    shares: 4800,
    strike: 1,
    date: "2024-01-15",
    vestStartDate: "2024-01-15",
    cliffMonths: 12,
    vestYears: 4,
    vestMonths: 0,
    exerciseWindowDays: 90,
    earlyExerciseAllowed: false,
    ...overrides,
  };
}

describe("buildSchedule", () => {
  it("emits a single full-vest event for zero-month total", () => {
    const events = buildSchedule(grant({ vestYears: 0, vestMonths: 0, cliffMonths: 0 }));
    expect(events).toHaveLength(1);
    expect(events[0].cumulative).toBe(4800);
    expect(events[0].increment).toBe(4800);
    expect(events[0].isCliff).toBe(false);
  });

  it("emits a cliff event at month 12 with the cliff fraction of shares", () => {
    const events = buildSchedule(grant());
    const cliff = events.find((e) => e.isCliff);
    expect(cliff).toBeDefined();
    expect(cliff!.cumulative).toBe(1200);
    expect(cliff!.increment).toBe(1200);
    expect(formatDate(cliff!.date)).toBe("2025-01-15");
  });

  it("ends exactly at the share total even when monthly rounding diverges", () => {
    const events = buildSchedule(grant({ shares: 5000, vestYears: 4, vestMonths: 0 }));
    expect(events[events.length - 1].cumulative).toBe(5000);
  });

  it("handles odd share counts that don't divide evenly", () => {
    const events = buildSchedule(grant({ shares: 4801 }));
    expect(events[events.length - 1].cumulative).toBe(4801);
    const totalIncrement = events.reduce((sum, e) => sum + e.increment, 0);
    expect(totalIncrement).toBe(4801);
  });

  it("renders monthly events when there is no cliff", () => {
    const events = buildSchedule(grant({ cliffMonths: 0 }));
    expect(events).toHaveLength(48);
    expect(events.every((e) => !e.isCliff)).toBe(true);
  });

  it("treats cliff longer than total period as the full period", () => {
    const events = buildSchedule(
      grant({ cliffMonths: 60, vestYears: 4, vestMonths: 0 }),
    );
    const last = events[events.length - 1];
    expect(last.cumulative).toBe(4800);
  });

  it("clamps January 31 + 1 month to the last day of February", () => {
    const events = buildSchedule(
      grant({
        vestStartDate: "2024-01-31",
        cliffMonths: 0,
        vestYears: 0,
        vestMonths: 2,
      }),
    );
    expect(formatDate(events[0].date)).toBe("2024-02-29");
    expect(formatDate(events[1].date)).toBe("2024-03-31");
  });
});

describe("deriveStatus", () => {
  it("reports zero vested before the cliff", () => {
    const status = deriveStatus(grant(), new Date("2024-06-01T12:00:00Z"));
    expect(status.vestedNow).toBe(0);
    expect(status.unvested).toBe(4800);
    expect(status.pctVested).toBe(0);
    expect(status.cliffEvent).toBeDefined();
    expect(status.nextEvent).toBeDefined();
  });

  it("counts the cliff as vested on the cliff date", () => {
    const status = deriveStatus(grant(), parseISODate("2025-01-15"));
    expect(status.vestedNow).toBe(1200);
    expect(status.pctVested).toBe(25);
  });

  it("reports fully vested at the final event", () => {
    const status = deriveStatus(grant(), parseISODate("2028-01-15"));
    expect(status.vestedNow).toBe(4800);
    expect(status.unvested).toBe(0);
    expect(status.pctVested).toBe(100);
    expect(status.nextEvent).toBeUndefined();
  });

  it("treats an event today as vested regardless of clock time", () => {
    const cliffMorning = new Date("2025-01-15T03:00:00Z");
    const status = deriveStatus(grant(), cliffMorning);
    expect(status.vestedNow).toBe(1200);
  });
});

describe("condenseEvents", () => {
  it("returns the input unchanged if there are six or fewer events", () => {
    const events = buildSchedule(
      grant({ cliffMonths: 0, vestYears: 0, vestMonths: 6 }),
    );
    expect(condenseEvents(events)).toEqual(events);
  });

  it("always preserves the cliff event in the condensed view", () => {
    const events = buildSchedule(grant());
    const condensed = condenseEvents(events);
    expect(condensed.some((e) => e.isCliff)).toBe(true);
    expect(condensed[condensed.length - 1].cumulative).toBe(4800);
  });
});
