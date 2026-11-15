// Rule results → region, overall and hazard status (PLAN.md §6.2, §6.4).
import type { DailyEntry, HazardId, RegionId, RuleResult, Status } from '../types';
import { REGIONS } from '../data/regions';
import { HAZARDS } from '../data/hazards';
import { symptomDef } from '../data/symptoms';

const RANK: Record<Status, number> = { info: 0, green: 1, grey: 2, orange: 3, red: 4 };

/** Worst status: red > orange > grey > green. `info` is ignored unless nothing else exists. */
export function worst(statuses: Status[]): Status {
  const s = statuses.filter((x) => x !== 'info');
  if (!s.length) return statuses.length ? 'info' : 'grey';
  return s.reduce((a, b) => (RANK[b] > RANK[a] ? b : a));
}

export const statusRank = (s: Status) => RANK[s];

/** Symptom status per region (worst symptom mapped to that region). */
export function symptomStatusByRegion(e: DailyEntry): Partial<Record<RegionId, Status>> {
  const out: Partial<Record<RegionId, Status>> = {};
  for (const code of e.symptoms) {
    const d = symptomDef(code);
    for (const r of d.regions) out[r] = worst([out[r] ?? 'green', d.level]);
  }
  return out;
}

export function regionStatuses(results: RuleResult[], e: DailyEntry): Record<RegionId, Status> {
  const byId = new Map(results.map((r) => [r.ruleId, r]));
  const sym = symptomStatusByRegion(e);
  const out = {} as Record<RegionId, Status>;
  for (const reg of REGIONS) {
    const st = reg.ruleIds.map((id) => byId.get(id)?.status ?? 'grey');
    if (sym[reg.id]) st.push(sym[reg.id]!);
    out[reg.id] = worst(st);
  }
  return out;
}

/** Overall crew status = worst of all rated crew rules (info and cross rules excluded). */
export function overallStatus(results: RuleResult[]): Status {
  return worst(results.filter((r) => r.ruleId.startsWith('CH-')).map((r) => r.status));
}

export function hazardStatuses(results: Pick<RuleResult, 'ruleId' | 'status'>[]): Record<HazardId, Status> {
  const byId = new Map(results.map((r) => [r.ruleId, r]));
  const out = {} as Record<HazardId, Status>;
  for (const h of HAZARDS) {
    const statuses = h.ruleIds.map((id) => byId.get(id)?.status ?? 'grey');
    // An unreported solar-event measurement must not mask known mission-dose status as "No data".
    const assessable = h.id === 'radiation' ? statuses.filter((status) => status !== 'grey' && status !== 'info') : statuses;
    out[h.id] = worst(assessable.length ? assessable : statuses);
  }
  return out;
}
