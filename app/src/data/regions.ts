// Body regions (PLAN.md §6.2, team decision 11). Each region's colour = worst status of its rules
// plus the symptoms mapped to it in data/symptoms.ts.
import type { RegionId } from '../types';

export interface RegionDef {
  id: RegionId;
  label: string;
  subtitle: string;
  /** Rules whose status colours this region (info rules are shown but never colour it). */
  ruleIds: string[];
  infoRuleIds: string[];
}

export const REGIONS: RegionDef[] = [
  { id: 'head', label: 'Head', subtitle: 'Brain, sleep, mood, balance, teeth', ruleIds: ['CH-SLEEP', 'CH-MOOD'], infoRuleIds: [] },
  { id: 'chest', label: 'Chest', subtitle: 'Heart and lungs', ruleIds: ['CH-SYS', 'CH-DIA', 'CH-HR'], infoRuleIds: ['INFO-SPO2', 'INFO-RESP', 'INFO-HRV', 'INFO-MAP'] },
  { id: 'abdomen', label: 'Abdomen', subtitle: 'Digestion, metabolism, kidneys', ruleIds: ['CH-FOOD', 'CH-WATER', 'CH-GLU'], infoRuleIds: [] },
  { id: 'arms', label: 'Arms', subtitle: 'Muscles and bones', ruleIds: ['CH-TRAINING', 'CH-MASS'], infoRuleIds: [] },
  { id: 'legs', label: 'Legs', subtitle: 'Muscles and bones', ruleIds: ['CH-TRAINING', 'CH-MASS'], infoRuleIds: [] },
  { id: 'body', label: 'Whole body', subtitle: 'Temperature, infection, fatigue', ruleIds: ['CH-TEMP'], infoRuleIds: [] },
];

export const regionById = (id: RegionId) => REGIONS.find((r) => r.id === id)!;
