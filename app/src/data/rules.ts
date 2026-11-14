// Every rule shown in the app. Threshold TEXT is transcribed from
// "Crew Health & Cabin Monitoring Thresholds (Space-Adjusted).xlsx" (cell refs in sourceRef).
// The evaluation code for each rule lives in engine/evaluate.ts (crew) and engine/ship.ts (ship).
// Anything not from the team files is listed in `placeholders` (with VERIFY) or `teamDecisions`.
import type { Rule } from '../types';

export const VERIFY = 'placeholder, verify against NASA Human Research Program or other space agency sources';

export const RULES: Rule[] = [
  // ---------------- Crew health (sheet "Crew health") ----------------
  {
    id: 'CH-SLEEP', group: 'crew', label: 'Sleep', unit: 'h/night', inputs: ['sleepHours'],
    green: '7–9 h', orange: '6 to <7 h, or >9 h, or a single night <6 h', red: '<6 h on ≥3 of the last 7 nights',
    basis: 'Proposed', sourceRef: 'xlsx: Crew health!A3:G3',
    note: 'NASA schedules an 8.5 h sleep opportunity. ISS crews average about 6 h/night, so orange and red are common in flight: a real signal, not a bug.',
    placeholders: [], teamDecisions: ['A single night <6 h is orange; red only when it repeats (≥3 of 7).'],
    regions: ['head'], hazards: ['isolation'], explanationId: 'sleep',
  },
  {
    id: 'CH-MOOD', group: 'crew', label: 'Mood', unit: 'score 1–10', inputs: ['mood.score'],
    green: '7 to 10', orange: '4 to <7', red: '<4',
    basis: 'Proposed', sourceRef: 'xlsx: Crew health!A4:G4',
    note: 'Decimals allowed; bands are continuous. Consider a validated questionnaire for flight use.',
    placeholders: [], teamDecisions: [], regions: ['head'], hazards: ['isolation'], explanationId: 'mood',
  },
  {
    id: 'CH-SYMPTOMS', group: 'crew', label: 'Symptoms', unit: 'checklist', inputs: ['symptoms'],
    green: 'None', orange: 'New mild symptoms (e.g. mild headache, mild nausea)',
    red: 'Any serious symptom: loss of consciousness, chest pain, marked breathlessness, sudden vision loss. Overrides every number.',
    basis: 'Proposed', sourceRef: 'xlsx: Crew health!A5:G5; Rules!B9',
    note: 'A new headache should trigger a CO₂ check (NASA links headaches to CO₂ at about 2.8–4.5 mmHg).',
    placeholders: [`Levels for urinary discomfort, tooth pain and digestive upset (orange) are proposals: ${VERIFY}`],
    teamDecisions: [], regions: ['head', 'chest', 'abdomen', 'arms', 'legs', 'body'], hazards: [], explanationId: 'symptoms',
  },
  {
    id: 'CH-FOOD', group: 'crew', label: 'Food intake', unit: '% of planned kcal', inputs: ['food.kcal'],
    green: '≥90 % of plan', orange: '75 to <90 %, or a single day <75 %', red: '<75 % on ≥3 of the last 7 days',
    basis: 'Proposed', sourceRef: 'xlsx: Crew health!A6:G6',
    note: "Plan = the individual's mission target. NASA's planning average is 3,035 kcal/day; EVA days need extra calories and water.",
    placeholders: [],
    teamDecisions: ["Plan = the crew member's normal daily intake in the team data (F 2,300 kcal, M 2,600 kcal)."],
    regions: ['abdomen'], hazards: [], explanationId: 'food',
  },
  {
    id: 'CH-WATER', group: 'crew', label: 'Water', unit: 'L/day', inputs: ['food.waterMl'],
    green: '≥2.5 L', orange: '2.0 to <2.5 L', red: '<2.0 L',
    basis: 'Proposed', sourceRef: 'xlsx: Crew health!A7:G7',
    note: 'NASA lists 2.5 L/day per crew member as the minimum water provision (a supply requirement, not an intake alarm).',
    placeholders: [], teamDecisions: [], regions: ['abdomen'], hazards: [], explanationId: 'water',
  },
  {
    id: 'CH-TRAINING', group: 'crew', label: 'Training', unit: '% of planned session', inputs: ['training.minutes', 'training.type'],
    green: '≥90 % of the planned session, or one rest day after a training day', orange: '50 to <90 %, or a single session <50 % (a missed session = 0 %)',
    red: '<50 % on ≥3 of the last 7 planned sessions',
    basis: 'Proposed', sourceRef: 'xlsx: Crew health!A8:G8',
    note: 'Approved rest is not a missed session. ISS crews train about 600 min/week and still lose some fitness.',
    placeholders: [],
    teamDecisions: ['Planned session = 60 min.', 'One rest day at a time is approved (the crew routine is 2 training days, then 1 rest day). A second day in a row without training counts as a missed session. An EVA counts as a completed session.'],
    regions: ['arms', 'legs'], hazards: ['gravity'], explanationId: 'training',
  },
  {
    id: 'CH-SYS', group: 'crew', label: 'Systolic blood pressure', unit: 'mmHg', inputs: ['bp.sys', 'symptoms'],
    green: 'Inside personal range AND 90 to <140', orange: 'Outside personal range, or 140–180, or <90 with no symptoms',
    red: '>180, or <90 with dizziness or collapse',
    basis: 'Clinical reference', sourceRef: 'xlsx: Crew health!A9:G9',
    note: 'Measure rested, same posture each time. Personal range = mean ± 2 SD of resting readings (Rules!B6).',
    placeholders: [], teamDecisions: ['Personal range is rolling: the 20 flight days before today (from FD7 on).'],
    regions: ['chest'], hazards: ['gravity'], explanationId: 'bp',
  },
  {
    id: 'CH-DIA', group: 'crew', label: 'Diastolic blood pressure', unit: 'mmHg', inputs: ['bp.dia', 'symptoms'],
    green: 'Inside personal range AND 60 to <90', orange: 'Outside personal range, or 90–120, or <60 with no symptoms',
    red: '>120, or <60 with dizziness or collapse',
    basis: 'Clinical reference', sourceRef: 'xlsx: Crew health!A10:G10',
    note: 'Same as systolic: supine, rested baseline.',
    placeholders: [], teamDecisions: ['Personal range is rolling: the 20 flight days before today (from FD7 on).'],
    regions: ['chest'], hazards: ['gravity'], explanationId: 'bp',
  },
  {
    id: 'CH-HR', group: 'crew', label: 'Resting heart rate', unit: '/min', inputs: ['hr.bpm', 'symptoms'],
    green: 'Inside personal range (60–100 if no baseline yet)', orange: 'Outside personal range',
    red: '>120 or <40 at rest, or any deviation with serious symptoms',
    basis: 'Proposed', sourceRef: 'xlsx: Crew health!A11:G11',
    note: 'Use a supine baseline after ≥5 min rest. Trained people may have a lower normal rate.',
    placeholders: [], teamDecisions: ['Personal range is rolling: the 20 flight days before today (from FD7 on).'],
    regions: ['chest'], hazards: ['gravity'], explanationId: 'hr',
  },
  {
    id: 'CH-TEMP', group: 'crew', label: 'Body temperature (rest)', unit: '°C', inputs: ['tempC'],
    green: 'In flight: 36.0–38.0', orange: 'In flight: 35 to <36, or >38.0 to <40', red: '<35 or ≥40',
    basis: 'Published research', sourceRef: 'xlsx: Crew health!A12:G12',
    note: 'Core temperature rises about 1 °C at rest on long missions. Use resting readings only and keep one sensor type.',
    placeholders: [], teamDecisions: [], regions: ['body'], hazards: ['environment'], explanationId: 'temp',
  },
  {
    id: 'CH-GLU', group: 'crew', label: 'Fasting glucose', unit: 'mmol/l', inputs: ['glucoseMgDl'],
    green: '3.9–5.5', orange: '3.0 to <3.9 (treat now), or >5.5 to <16.7, or a single reading ≥16.7',
    red: '<3.0, or ≥16.7 on 2 consecutive readings',
    basis: 'Clinical reference', sourceRef: 'xlsx: Crew health!A13:G13',
    note: 'No space-specific threshold found. Fasting means ≥8 h without food. Team data is in mg/dL (÷18 → mmol/l).',
    placeholders: [], teamDecisions: ['A single reading ≥16.7 is orange (gap in the table).'],
    regions: ['abdomen'], hazards: [], explanationId: 'glucose',
  },
  {
    id: 'CH-MASS', group: 'crew', label: 'Body mass loss vs baseline', unit: '%', inputs: ['massKg'],
    green: '<2 %', orange: '2 % to 5 % (inclusive)', red: '>5 %',
    basis: 'Proposed', sourceRef: 'xlsx: Crew health!A14:G14',
    note: 'Baseline about flight day 7, not launch (early fluid-driven loss of 3–4 %). Measured with a mass-measurement device, not scales.',
    placeholders: [], teamDecisions: [], regions: ['arms', 'legs'], hazards: ['gravity'], explanationId: 'mass',
  },
  // Info-only: data exists, but no file gives a threshold.
  ...([
    ['INFO-SPO2', 'Oxygen saturation (SpO₂)', '%', 'o2.spo2Pct', 'spo2'],
    ['INFO-RESP', 'Respiratory rate', '/min', 'o2.respRate', 'spo2'],
    ['INFO-HRV', 'Heart rate variability', 'ms', 'hr.hrvMs', 'hr'],
    ['INFO-MAP', 'Mean arterial pressure', 'mmHg', 'bp.map', 'bp'],
  ] as const).map(([id, label, unit, input, expl]): Rule => ({
    id, group: 'crew', label, unit, inputs: [input],
    green: '—', orange: '—', red: '—',
    basis: 'Proposed', sourceRef: 'team JSON data (no threshold in the Excel file)',
    note: 'Shown for information and trends only: our files contain no threshold for this value.',
    placeholders: [], teamDecisions: [], regions: ['chest'], hazards: [], explanationId: expl,
  })),

  // ---------------- Ship (sheet "Cabin & radiation") ----------------
  {
    id: 'SH-CO2', group: 'ship', label: 'Cabin CO₂ (1-hour average)', unit: 'mmHg', inputs: ['co2mmHg', 'co2Avg7d'],
    green: '≤3.0 AND 7-day average ≤2.5', orange: '>3.0 and below the emergency limit, OR 7-day average >2.5',
    red: '≥ mission emergency limit (prototype placeholder 4.0)',
    basis: 'Agency standard', sourceRef: 'xlsx: Cabin & radiation!A3:G3',
    note: 'Headaches occur at 2.8–4.5 mmHg; a 7-day average below 2.5 mmHg keeps headache risk under 1 %.',
    placeholders: ['The 4.0 mmHg emergency limit is itself a placeholder in the Excel file (ISS figure from a 2015 NASA paper).'],
    teamDecisions: [], regions: [], hazards: ['environment'],
  },
  {
    id: 'SH-CABIN-T', group: 'ship', label: 'Cabin temperature', unit: '°C', inputs: ['cabinTempC'],
    green: '20–25', orange: '18 to <20, or >25 to 27', red: '<18 or >27',
    basis: 'Agency standard', sourceRef: 'xlsx: Cabin & radiation!A4:G4',
    note: 'Read temperature together with humidity.', placeholders: [], teamDecisions: [], regions: [], hazards: ['environment'],
  },
  {
    id: 'SH-RH', group: 'ship', label: 'Cabin relative humidity', unit: '%', inputs: ['rhPct'],
    green: '30–60', orange: '25 to <30, or >60 to 75', red: '<25 or >75',
    basis: 'Proposed', sourceRef: 'xlsx: Cabin & radiation!A5:G5',
    note: 'Simplified fixed bands; the true NASA limit depends on temperature.', placeholders: [], teamDecisions: [], regions: [], hazards: ['environment'],
  },
  {
    id: 'SH-PIO2', group: 'ship', label: 'Inspired O₂ partial pressure (PIO₂)', unit: 'mmHg', inputs: ['pio2mmHg'],
    green: '145–155', orange: '127 to <145, or >155 to 333', red: '<127 or >333',
    basis: 'Agency standard', sourceRef: 'xlsx: Cabin & radiation!A6:G6',
    note: 'PIO₂ is lower than the cabin O₂ sensor reading (about 150 vs 160 mmHg at 101 kPa and 21 % O₂).', placeholders: [], teamDecisions: [], regions: [], hazards: ['environment'],
  },
  {
    id: 'SH-PRESSURE', group: 'ship', label: 'Total cabin pressure', unit: 'kPa', inputs: ['pressureKPa'],
    green: 'Within the nominal band (100–102 kPa)', orange: 'Outside nominal band but inside 34.5–103', red: '≤34.5 or >103',
    basis: 'Agency standard', sourceRef: 'xlsx: Cabin & radiation!A7:G7',
    note: 'NASA tolerance for indefinite crew exposure: 34.5 kPa < pressure ≤ 103 kPa. The mission team defines the nominal band.',
    placeholders: [], teamDecisions: ['Nominal band 101 ± 1 kPa: the ship regulates pressure automatically (team decision 7).'],
    regions: [], hazards: ['environment'],
  },
  {
    id: 'SH-DILUENT', group: 'ship', label: 'Diluent gas fraction', unit: '%', inputs: ['diluentPct'],
    green: '≥30', orange: 'None defined', red: '<30',
    basis: 'Agency standard', sourceRef: 'xlsx: Cabin & radiation!A8:G8',
    note: 'At least 30 % diluent gas limits absorption atelectasis.', placeholders: [], teamDecisions: [], regions: [], hazards: ['environment'],
  },
  {
    id: 'SH-RAD-CAREER', group: 'ship', label: 'Radiation: mission dose vs career limit', unit: 'mSv', inputs: ['missionDoseMSv'],
    green: '0 to <480', orange: '480 to <600', red: '≥600',
    basis: 'Agency standard', sourceRef: 'xlsx: Cabin & radiation!A9:G9',
    note: 'NASA career limit 600 mSv (other agencies use 1,000 mSv). Prior career dose unknown, so only the mission dose is compared.',
    placeholders: ['The 480 mSv (80 %) warning level is a proposal in the Excel file.'], teamDecisions: ['Radiation is a ship-wide measurement.'],
    regions: ['body'], hazards: ['radiation'],
  },
  {
    id: 'SH-RAD-SPE', group: 'ship', label: 'Radiation: solar particle event dose', unit: 'mSv/event', inputs: ['speDoseMSv'],
    green: '<125', orange: '125 to <250', red: '≥250',
    basis: 'Agency standard', sourceRef: 'xlsx: Cabin & radiation!A10:G10',
    note: 'NASA limits the effective dose from any single solar particle event to 250 mSv.',
    placeholders: ['The 125 mSv (50 %) orange level is a proposal in the Excel file.'], teamDecisions: [], regions: ['body'], hazards: ['radiation'],
  },
  {
    id: 'SH-RAD-RATE', group: 'ship', label: 'Radiation dose rate', unit: 'mSv/day', inputs: ['doseRateMSvDay'],
    green: 'Within mission-planned rate', orange: 'Above mission-planned rate', red: 'Mission-defined alarm level',
    basis: 'Proposed', sourceRef: 'xlsx: Cabin & radiation!A11:G11',
    note: 'No numeric bands set (open item). ISS typically sees 0.2–0.5 mSv/day.', placeholders: [], teamDecisions: [], regions: [], hazards: ['radiation'],
  },

  // ---------------- Cross rules (from notes in the files) ----------------
  {
    id: 'X-HEADACHE-CO2', group: 'cross', label: 'New headache → check cabin CO₂', unit: '', inputs: ['symptoms', 'co2mmHg'],
    green: 'No headache reported', orange: 'Headache reported today: check cabin CO₂', red: '—',
    basis: 'Agency standard', sourceRef: 'xlsx: Crew health!E5 (NASA OCHMO-TB-004)',
    note: 'NASA data link headaches to CO₂ at about 2.8–4.5 mmHg.', placeholders: [], teamDecisions: [], regions: ['head'], hazards: ['environment'],
  },
  {
    id: 'X-POOR-SLEEP-TRAINING', group: 'cross', label: 'Poor sleep or fatigue → lighter training', unit: '', inputs: ['sleepHours', 'symptoms'],
    green: 'Sleep green and no fatigue', orange: 'Sleep orange/red or fatigue reported: reduce ARED loads by 10 % and shorten the run to 30 min', red: '—',
    basis: 'Proposed', sourceRef: 'training.txt (Step B, Daily Check-in bonus)',
    note: 'Prevents overtraining after a poor night.', placeholders: [], teamDecisions: [], regions: ['arms', 'legs'], hazards: ['gravity'],
  },
  {
    id: 'X-RED-ACTION', group: 'cross', label: 'Any red → crew surgeon review', unit: '', inputs: ['all rules'],
    green: 'No red indicator', orange: '—', red: 'Any single red indicator needs prompt review by the crew surgeon or mission control. With serious symptoms, treat as an emergency.',
    basis: 'Proposed', sourceRef: 'xlsx: Rules!B12', note: '', placeholders: [], teamDecisions: [], regions: [], hazards: [],
  },
];

export const ruleById = (id: string) => RULES.find((r) => r.id === id)!;
