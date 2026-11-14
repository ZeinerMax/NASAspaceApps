// Crew rules engine (PLAN.md §5.1). Pure functions: entry + history in, RuleResult[] out.
// Thresholds are from the Excel file (see data/rules.ts for cell refs); team decisions are marked.
import type { CrewMember, DailyEntry, RuleFlag, RuleResult, RuleState, Status } from '../types';
import { MAX_REST_DAYS_IN_A_ROW } from '../data/crew';
import { symptomDef } from '../data/symptoms';
import { computeBaseline } from './baseline';
import { fmt, mgDlToMmol, mlToL, round } from './units';

export const stateOf = (s: Status): RuleState => (s === 'red' ? 'firing' : s === 'orange' || s === 'grey' ? 'watch' : 'OK');

const result = (
  ruleId: string, status: Status, value: number | string | null, valueLabel: string, reason: string, flags: RuleFlag[] = [],
): RuleResult => ({ ruleId, status, value, valueLabel, reason, ruleState: stateOf(status), flags });

const missing = (ruleId: string, what: string) => result(ruleId, 'grey', null, 'No data', `No ${what} recorded: re-measure (missing data is never green).`);

/** The 7-day window (today and the 6 days before) used for "repeatedly" (Excel Rules!B7). */
const last7 = (history: DailyEntry[], day: number) => history.filter((e) => e.flightDay > day - 7 && e.flightDay <= day);

const isExercise = (e: DailyEntry) => e.condition === 'eva' || e.condition === 'post_exercise';
const exerciseReading = (ruleId: string, label: string) =>
  result(ruleId, 'info', null, label, 'Reading taken during or after exercise/EVA: not rated against resting thresholds (shown for the trend only).', ['EXERCISE_READING']);

const hasDizzinessOrCollapse = (e: DailyEntry) => e.symptoms.some((c) => symptomDef(c).dizzinessOrCollapse);
const hasRedSymptom = (e: DailyEntry) => e.symptoms.some((c) => symptomDef(c).level === 'red');

// ---------------------------------------------------------------- individual rules

function sleep(e: DailyEntry, h: DailyEntry[]): RuleResult {
  const v = e.sleepHours;
  if (v == null) return missing('CH-SLEEP', 'sleep');
  const label = fmt(v, 1, 'h');
  if (v >= 7 && v <= 9) return result('CH-SLEEP', 'green', v, label, 'Within 7–9 h.');
  if (v >= 6) return result('CH-SLEEP', 'orange', v, label, v > 9 ? 'More than 9 h.' : 'Between 6 and 7 h.');
  const shortNights = last7(h, e.flightDay).filter((x) => x.sleepHours != null && x.sleepHours < 6).length;
  const lbl = `${label} (${shortNights} of last 7 nights < 6 h)`;
  return shortNights >= 3
    ? result('CH-SLEEP', 'red', v, lbl, 'Less than 6 h on 3 or more of the last 7 nights.')
    : result('CH-SLEEP', 'orange', v, lbl, 'A night under 6 h. Turns red if it happens on 3 of 7 nights.');
}

function mood(e: DailyEntry): RuleResult {
  const v = e.mood.score;
  if (v == null) return missing('CH-MOOD', 'mood score');
  const label = `${fmt(v, 1)} / 10${e.mood.state ? ` (${e.mood.state})` : ''}`;
  if (v >= 7) return result('CH-MOOD', 'green', v, label, 'Score 7–10.');
  if (v >= 4) return result('CH-MOOD', 'orange', v, label, 'Score between 4 and 7.');
  return result('CH-MOOD', 'red', v, label, 'Score below 4.');
}

function symptoms(e: DailyEntry): RuleResult {
  const defs = e.symptoms.map(symptomDef);
  const extra = e.symptomsOther?.trim();
  if (!defs.length && !extra) return result('CH-SYMPTOMS', 'green', 'none', 'None', 'No symptoms reported.');
  const labels = [...defs.map((d) => d.label), ...(extra ? [`Other: ${extra}`] : [])].join(', ');
  const red = defs.filter((d) => d.level === 'red');
  if (red.length)
    return result('CH-SYMPTOMS', 'red', labels, labels, `Serious symptom (${red.map((d) => d.label).join(', ')}): overrides every number.`, ['EMERGENCY']);
  return result('CH-SYMPTOMS', 'orange', labels, labels, 'New or ongoing mild symptoms.');
}

