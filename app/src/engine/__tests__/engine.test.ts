// Rules-engine tests against the team's seed data (expected cases from PLAN.md §5.1).
import { describe, expect, it } from 'vitest';
import { SEED_ENTRIES } from '../../data/seed';
import { crewById } from '../../data/crew';
import { RULES } from '../../data/rules';
import type { CrewId, DailyEntry, RuleResult } from '../../types';
import { computeBaseline } from '../baseline';
import { evaluateEntry } from '../evaluate';
import { overallStatus, regionStatuses } from '../aggregate';
import { evaluateShip } from '../ship';

const hist = (id: CrewId) => SEED_ENTRIES.filter((e) => e.crewId === id);
const day = (id: CrewId, fd: number) => hist(id).find((e) => e.flightDay === fd)!;
const run = (id: CrewId, fd: number, history = hist(id), e = day(id, fd)) => evaluateEntry(e, history, crewById(id));
const st = (res: RuleResult[], id: string) => res.find((r) => r.ruleId === id)!.status;

describe('seed', () => {
  it('has 4 crew x 20 days', () => {
    expect(SEED_ENTRIES).toHaveLength(80);
    expect(day('F02', 18).o2.spo2Pct).toBeNull();
  });
});

describe('baseline (rolling, Excel Rules!B6)', () => {
  it('F02 systolic range for FD18 is about 103–110', () => {
    const b = computeBaseline(hist('F02'), 'sys', 18)!;
    expect(b.low).toBeGreaterThan(102);
    expect(b.high).toBeLessThan(111);
    expect(b.fromFlightDay).toBeGreaterThanOrEqual(7);
  });
  it('needs at least 7 readings', () => {
    expect(computeBaseline(hist('M01'), 'sys', 8)).toBeNull();
  });
  it('a new entry shifts the next day baseline', () => {
    const h = hist('M01');
    const extra: DailyEntry = { ...day('M01', 20), id: 'x', flightDay: 21, source: 'user', bp: { sys: 150, dia: 74, map: 90 } };
    const before = computeBaseline(h, 'sys', 22)!;
    const after = computeBaseline([...h, extra], 'sys', 22)!;
    expect(after.mean).toBeGreaterThan(before.mean);
  });
});

describe('crew rules on seed', () => {
  it('healthy crew are green on FD20', () => {
    for (const id of ['F01', 'M01', 'M02'] as CrewId[]) expect([id, overallStatus(run(id, 20))]).toEqual([id, 'green']);
  });

  it('F02 FD18: water red, several orange', () => {
    const r = run('F02', 18);
    expect(st(r, 'CH-WATER')).toBe('red');
    expect(st(r, 'CH-SLEEP')).toBe('orange');
    expect(st(r, 'CH-MOOD')).toBe('orange');
    expect(st(r, 'CH-SYS')).toBe('orange');
    expect(st(r, 'CH-DIA')).toBe('orange');
    expect(st(r, 'CH-HR')).toBe('orange');
    expect(st(r, 'CH-FOOD')).toBe('orange');
    expect(st(r, 'CH-GLU')).toBe('green');
    expect(st(r, 'CH-MASS')).toBe('green');
    expect(overallStatus(r)).toBe('red');
  });

  it('F02 FD20: symptom override and many reds', () => {
    const r = run('F02', 20);
    for (const id of ['CH-SYMPTOMS', 'CH-DIA', 'CH-HR', 'CH-TEMP', 'CH-GLU', 'CH-SLEEP', 'CH-MOOD', 'CH-TRAINING']) expect([id, st(r, id)]).toEqual([id, 'red']);
    expect(st(r, 'CH-FOOD')).toBe('orange');
    expect(st(r, 'CH-MASS')).toBe('orange');
    expect(st(r, 'INFO-SPO2')).toBe('grey');
    const reg = regionStatuses(r, day('F02', 20));
    expect(reg.head).toBe('red');
    expect(reg.chest).toBe('red');
    expect(reg.body).toBe('red');
  });

  it('M02 FD17: systolic just outside the personal range is orange', () => {
    expect(st(run('M02', 17), 'CH-SYS')).toBe('orange');
  });

  it('exercise readings are not rated', () => {
    const r = run('M01', 14);
    expect(st(r, 'CH-HR')).toBe('info');
    expect(r.find((x) => x.ruleId === 'CH-HR')!.flags).toContain('EXERCISE_READING');
  });

  it('one rest day at a time is approved; the 2nd day in a row without training is missed', () => {
    for (const fd of [1, 4, 7, 10, 13, 17, 20]) expect(st(run('M01', fd), 'CH-TRAINING')).toBe('green');
    expect(st(run('F02', 18), 'CH-TRAINING')).toBe('green'); // first rest day
    expect(st(run('F02', 19), 'CH-TRAINING')).toBe('orange'); // 2nd in a row = missed (with FD17 33 %: 2 of 7)
    expect(st(run('F02', 20), 'CH-TRAINING')).toBe('red'); // FD17, 19, 20 under 50 %
  });
});

