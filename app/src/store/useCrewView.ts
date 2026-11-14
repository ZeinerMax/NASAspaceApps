// Derived data per crew member: merged history (seed + user) and evaluated timeline.
import { useMemo } from 'react';
import type { CrewId, DailyEntry, HazardId, RegionId, RuleResult, Status } from '../types';
import { SEED_ENTRIES, SEED_RADIATION } from '../data/seed';
import { crewById } from '../data/crew';
import { evaluateEntry } from '../engine/evaluate';
import { hazardStatuses, overallStatus, regionStatuses } from '../engine/aggregate';
import { evaluateShip } from '../engine/ship';
import { useAppStore } from './useAppStore';

export interface DayView {
  entry: DailyEntry;
  results: RuleResult[];
  regions: Record<RegionId, Status>;
  overall: Status;
}

export function buildHistory(crewId: CrewId, userEntries: DailyEntry[]): DailyEntry[] {
  return [...SEED_ENTRIES.filter((e) => e.crewId === crewId), ...userEntries.filter((e) => e.crewId === crewId)].sort(
    (a, b) => a.flightDay - b.flightDay,
  );
}

export function buildTimeline(crewId: CrewId, userEntries: DailyEntry[]): DayView[] {
  const history = buildHistory(crewId, userEntries);
  const crew = crewById(crewId);
  return history.map((entry) => {
    const results = evaluateEntry(entry, history, crew);
    return { entry, results, regions: regionStatuses(results, entry), overall: overallStatus(results) };
  });
}

export function useTimeline(crewId: CrewId): DayView[] {
  const userEntries = useAppStore((s) => s.userEntries);
  return useMemo(() => buildTimeline(crewId, userEntries), [crewId, userEntries]);
}

/** The day being viewed (viewDay or latest). */
export function useDayView(crewId: CrewId): { timeline: DayView[]; day: DayView } {
  const timeline = useTimeline(crewId);
  const viewDay = useAppStore((s) => s.viewDay);
  const day = (viewDay != null && timeline.find((d) => d.entry.flightDay === viewDay)) || timeline[timeline.length - 1];
  return { timeline, day };
}

/** Latest radiation day for a flight day (ship-wide data, may be empty). */
export const radiationFor = (flightDay: number) =>
  [...SEED_RADIATION].reverse().find((r) => r.flightDay <= flightDay) ?? null;

export function useShipResults(flightDay: number): RuleResult[] {
  const ship = useAppStore((s) => s.ship);
  return useMemo(() => evaluateShip(ship, radiationFor(flightDay)), [ship, flightDay]);
}

export function useHazards(day: DayView, ship: RuleResult[]): Record<HazardId, Status> {
  return useMemo(() => hazardStatuses([...day.results, ...ship]), [day, ship]);
}
