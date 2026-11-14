// Shared types for the whole app. Shapes are documented in PLAN.md §4.2.

/** grey = missing / not evaluable (never green); info = shown, but no threshold exists in the team files. */
export type Status = 'green' | 'orange' | 'red' | 'grey' | 'info';

export type Condition = 'resting' | 'post_exercise' | 'eva' | 'critical';

export type CrewId = 'F01' | 'F02' | 'M01' | 'M02';

export type RegionId = 'head' | 'chest' | 'abdomen' | 'arms' | 'legs' | 'body';

export type HazardId = 'radiation' | 'isolation' | 'distance' | 'gravity' | 'environment';

export interface CrewMember {
  id: CrewId;
  sex: 'male' | 'female';
  displayName: string;
  ageYears: number;
  plannedKcalPerDay: number;
  plannedTrainingMin: number;
  priorCareerDoseMSv: number | null;
}

export interface DailyEntry {
  id: string;
  crewId: CrewId;
  flightDay: number;
  date: string | null;
  source: 'seed' | 'user';
  environment: string;
  condition: Condition;
  sleepHours: number | null;
  mood: { score: number | null; state: string | null };
  symptoms: string[];
  symptomsOther: string | null;
  food: { kcal: number | null; waterMl: number | null };
  training: { type: string; minutes: number | null; completed: boolean | null; restDay: boolean };
  bp: { sys: number | null; dia: number | null; map: number | null };
  hr: { bpm: number | null; hrvMs: number | null };
  o2: { spo2Pct: number | null; respRate: number | null };
  tempC: number | null;
  glucoseMgDl: number | null;
  massKg: number | null;
}

export type BaselineIndicator = 'sys' | 'dia' | 'hr' | 'tempC' | 'glucoseMmol' | 'spo2';

export interface Baseline {
  crewId: CrewId;
  indicator: BaselineIndicator;
  mean: number;
  sd: number;
  low: number;
  high: number;
  n: number;
  fromFlightDay: number;
  toFlightDay: number;
}

export type Basis = 'Agency standard' | 'Published research' | 'Clinical reference' | 'Proposed' | 'Team decision';

export interface Rule {
  id: string;
  group: 'crew' | 'ship' | 'cross';
  label: string;
  unit: string;
  inputs: string[];
  green: string;
  orange: string;
  red: string;
  basis: Basis;
  sourceRef: string;
  note: string;
  placeholders: string[];
  teamDecisions: string[];
  regions: RegionId[];
  hazards: HazardId[];
  /** Key into explanations.ts for "what it means / how to measure". */
  explanationId?: string;
}

export type RuleState = 'OK' | 'watch' | 'firing';

export type RuleFlag = 'TREAT_NOW' | 'CHECK_CO2' | 'REDUCE_TRAINING' | 'EMERGENCY' | 'EXERCISE_READING';

export interface RuleResult {
  ruleId: string;
  status: Status;
  value: number | string | null;
  valueLabel: string;
  reason: string;
  ruleState: RuleState;
  flags: RuleFlag[];
}

export interface Problem {
  id: string;
  title: string;
  system: string;
  regions: RegionId[];
  ruleIds: string[];
  hazardIds: HazardId[];
  /** Symptom codes that point to this problem (instead of the whole symptom rule). */
  symptomCodes?: string[];
  whatItIs: string;
  response: string | null;
  prevention: string | null;
  source: string;
}

export interface RadiationDay {
  flightDay: number;
  environment: string | null;
  doseRateMSvDay: number | null;
  missionDoseMSv: number | null;
  speDoseMSv: number | null;
}

export interface ShipReading {
  t: number;
  co2mmHg: number;
  co2Avg7d: number;
  cabinTempC: number;
  rhPct: number;
  pio2mmHg: number;
  pressureKPa: number;
  diluentPct: number;
  simulated: true;
}

export interface StoredState {
  version: 1;
  userEntries: DailyEntry[];
  lastCheckInDate: Partial<Record<CrewId, string>>;
}