describe('persistence: single = orange, 3 of 7 = red', () => {
  const base = day('M01', 11);
  const mk = (fd: number, sleepHours: number): DailyEntry => ({ ...base, id: `t${fd}`, flightDay: fd, sleepHours });
  it('one short night is orange', () => {
    const h = [mk(1, 8), mk(2, 8), mk(3, 5.5)];
    expect(st(evaluateEntry(h[2], h, crewById('M01')), 'CH-SLEEP')).toBe('orange');
  });
  it('three short nights in 7 are red', () => {
    const h = [mk(1, 5), mk(2, 8), mk(3, 5), mk(4, 5.5)];
    expect(st(evaluateEntry(h[3], h, crewById('M01')), 'CH-SLEEP')).toBe('red');
  });
});

describe('boundaries ("to <X" excludes X)', () => {
  const base = day('M01', 11);
  const ev = (patch: Partial<DailyEntry>) => evaluateEntry({ ...base, ...patch }, hist('M01'), crewById('M01'));
  it('sleep 7.0 is green, 6.0 orange', () => {
    expect(st(ev({ sleepHours: 7 }), 'CH-SLEEP')).toBe('green');
    expect(st(ev({ sleepHours: 6 }), 'CH-SLEEP')).toBe('orange');
  });
  it('mood 7 green, 4 orange, 3.9 red', () => {
    expect(st(ev({ mood: { score: 7, state: null } }), 'CH-MOOD')).toBe('green');
    expect(st(ev({ mood: { score: 4, state: null } }), 'CH-MOOD')).toBe('orange');
    expect(st(ev({ mood: { score: 3.9, state: null } }), 'CH-MOOD')).toBe('red');
  });
  it('water 2.5 green, 2.0 orange, 1.99 red', () => {
    expect(st(ev({ food: { kcal: 2600, waterMl: 2500 } }), 'CH-WATER')).toBe('green');
    expect(st(ev({ food: { kcal: 2600, waterMl: 2000 } }), 'CH-WATER')).toBe('orange');
    expect(st(ev({ food: { kcal: 2600, waterMl: 1990 } }), 'CH-WATER')).toBe('red');
  });
  it('temperature 38.0 green, 40 red, 35 orange', () => {
    expect(st(ev({ tempC: 38.0 }), 'CH-TEMP')).toBe('green');
    expect(st(ev({ tempC: 40 }), 'CH-TEMP')).toBe('red');
    expect(st(ev({ tempC: 35 }), 'CH-TEMP')).toBe('orange');
  });
  it('mass loss of exactly 5 % is orange', () => {
    const fd7 = day('M01', 7).massKg!;
    expect(st(ev({ massKg: fd7 * 0.95 }), 'CH-MASS')).toBe('orange');
    expect(st(ev({ massKg: fd7 * 0.94 }), 'CH-MASS')).toBe('red');
  });
  it('red symptom forces overall red', () => {
    expect(overallStatus(ev({ symptoms: ['chest_pain'] }))).toBe('red');
  });
});

describe('ship', () => {
  it('green sim values are green; radiation grey without data', () => {
    const r = evaluateShip({ t: 0, co2mmHg: 2, co2Avg7d: 2, cabinTempC: 22.5, rhPct: 45, pio2mmHg: 150, pressureKPa: 101, diluentPct: 79, simulated: true }, null);
    for (const id of ['SH-CO2', 'SH-CABIN-T', 'SH-RH', 'SH-PIO2', 'SH-PRESSURE', 'SH-DILUENT']) expect([id, st(r, id)]).toEqual([id, 'green']);
    expect(st(r, 'SH-RAD-CAREER')).toBe('grey');
  });
  it('CO2 4.0 is red', () => {
    const r = evaluateShip({ t: 0, co2mmHg: 4, co2Avg7d: 2, cabinTempC: 22.5, rhPct: 45, pio2mmHg: 150, pressureKPa: 101, diluentPct: 79, simulated: true }, null);
    expect(st(r, 'SH-CO2')).toBe('red');
  });
});

describe('rules catalogue', () => {
  it('has every Excel row except vision', () => {
    const ids = RULES.map((r) => r.id);
    for (const id of ['CH-SLEEP', 'CH-MOOD', 'CH-SYMPTOMS', 'CH-FOOD', 'CH-WATER', 'CH-TRAINING', 'CH-SYS', 'CH-DIA', 'CH-HR', 'CH-TEMP', 'CH-GLU', 'CH-MASS',
      'SH-CO2', 'SH-CABIN-T', 'SH-RH', 'SH-PIO2', 'SH-PRESSURE', 'SH-DILUENT', 'SH-RAD-CAREER', 'SH-RAD-SPE', 'SH-RAD-RATE']) expect(ids).toContain(id);
    expect(ids.some((i) => i.includes('VISION'))).toBe(false);
  });
});