function food(e: DailyEntry, h: DailyEntry[], crew: CrewMember): RuleResult {
  if (e.food.kcal == null) return missing('CH-FOOD', 'food intake');
  const pct = (e.food.kcal / crew.plannedKcalPerDay) * 100;
  const label = `${Math.round(e.food.kcal)} kcal = ${Math.round(pct)} % of plan`;
  if (pct >= 90) return result('CH-FOOD', 'green', pct, label, 'At least 90 % of the planned intake.');
  if (pct >= 75) return result('CH-FOOD', 'orange', pct, label, 'Between 75 and 90 % of the planned intake.');
  const lowDays = last7(h, e.flightDay).filter((x) => x.food.kcal != null && (x.food.kcal / crew.plannedKcalPerDay) * 100 < 75).length;
  const lbl = `${label} (${lowDays} of last 7 days < 75 %)`;
  return lowDays >= 3
    ? result('CH-FOOD', 'red', pct, lbl, 'Under 75 % of plan on 3 or more of the last 7 days.')
    : result('CH-FOOD', 'orange', pct, lbl, 'A day under 75 % of plan. Turns red if it happens on 3 of 7 days.');
}

function water(e: DailyEntry): RuleResult {
  if (e.food.waterMl == null) return missing('CH-WATER', 'water intake');
  const l = mlToL(e.food.waterMl);
  const label = fmt(l, 1, 'L');
  if (l >= 2.5) return result('CH-WATER', 'green', l, label, 'At least 2.5 L.');
  if (l >= 2.0) return result('CH-WATER', 'orange', l, label, 'Between 2.0 and 2.5 L.');
  return result('CH-WATER', 'red', l, label, 'Less than 2.0 L.');
}

/** A day without any training (rest or missed). EVA counts as training. */
const noTraining = (e: DailyEntry) =>
  !e.training.type.startsWith('eva') && (e.training.type === 'none' || e.training.type === 'rest' || e.training.minutes === 0);

/** Number of training-free days in a row ending with this day. */
function restStreak(e: DailyEntry, h: DailyEntry[]): number {
  let n = 0;
  for (let fd = e.flightDay; ; fd--) {
    const x = fd === e.flightDay ? e : h.find((y) => y.flightDay === fd);
    if (!x || !noTraining(x)) return n;
    n++;
  }
}

/** Training percentage for one day, 'rest' for an approved rest day, or null if unknown. */
export function trainingPct(e: DailyEntry, crew: CrewMember, h: DailyEntry[]): number | 'rest' | null {
  if (e.training.type.startsWith('eva')) return 100; // an EVA counts as a completed session (team decision)
  if (noTraining(e)) return restStreak(e, h) <= MAX_REST_DAYS_IN_A_ROW ? 'rest' : 0;
  if (e.training.minutes == null) return null;
  return (e.training.minutes / crew.plannedTrainingMin) * 100;
}

function training(e: DailyEntry, h: DailyEntry[], crew: CrewMember): RuleResult {
  const pct = trainingPct(e, crew, h);
  if (pct === 'rest') return result('CH-TRAINING', 'green', 'rest', 'Approved rest day', 'One rest day after a training day is part of the plan.');
  if (pct == null) return missing('CH-TRAINING', 'training');
  const what = noTraining(e) ? `No session (${restStreak(e, h)} days in a row without training = missed)` : `${e.training.type.replace(/_/g, ' ')}, ${e.training.minutes ?? 0} min`;
  const label = `${what} = ${Math.round(pct)} %`;
  if (pct >= 90) return result('CH-TRAINING', 'green', pct, label, 'At least 90 % of the planned session.');
  if (pct >= 50) return result('CH-TRAINING', 'orange', pct, label, 'Between 50 and 90 % of the planned session.');
  const low = last7(h, e.flightDay)
    .map((x) => trainingPct(x, crew, h))
    .filter((p): p is number => typeof p === 'number' && p < 50).length;
  const lbl = `${label} (${low} of last 7 planned sessions < 50 %)`;
  return low >= 3
    ? result('CH-TRAINING', 'red', pct, lbl, 'Under 50 % on 3 or more of the last 7 planned sessions.')
    : result('CH-TRAINING', 'orange', pct, lbl, 'A session under 50 % (or missed). Turns red if it happens 3 times in 7 days.');
}

