// One definition per charted indicator: how to read it, which rule colours it, and the shaded zones
// (zones mirror the Excel bands in data/rules.ts; persistence-only reds are shaded as "red if repeated").
import type { BaselineIndicator, CrewMember, DailyEntry, Status } from '../../types';
import { mgDlToMmol } from '../../engine/units';
import { massBaseline, trainingPct } from '../../engine/evaluate';

export interface Zone { y1: number; y2: number; status: Status }

export interface Metric {
  id: string;
  label: string;
  unit: string;
  ruleId: string;
  digits: number;
  explanationId: string;
  /** h = all entries of this crew member (needed for rules that look at previous days). */
  value: (e: DailyEntry, crew: CrewMember, h: DailyEntry[]) => number | null;
  baseline?: BaselineIndicator;
  zones?: (crew: CrewMember, history: DailyEntry[]) => Zone[];
  domain?: [number | 'auto', number | 'auto'];
}

const z = (y1: number, y2: number, status: Status): Zone => ({ y1, y2, status });

export const METRICS: Metric[] = [
  { id: 'sleep', label: 'Sleep', unit: 'h', ruleId: 'CH-SLEEP', digits: 1, explanationId: 'sleep', value: (e) => e.sleepHours,
    zones: () => [z(7, 9, 'green'), z(6, 7, 'orange'), z(9, 11, 'orange'), z(0, 6, 'red')], domain: [0, 11] },
  { id: 'mood', label: 'Mood', unit: '/10', ruleId: 'CH-MOOD', digits: 1, explanationId: 'mood', value: (e) => e.mood.score,
    zones: () => [z(7, 10, 'green'), z(4, 7, 'orange'), z(0, 4, 'red')], domain: [0, 10] },
  { id: 'sys', label: 'Systolic BP', unit: 'mmHg', ruleId: 'CH-SYS', digits: 0, explanationId: 'bp', value: (e) => e.bp.sys, baseline: 'sys',
    zones: () => [z(140, 180, 'orange'), z(180, 200, 'red'), z(70, 90, 'orange')], domain: [70, 160] },
  { id: 'dia', label: 'Diastolic BP', unit: 'mmHg', ruleId: 'CH-DIA', digits: 0, explanationId: 'bp', value: (e) => e.bp.dia, baseline: 'dia',
    zones: () => [z(90, 120, 'orange'), z(120, 130, 'red'), z(40, 60, 'orange')], domain: [40, 100] },
  { id: 'hr', label: 'Resting heart rate', unit: '/min', ruleId: 'CH-HR', digits: 0, explanationId: 'hr', value: (e) => e.hr.bpm, baseline: 'hr',
    zones: () => [z(120, 160, 'red'), z(30, 40, 'red')], domain: [30, 160] },
  { id: 'temp', label: 'Body temperature', unit: '°C', ruleId: 'CH-TEMP', digits: 1, explanationId: 'temp', value: (e) => e.tempC, baseline: 'tempC',
    zones: () => [z(36, 38, 'green'), z(35, 36, 'orange'), z(38, 40, 'orange'), z(34, 35, 'red')], domain: [34, 39] },
  { id: 'glucose', label: 'Fasting glucose', unit: 'mmol/l', ruleId: 'CH-GLU', digits: 1, explanationId: 'glucose',
    value: (e) => (e.glucoseMgDl == null ? null : mgDlToMmol(e.glucoseMgDl)), baseline: 'glucoseMmol',
    zones: () => [z(3.9, 5.5, 'green'), z(3, 3.9, 'orange'), z(5.5, 8, 'orange'), z(2, 3, 'red')], domain: [2, 8] },
  { id: 'water', label: 'Water', unit: 'L', ruleId: 'CH-WATER', digits: 1, explanationId: 'water',
    value: (e) => (e.food.waterMl == null ? null : e.food.waterMl / 1000),
    zones: () => [z(2.5, 4, 'green'), z(2, 2.5, 'orange'), z(0, 2, 'red')], domain: [0, 4] },
  { id: 'food', label: 'Food intake', unit: '% of plan', ruleId: 'CH-FOOD', digits: 0, explanationId: 'food',
    value: (e, c) => (e.food.kcal == null ? null : (e.food.kcal / c.plannedKcalPerDay) * 100),
    zones: () => [z(90, 140, 'green'), z(75, 90, 'orange'), z(0, 75, 'red')], domain: [0, 140] },
  { id: 'training', label: 'Training', unit: '% of plan', ruleId: 'CH-TRAINING', digits: 0, explanationId: 'training',
    value: (e, c, h) => { const p = trainingPct(e, c, h); return typeof p === 'number' ? Math.min(p, 150) : null; },
    zones: () => [z(90, 150, 'green'), z(50, 90, 'orange'), z(0, 50, 'red')], domain: [0, 150] },
  { id: 'mass', label: 'Body mass', unit: 'kg', ruleId: 'CH-MASS', digits: 1, explanationId: 'mass', value: (e) => e.massKg,
    zones: (_c, h) => {
      const b = massBaseline(h);
      return b == null ? [] : [z(b * 0.98, b * 1.05, 'green'), z(b * 0.95, b * 0.98, 'orange'), z(b * 0.9, b * 0.95, 'red')];
    } },
  { id: 'spo2', label: 'Oxygen saturation', unit: '%', ruleId: 'INFO-SPO2', digits: 0, explanationId: 'spo2', value: (e) => e.o2.spo2Pct, baseline: 'spo2', domain: [90, 100] },
  { id: 'resp', label: 'Respiratory rate', unit: '/min', ruleId: 'INFO-RESP', digits: 0, explanationId: 'spo2', value: (e) => e.o2.respRate },
  { id: 'hrv', label: 'Heart rate variability', unit: 'ms', ruleId: 'INFO-HRV', digits: 0, explanationId: 'hr', value: (e) => e.hr.hrvMs },
];

export const metricById = (id: string) => METRICS.find((m) => m.id === id)!;
export const metricsForRule = (ruleId: string) => METRICS.filter((m) => m.ruleId === ruleId);
