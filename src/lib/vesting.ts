/**
 * Vesting math. Pure functions that derive a schedule and current
 * status from a Grant. Algorithm follows spec/04-BUSINESS-LOGIC.md.
 */

import type { Grant } from "@/lib/state/PortalContext";

export type VestEvent = {
  date: Date;
  increment: number;
  cumulative: number;
  isCliff: boolean;
};

export type VestStatus = {
  vestedNow: number;
  unvested: number;
  pctVested: number;
  nextEvent?: VestEvent;
  cliffEvent?: VestEvent;
  finalEvent?: VestEvent;
  events: VestEvent[];
  totalMonths: number;
};

function addMonths(start: Date, months: number): Date {
  const d = new Date(start);
  const targetMonthIndex = d.getMonth() + months;
  const intendedMonth = ((targetMonthIndex % 12) + 12) % 12;
  d.setMonth(targetMonthIndex);
  // setMonth rolls over (Jan 31 + 1mo lands in March). Clamp to the
  // last day of the intended month so monthly vest dates stay aligned.
  if (d.getMonth() !== intendedMonth) {
    d.setDate(0);
  }
  return d;
}

export function buildSchedule(grant: Grant): VestEvent[] {
  const totalMonths = grant.vestYears * 12 + grant.vestMonths;
  const start = parseISODate(grant.vestStartDate);
  const events: VestEvent[] = [];

  if (totalMonths === 0) {
    events.push({
      date: start,
      increment: grant.shares,
      cumulative: grant.shares,
      isCliff: false,
    });
    return events;
  }

  const sharesPerMonth = grant.shares / totalMonths;
  let vestedSoFar = 0;
  const cliff = Math.min(Math.max(0, grant.cliffMonths), totalMonths);

  if (cliff > 0) {
    const cliffShares = Math.round(sharesPerMonth * cliff);
    vestedSoFar = cliffShares;
    events.push({
      date: addMonths(start, cliff),
      increment: cliffShares,
      cumulative: cliffShares,
      isCliff: true,
    });
    for (let m = cliff + 1; m <= totalMonths; m++) {
      const inc =
        m === totalMonths
          ? grant.shares - vestedSoFar
          : Math.round(sharesPerMonth);
      vestedSoFar = Math.min(vestedSoFar + inc, grant.shares);
      events.push({
        date: addMonths(start, m),
        increment: inc,
        cumulative: vestedSoFar,
        isCliff: false,
      });
    }
  } else {
    for (let m = 1; m <= totalMonths; m++) {
      const inc =
        m === totalMonths
          ? grant.shares - vestedSoFar
          : Math.round(sharesPerMonth);
      vestedSoFar = Math.min(vestedSoFar + inc, grant.shares);
      events.push({
        date: addMonths(start, m),
        increment: inc,
        cumulative: vestedSoFar,
        isCliff: false,
      });
    }
  }

  return events;
}

export function deriveStatus(grant: Grant, now: Date = new Date()): VestStatus {
  const events = buildSchedule(grant);
  const totalMonths = grant.vestYears * 12 + grant.vestMonths;
  // Compare on date-only so a vest event "today" counts as vested
  // regardless of clock time. Without this, a noon-stamped event lags
  // a morning user.
  const today = startOfDay(now).getTime();
  const past = events.filter((e) => startOfDay(e.date).getTime() <= today);
  const future = events.filter((e) => startOfDay(e.date).getTime() > today);
  const vestedNow = past.length > 0 ? past[past.length - 1].cumulative : 0;
  const unvested = grant.shares - vestedNow;
  const pctVested = grant.shares > 0
    ? Math.round((vestedNow / grant.shares) * 100)
    : 0;
  return {
    vestedNow,
    unvested,
    pctVested,
    nextEvent: future[0],
    cliffEvent: events.find((e) => e.isCliff),
    finalEvent: events[events.length - 1],
    events,
    totalMonths,
  };
}

/**
 * Display optimization: every 3rd event plus the cliff event. Avoids
 * 36+ rows for a long monthly schedule. Always include the final event
 * so the table doesn't end early.
 */
export function condenseEvents(events: VestEvent[]): VestEvent[] {
  if (events.length <= 6) return events;
  const out: VestEvent[] = [];
  events.forEach((e, i) => {
    if (e.isCliff || i % 3 === 0 || i === events.length - 1) {
      out.push(e);
    }
  });
  return out;
}

export function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function parseISODate(s: string): Date {
  // Use local-noon to avoid timezone-edge issues with date-only strings.
  const [y, m, day] = s.split("-").map((n) => Number(n));
  return new Date(y, (m || 1) - 1, day || 1, 12, 0, 0, 0);
}

function startOfDay(d: Date): Date {
  const out = new Date(d);
  out.setHours(0, 0, 0, 0);
  return out;
}

export function todayISO(): string {
  return formatDate(new Date());
}
