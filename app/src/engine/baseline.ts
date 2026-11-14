// Rolling personal baseline (PLAN.md §5, Excel Rules!B6, team decision 10):
// mean ± 2 SD of all `resting` readings in the 20 flight days BEFORE the evaluated day,
// ignoring flight days 1–6. Needs at least 7 readings, otherwise there is no baseline.
import type { Baseline, BaselineIndicator, DailyEntry } from '../types';
import { BASELINE_FIRST_FLIGHT_DAY, BASELINE_MIN_READINGS, BASELINE_WINDOW_DAYS } from '../data/crew';
import { mgDlToMmol } from './units';

export const readIndicator = (e: DailyEntry, ind: BaselineIndicator): number | null => {
  switch (ind) {
    case 'sys': return e.bp.sys;
    case 'dia': return e.bp.dia;
    case 'hr': return e.hr.bpm;
    case 'tempC': return e.tempC;
    case 'glucoseMmol': return e.glucoseMgDl == null ? null : mgDlToMmol(e.glucoseMgDl);
    case 'spo2': return e.o2.spo2Pct;
  }
};

/** `history` = all entries of ONE crew member, any order. */
export function computeBaseline(history: DailyEntry[], ind: BaselineIndicator, forFlightDay: number): Baseline | null {
  const from = Math.max(BASELINE_FIRST_FLIGHT_DAY, forFlightDay - BASELINE_WINDOW_DAYS);
  const rows = history
    .filter((e) => e.condition === 'resting' && e.flightDay >= from && e.flightDay < forFlightDay)
    .map((e) => ({ day: e.flightDay, v: readIndicator(e, ind) }))
    .filter((r): r is { day: number; v: number } => r.v != null);
  if (rows.length < BASELINE_MIN_READINGS) return null;
  const vals = rows.map((r) => r.v);
  const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
  // sample standard deviation
  const sd = Math.sqrt(vals.reduce((a, b) => a + (b - mean) ** 2, 0) / (vals.length - 1));
  return {
    crewId: history[0].crewId,
    indicator: ind,
    mean,
    sd,
    low: mean - 2 * sd,
    high: mean + 2 * sd,
    n: vals.length,
    fromFlightDay: Math.min(...rows.map((r) => r.day)),
    toFlightDay: Math.max(...rows.map((r) => r.day)),
  };
}