function bloodPressure(ruleId: 'CH-SYS' | 'CH-DIA', e: DailyEntry, h: DailyEntry[]): RuleResult {
  const isSys = ruleId === 'CH-SYS';
  const v = isSys ? e.bp.sys : e.bp.dia;
  if (v == null) return missing(ruleId, isSys ? 'systolic pressure' : 'diastolic pressure');
  if (isExercise(e)) return exerciseReading(ruleId, `${v} mmHg (exercise)`);
  const [lowLimit, highWarn, highRed] = isSys ? [90, 140, 180] : [60, 90, 120];
  const b = computeBaseline(h, isSys ? 'sys' : 'dia', e.flightDay);
  const range = b ? ` · personal range ${Math.round(b.low)}–${Math.round(b.high)}` : ' · no personal baseline yet';
  const label = `${v} mmHg${range}`;
  if (v > highRed) return result(ruleId, 'red', v, label, `Above ${highRed} mmHg.`);
  if (v < lowLimit)
    return hasDizzinessOrCollapse(e)
      ? result(ruleId, 'red', v, label, `Below ${lowLimit} mmHg with dizziness or collapse.`)
      : result(ruleId, 'orange', v, label, `Below ${lowLimit} mmHg, no dizziness reported.`);
  if (v >= highWarn) return result(ruleId, 'orange', v, label, `Between ${highWarn} and ${highRed} mmHg.`);
  if (b && (v < b.low || v > b.high)) return result(ruleId, 'orange', v, label, 'Outside the personal range (mean ± 2 SD).');
  return result(ruleId, 'green', v, label, b ? 'Inside the personal range and the safe limits.' : 'Inside the safe limits (no personal baseline yet).');
}

function heartRate(e: DailyEntry, h: DailyEntry[]): RuleResult {
  const v = e.hr.bpm;
  if (v == null) return missing('CH-HR', 'heart rate');
  if (isExercise(e)) return exerciseReading('CH-HR', `${v} /min (exercise)`);
  const b = computeBaseline(h, 'hr', e.flightDay);
  const [low, high] = b ? [b.low, b.high] : [60, 100];
  const label = `${v} /min · ${b ? 'personal' : 'default'} range ${Math.round(low)}–${Math.round(high)}`;
  if (v > 120 || v < 40) return result('CH-HR', 'red', v, label, v > 120 ? 'Above 120 /min at rest.' : 'Below 40 /min at rest.');
  const outside = v < low || v > high;
  if (outside && hasRedSymptom(e)) return result('CH-HR', 'red', v, label, 'Outside the personal range together with a serious symptom.');
  if (outside) return result('CH-HR', 'orange', v, label, b ? 'Outside the personal range (mean ± 2 SD).' : 'Outside 60–100 /min (no personal baseline yet).');
  return result('CH-HR', 'green', v, label, 'Inside the personal range.');
}

function temperature(e: DailyEntry): RuleResult {
  const v = e.tempC;
  if (v == null) return missing('CH-TEMP', 'body temperature');
  if (isExercise(e)) return exerciseReading('CH-TEMP', `${fmt(v, 1, '°C')} (exercise)`);
  const label = fmt(v, 1, '°C');
  // In-flight bands (all team data is in flight).
  if (v < 35 || v >= 40) return result('CH-TEMP', 'red', v, label, v < 35 ? 'Below 35 °C.' : '40 °C or higher.');
  if (v < 36) return result('CH-TEMP', 'orange', v, label, 'Between 35 and 36 °C.');
  if (v > 38) return result('CH-TEMP', 'orange', v, label, 'Above the in-flight resting range (38.0 °C).');
  return result('CH-TEMP', 'green', v, label, 'Within the in-flight resting range 36.0–38.0 °C.');
}

function glucose(e: DailyEntry, h: DailyEntry[]): RuleResult {
  if (e.glucoseMgDl == null) return missing('CH-GLU', 'glucose');
  const v = mgDlToMmol(e.glucoseMgDl);
  if (isExercise(e)) return exerciseReading('CH-GLU', `${fmt(v, 1, 'mmol/l')} (exercise)`);
  const label = `${fmt(v, 1, 'mmol/l')} (${e.glucoseMgDl} mg/dL)`;
  if (v < 3.0) return result('CH-GLU', 'red', v, label, 'Below 3.0 mmol/l.');
  if (v < 3.9) return result('CH-GLU', 'orange', v, label, 'Low (3.0–3.9 mmol/l): treat now.', ['TREAT_NOW']);
  if (v <= 5.5) return result('CH-GLU', 'green', v, label, 'Within 3.9–5.5 mmol/l.');
  if (v < 16.7) return result('CH-GLU', 'orange', v, label, 'Above 5.5 mmol/l.');
  const prev = h.find((x) => x.flightDay === e.flightDay - 1);
  const prevHigh = prev?.glucoseMgDl != null && mgDlToMmol(prev.glucoseMgDl) >= 16.7;
  return prevHigh
    ? result('CH-GLU', 'red', v, label, '16.7 mmol/l or higher on 2 consecutive readings.')
    : result('CH-GLU', 'orange', v, label, '16.7 mmol/l or higher once: re-measure. Red if the next reading is also this high.');
}

