// Status of a health problem = worst of its linked rules + its own symptoms (if reported).
import type { DailyEntry, Problem, RuleResult, Status } from '../types';
import { symptomDef } from '../data/symptoms';
import { worst } from './aggregate';

export function problemLinks(p: Problem, results: RuleResult[], e: DailyEntry) {
  const byId = new Map(results.map((r) => [r.ruleId, r]));
  const rules = p.ruleIds.map((id) => byId.get(id)).filter((r): r is RuleResult => !!r);
  const symptoms = e.symptoms.filter((c) => p.symptomCodes?.includes(c)).map(symptomDef);
  const statuses: Status[] = [...rules.map((r) => r.status), ...symptoms.map((s) => s.level)];
  if (!statuses.length && p.symptomCodes?.length) statuses.push('green'); // symptom-only problem, nothing reported
  return { rules, symptoms, status: worst(statuses) };
}

/** Problems that explain a given rule result (for "what to do" lists). */
export const problemsForResult = (problems: Problem[], r: RuleResult, e: DailyEntry) =>
  problems.filter((p) =>
    r.ruleId === 'CH-SYMPTOMS' ? e.symptoms.some((c) => p.symptomCodes?.includes(c)) : p.ruleIds.includes(r.ruleId));