/** Mass baseline = mass on flight day 7 (Excel Crew health!E14). */
export const massBaseline = (h: DailyEntry[]) => h.find((x) => x.flightDay === 7)?.massKg ?? null;

function mass(e: DailyEntry, h: DailyEntry[]): RuleResult {
  if (e.massKg == null) return missing('CH-MASS', 'body mass');
  const base = massBaseline(h);
  if (base == null || e.flightDay < 7)
    return result('CH-MASS', 'info', e.massKg, `${fmt(e.massKg, 1, 'kg')} · baseline set on FD7`, 'Not rated yet: the mass baseline is taken on flight day 7, after the early fluid shift.');
  const loss = ((base - e.massKg) / base) * 100;
  const label = `${fmt(e.massKg, 1, 'kg')} · ${loss >= 0 ? '−' : '+'}${round(Math.abs(loss), 1)} % vs FD7 (${fmt(base, 1, 'kg')})`;
  if (loss < 2) return result('CH-MASS', 'green', loss, label, 'Less than 2 % loss.');
  if (loss <= 5 + 1e-9) return result('CH-MASS', 'orange', loss, label, 'Loss between 2 and 5 %.');
  return result('CH-MASS', 'red', loss, label, 'More than 5 % loss.');
}

function info(ruleId: string, v: number | null, unit: string): RuleResult {
  return v == null
    ? result(ruleId, 'grey', null, 'No data', 'No reading recorded.')
    : result(ruleId, 'info', v, `${v} ${unit}`, 'No threshold in the team files: shown for information and trends only.');
}

// ---------------------------------------------------------------- cross rules

function crossRules(e: DailyEntry, base: RuleResult[]): RuleResult[] {
  const out: RuleResult[] = [];
  const headache = e.symptoms.some((c) => symptomDef(c).headache);
  out.push(headache
    ? result('X-HEADACHE-CO2', 'orange', 'headache', 'Headache reported', 'A new headache should trigger a cabin CO₂ check.', ['CHECK_CO2'])
    : result('X-HEADACHE-CO2', 'green', null, 'No headache', 'No headache reported.'));
  const sleepStatus = base.find((r) => r.ruleId === 'CH-SLEEP')?.status;
  const fatigue = e.symptoms.some((c) => symptomDef(c).fatigue);
  const poor = sleepStatus === 'orange' || sleepStatus === 'red' || fatigue;
  out.push(poor
    ? result('X-POOR-SLEEP-TRAINING', 'orange', null, fatigue ? 'Fatigue reported' : 'Poor sleep', 'Reduce ARED loads by 10 % (×0.90) and shorten the treadmill run to 30 min today.', ['REDUCE_TRAINING'])
    : result('X-POOR-SLEEP-TRAINING', 'green', null, 'Rested', 'Normal training load.'));
  const reds = base.filter((r) => r.status === 'red');
  out.push(reds.length
    ? result('X-RED-ACTION', 'red', reds.length, `${reds.length} red indicator(s)`, 'Prompt review by the crew surgeon or mission control. With serious symptoms, treat as an emergency.')
    : result('X-RED-ACTION', 'green', 0, 'No red indicators', 'Nothing needs surgeon review.'));
  return out;
}

// ---------------------------------------------------------------- public API

/**
 * Evaluate all crew rules for one entry.
 * @param history all entries of the SAME crew member (any order; the engine only looks at earlier days for baselines).
 */
export function evaluateEntry(e: DailyEntry, history: DailyEntry[], crew: CrewMember): RuleResult[] {
  const base: RuleResult[] = [
    sleep(e, history),
    mood(e),
    symptoms(e),
    food(e, history, crew),
    water(e),
    training(e, history, crew),
    bloodPressure('CH-SYS', e, history),
    bloodPressure('CH-DIA', e, history),
    heartRate(e, history),
    temperature(e),
    glucose(e, history),
    mass(e, history),
    info('INFO-SPO2', e.o2.spo2Pct, '%'),
    info('INFO-RESP', e.o2.respRate, '/min'),
    info('INFO-HRV', e.hr.hrvMs, 'ms'),
    info('INFO-MAP', e.bp.map, 'mmHg'),
  ];
  return [...base, ...crossRules(e, base)];
}
