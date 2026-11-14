# PLAN: Astronaut Health Monitoring Dashboard (NASA Space Apps 2026)

> **Status: Phase 2 (plan), all team questions answered (14 Nov 2026). Waiting for "yes" to start building. No code has been written yet.**
> This file is the hand-over document. A new session (human or AI) should be able to build the app from it alone, together with `INVENTORY.md`, which holds every source value, translation and data problem. **Read `INVENTORY.md` first.** Where this plan and `INVENTORY.md` differ, **this plan wins** (it contains the team's decisions).
> Hard rules: never edit or move the original repo files (`*.json`, `*.xlsx`, `*.txt`, `*.odt`, `NASA mascot/*`). The team will commit fixes to the originals later. All app code lives in `app/`.

> **UI update (14 Nov, after the first build): the interface was simplified. This note overrides §6 (3D body) and §9 (screens).**
> Landing page = one crew member at a time (selector on top) + a compact SIMULATED ship strip, all in one window; ship details open from that strip.
> Detail view = tabs *Details | Trends | Problems* (no ship information). **Rules** moved to the header, next to Data.
> The 3D body is replaced by the team's anatomy images (`male_body_anatomy.jpg`, `femal_body_anatomy.jpg`) with colour overlays
> on the affected organs (orange / red); all positions live in `app/src/components/body/bodyConfig.ts`. No demo mode, no scan animation.
> Trends: no personal-range band; every point is a filled dot coloured by status. The mascot can be hidden (remembered for the session).

---

## 1. Goal and requirements

Build a visually striking, informative **website** that acts as a health-monitoring dashboard for 4 astronauts. It is **decision support only**: not diagnostic, not predictive, and not a replacement for the flight surgeon.

Requirements combine the team brief, the team structure document (`Hackathon important files problems adn structure.odt`, "the .odt") and the team's answers (§13):

| # | Feature | Summary |
|---|---|---|
| 1 | Crew overview | Start screen = a **dashboard of all 4 crew** (F01, F02, M01, M02), with their 20 days of data visible: overall status, mini body, key values and sparklines. Click a crew member to open their detail view. |
| 2 | 3D body map | Interactive stylised 3D body with clickable regions coloured green / orange / red (grey = no data). Click → panel with status, measurements, trend, problems and actions. An optional **five-hazard view** toggle (.odt). |
| 3 | Daily check-in | **One full scan per day**, at the start of the day: all measurements and answers (sleep, mood, symptoms, training, food and water, BP, HR, SpO₂/resp rate, temperature, glucose, body mass). Every field has "How to measure". On submit, statuses are recalculated and alerts appear immediately. |
| 4 | Trends | A chart per indicator against the personal (rolling) baseline, with orange and red zones shaded; updates live. |
| 5 | Rules tab | Every rule: what triggers orange and red, the data it uses, and its status **OK / watch / firing**. No machine learning. |
| 6 | Problems and solutions | The .odt problem list and responses, the five-hazard prevention text and the indicator meanings, translated and linked to body regions and rules. **The eye/vision category is removed.** |
| 7 | Ship feed | **Simulated** live CO₂ and cabin air (temperature, humidity, PIO₂, pressure, diluent), plus radiation. Labelled "SIMULATED". **Crew radiation dose data will be added by the team later** (§5.2). |
| 8 | Mascot | Dr. Biscuit reacts to the status, explains things in a speech bubble and guides the check-in and how-tos. The team will add missing images later. |
| 9 | Storage | Seed from repo JSON (via a build script, fixes in memory only); new entries in `localStorage`; Export JSON / Import JSON / Reset to seed. |
| 10 | Actions | For every warning: **rest, re-measure, or contact the flight surgeon**, plus a note that ground contact may be delayed (.odt part 5). |
| 11 | Explanations | For each indicator: what it means, how to measure it, and why the risk matters (.odt part 6). |
| 12 | Disclaimer | Always visible (text in §9). |

**No demo mode.** The live dashboard with the real 20-day seed data is the demo, and F02's last days already show the full orange → red flow. New data is added through the daily check-in.

Design: dark space theme, strong colour coding, smooth animations, readable on a projector (minimum 18 px body text, high contrast). Colours: **green / orange / red** (+ grey for no data).

---

## 2. Tech stack (decided)

| Part | Choice | Why |
|---|---|---|
| Build / dev server | **Vite 5** | Zero-config, instant reload, static output (works offline on a laptop at the venue). |
| UI | **React 18 + TypeScript 5** | Many interactive screens sharing state; types catch data-shape errors when 4 people and an AI work in parallel. |
| 3D | **three + @react-three/fiber 8 + @react-three/drei 9** | The simplest good way to do clickable, colour-animated 3D inside React. |
| Charts | **Recharts 2** | Declarative, supports shaded zones and baseline bands. |
| State | **Zustand 5** (with `persist` → localStorage) | Tiny, one store file. |
| Animation | **framer-motion 11** | Panel, alert and mascot transitions. The installed `design-motion-principles` skill (in `C:\VS\Claude\.agents\skills`) can guide motion choices. |
| Tests | **Vitest 2** | The rules engine is pure functions, tested against the seed data. |
| Seed conversion | Plain Node script (`.mjs`) | Reads repo JSON, fixes known problems **in memory**, writes the app seed. |

No backend, no database, no API keys. Node v24 and npm 11 are installed.

Pinned versions for `app/package.json`:
```json
{
  "name": "astro-health-dashboard",
  "private": true,
  "type": "module",
  "scripts": {
    "seed": "node scripts/build-seed.mjs && node scripts/copy-assets.mjs",
    "dev": "npm run seed && vite",
    "build": "npm run seed && tsc -b && vite build",
    "preview": "vite preview",
    "test": "vitest run"
  },
  "dependencies": {
    "@react-three/drei": "9.114.0",
    "@react-three/fiber": "8.17.10",
    "framer-motion": "11.11.9",
    "react": "18.3.1",
    "react-dom": "18.3.1",
    "recharts": "2.13.0",
    "three": "0.169.0",
    "zustand": "5.0.0"
  },
  "devDependencies": {
    "@types/react": "18.3.11",
    "@types/react-dom": "18.3.1",
    "@types/three": "0.169.0",
    "@vitejs/plugin-react": "4.3.2",
    "typescript": "5.6.3",
    "vite": "5.4.9",
    "vitest": "2.1.3"
  }
}
```

Commands (from the repo root):
```
cd app
npm install
npm run dev      # builds the seed, copies mascot images, starts http://localhost:5173
npm test         # rules-engine tests
npm run build    # static site in app/dist (open with: npm run preview)
```

---

## 3. Folder and file structure

```
NASAspaceApps/                      (repo root: original files stay untouched)
├── INVENTORY.md, PLAN.md
├── *.json, *.xlsx, *.txt, *.odt, NASA mascot/   ← SOURCE, read-only
├── (later) radiation data file from the team    ← optional, see §5.2
└── app/
    ├── package.json, vite.config.ts, tsconfig.json, index.html, README.md
    ├── scripts/
    │   ├── build-seed.mjs          reads ../*.json → src/data/generated/seed.json + seed-report.json
    │   └── copy-assets.mjs         copies ../NASA mascot/* → public/mascot/ (clean names, §8)
    ├── public/mascot/              (generated; git-ignored)
    └── src/
        ├── main.tsx, App.tsx       app shell: header, tabs, alert layer, mascot, disclaimer
        ├── types.ts                shared types (§4)
        ├── data/
        │   ├── generated/seed.json         (generated; git-ignored)
        │   ├── crew.ts             crew list + team-decided values (age, plans)
        │   ├── rules.ts            ALL thresholds with Excel cell refs and team overrides (§5)
        │   ├── symptoms.ts         symptom codes → label, level, region (§5.4)
        │   ├── regions.ts          body regions → rule ids, symptoms, problems (§6.2)
        │   ├── hazards.ts          five hazards → prevention text, rule ids (§6.4)
        │   ├── problems.ts         problems and responses (translated, §7)
        │   ├── explanations.ts     indicator meaning + how-to (§7.3)
        │   └── mascot.ts           status/context → image + line (§8)
        ├── engine/                 PURE functions, no React. Unit-tested.
        │   ├── units.ts            mg/dL → mmol/l, ml → L
        │   ├── baseline.ts         rolling mean ± 2 SD per crew and indicator
        │   ├── evaluate.ts         one function per rule → RuleResult
        │   ├── aggregate.ts        rule results → region, overall and hazard status
        │   ├── actions.ts          status → next step
        │   └── __tests__/
        ├── store/
        │   ├── useAppStore.ts      selected crew, user entries, ship feed
        │   └── io.ts               export / import / reset
        ├── sim/shipFeed.ts         simulated ship sensors
        ├── components/
        │   ├── layout/             Header, Tabs, DisclaimerBar, SimulatedBadge
        │   ├── crew/CrewOverview.tsx, CrewCard.tsx
        │   ├── body/               BodyScene.tsx, StylizedBody.tsx, GltfBody.tsx (stub), RegionPanel.tsx, HazardToggle.tsx
        │   ├── checkin/            CheckInWizard.tsx, Field.tsx, HowToModal.tsx, SymptomPicker.tsx
        │   ├── trends/             TrendGrid.tsx, TrendChart.tsx
        │   ├── rules/RulesTab.tsx
        │   ├── problems/ProblemsTab.tsx
        │   ├── ship/ShipPanel.tsx
        │   ├── alerts/AlertCenter.tsx
        │   └── mascot/Mascot.tsx, SpeechBubble.tsx
        └── styles/theme.css
```

Team split suggestion: (1) engine + data files, (2) 3D body + region panel, (3) check-in + trends, (4) crew overview, ship feed, rules and problems tabs, mascot and styling.

---

## 4. Data model

### 4.1 Seed conversion (`scripts/build-seed.mjs`)
Reads these repo JSON files: blood_presure, heart rate, oxygen_saturation, body_temperature, blood_sugar, body_mass, sleep_hours, mood_score, food_intake, training_done and symptoms. **`eye_test.json` is not loaded** (eye category removed). The script merges them by `(subject_id, day)` into one `DailyEntry` per crew per day (4 × 20 = 80) and **fixes known problems in memory only**, logging each fix in `seed-report.json`:

1. `oxygen_saturation.json`: strip the trailing comma and append `]` before parsing. F02 FD18–20 have **no** SpO₂ or resp rate (they stay `null` → grey "no data").
2. `body_mass.json`: ignore the unknown key `same_id`.
3. `training_done.json`: `eva_spac_walk` → `eva_spacewalk`.
4. Flight days become numbers (`"F07"` → `7`) so they never clash with crew ids `F01`/`F02`. The UI shows "FD 7".

### 4.2 Types (`src/types.ts`)

```ts
export type Status = 'green' | 'orange' | 'red' | 'grey' | 'info';
// grey = missing or not evaluable (Excel Rules: "never green"); info = shown, but no threshold exists

export type Condition = 'resting' | 'post_exercise' | 'eva' | 'critical';

export interface CrewMember {               // src/data/crew.ts
  id: 'F01' | 'F02' | 'M01' | 'M02';
  sex: 'male' | 'female';
  displayName: string;                      // "Crew member F01" etc. (team decision)
  ageYears: number;                         // team decision: F01 32, F02 35, M01 35, M02 38 (display only)
  plannedKcalPerDay: number;                // team decision: the crew member's normal intake in the JSON (M 2600, F 2300)
  plannedTrainingMin: number;               // 60 (the normal session in the JSON)
  priorCareerDoseMSv: number | null;        // null until the team adds radiation data
}

export interface DailyEntry {
  id: string;                               // `${crewId}-FD${flightDay}`, or uuid for user entries
  crewId: CrewMember['id'];
  flightDay: number;                        // seed: from "day"; new entries: last + 1
  date: string | null;                      // ISO date for user entries; null for seed
  source: 'seed' | 'user';
  environment: string;                      // Spacecraft | Space_Station | Lunar_Base | Rover
  condition: Condition;
  sleepHours: number | null;                // sleep_hours.json
  mood: { score: number | null; state: string | null };            // mood_score.json
  symptoms: string[];                       // symptoms.json codes; ['none'] → []
  symptomsOther: string | null;             // free text (user entries)
  food: { kcal: number | null; waterMl: number | null };           // food_intake.json
  training: { type: string; minutes: number | null; completed: boolean | null; restDay: boolean }; // training_done.json
  bp: { sys: number | null; dia: number | null; map: number | null };          // blood_presure.json
  hr: { bpm: number | null; hrvMs: number | null };                            // heart rate.json
  o2: { spo2Pct: number | null; respRate: number | null };                     // oxygen_saturation.json
  tempC: number | null;                     // body_temperature.json
  glucoseMgDl: number | null;               // blood_sugar.json (engine converts to mmol/l)
  massKg: number | null;                    // body_mass.json
}

export interface Baseline {                 // engine/baseline.ts (§5)
  crewId: string; indicator: 'sys' | 'dia' | 'hr' | 'tempC' | 'glucoseMmol' | 'spo2';
  mean: number; sd: number; low: number; high: number;   // mean ∓ 2 SD
  n: number; fromFlightDay: number; toFlightDay: number;
}

export interface Rule {                     // src/data/rules.ts
  id: string; group: 'crew' | 'ship' | 'cross';
  label: string; unit: string; inputs: string[];
  green: string; orange: string; red: string;  // readable text for the Rules tab
  basis: 'Agency standard' | 'Published research' | 'Clinical reference' | 'Proposed' | 'Team decision';
  sourceRef: string;                        // e.g. 'xlsx: Crew health!A3:G3'
  note: string;
  placeholders: string[];                   // each ends with the verify label
  regions: RegionId[]; hazards: HazardId[];
}

export interface RuleResult {
  ruleId: string; status: Status;
  value: number | string | null; valueLabel: string;
  reason: string;                           // one sentence: why this colour
  ruleState: 'OK' | 'watch' | 'firing';     // green/info → OK, orange/grey → watch, red → firing
  flags: string[];                          // 'TREAT_NOW', 'CHECK_CO2', 'REDUCE_TRAINING'
}

export interface Problem {
  id: string; title: string; system: string;
  regions: RegionId[]; ruleIds: string[]; hazardIds: HazardId[];
  whatItIs: string; response: string | null; prevention: string | null; source: string;
}

export interface ShipReading {
  t: number; co2mmHg: number; co2Avg7d: number; cabinTempC: number; rhPct: number;
  pio2mmHg: number; pressureKPa: number; diluentPct: number;
  doseRateMSvDay: number | null; missionDoseMSv: number | null; speEventMSv: number | null;
  simulated: true;
}

export interface StoredState {              // localStorage key 'astroHealth.v1'
  version: 1;
  userEntries: DailyEntry[];                // seed is never stored; always re-loaded from seed.json
  lastCheckInDate: Partial<Record<CrewMember['id'], string>>;   // one check-in per crew per calendar day
}
```

Export = `StoredState` + `{ exportedAt, app: 'astro-health-dashboard' }` as a `.json` download. Import validates `version === 1` and the shapes. Reset clears the key (after a confirm dialog).

---

## 5. Warning logic (rules engine)

General rules (Excel `Rules` sheet + team decisions):
- The **latest** entry decides the current status. History windows count entries, including today's.
- **Missing → grey, never green.**
- **Readings during `eva` or `post_exercise` are not rated** against resting thresholds: grey, "exercise reading, re-measure at rest". **`critical` readings are rated as resting.** (Team decision 9.)
- **Symptom precedence:** a red symptom makes the symptom rule red and forces the overall status to red.
- Boundaries: "to <X" excludes X; "to X inclusive" includes X.
- Flight phase: `in-flight` (all data is in flight).
- **"Repeatedly" / persistence (team decision 15):** a single out-of-band value is **orange**; if it stays out of band on **≥3 of the last 7 days** (Excel's definition of "repeatedly"), it turns **red**. This applies to sleep, food and training, and it fills the Excel gaps.

**Baseline (team decision 10, rolling).** For the entry on flight day *d*, the personal range for sys, dia and HR (and the trend band for temperature, glucose and SpO₂) is **mean ± 2 SD of all `resting` readings in the 20 flight days before *d*, ignoring FD1–6** (Excel: start about flight day 7). It needs at least 7 readings (Excel Rules!B6). With fewer, HR uses the Excel fallback 60–100 and BP uses only the absolute limits. New check-ins therefore update the baseline the next day. Today's reading is never part of its own baseline.

### 5.1 Crew rules

| Id | Region | Input → value | GREEN | ORANGE | RED | Source |
|---|---|---|---|---|---|---|
| CH-SLEEP | head | `sleepHours` | 7–9 | 6 to <7, or >9, or a single night <6 | <6 on ≥3 of last 7 nights | Crew health!3 + decision 15 |
| CH-MOOD | head | `mood.score` | 7–10 | 4 to <7 | <4 | Crew health!4 |
| CH-SYMPTOMS | per symptom (§5.4) | `symptoms[]` | none | any orange-level symptom | any red-level symptom (overrides everything) | Crew health!5, Rules!B9 |
| CH-FOOD | abdomen | `kcal / plannedKcal × 100` | ≥90 % | 75 to <90 %, or a single day <75 % | <75 % on ≥3 of last 7 days | Crew health!6; **plan = normal JSON intake** (decision 3) |
| CH-WATER | abdomen | `waterMl / 1000` L | ≥2.5 | 2.0 to <2.5 | <2.0 | Crew health!7 |
| CH-TRAINING | arms, legs | `minutes / plannedTrainingMin × 100` ³ | ≥90 %, or the approved rest day | 50 to <90 %, or a single session <50 % (incl. a missed session = 0 %) | <50 % on ≥3 of last 7 planned sessions | Crew health!8 + decisions 4, 15 |
| CH-SYS | chest | `bp.sys` vs rolling baseline | inside personal range AND 90 to <140 | outside personal range, or 140–180, or <90 without dizziness/collapse | >180, or <90 with dizziness/collapse ¹ | Crew health!9 |
| CH-DIA | chest | `bp.dia` vs rolling baseline | inside personal range AND 60 to <90 | outside personal range, or 90–120, or <60 without dizziness/collapse | >120, or <60 with dizziness/collapse ¹ | Crew health!10 |
| CH-HR | chest | `hr.bpm` vs rolling baseline | inside personal range (60–100 if no baseline) | outside personal range | >120 or <40, or outside range with a red symptom | Crew health!11 |
| CH-TEMP | whole body | `tempC`, in-flight bands | 36.0–38.0 | 35 to <36, or >38.0 to <40 | <35 or ≥40 | Crew health!12 |
| CH-GLU | abdomen | `glucoseMgDl / 18.0` → mmol/l ² | 3.9–5.5 | 3.0 to <3.9 (**flag TREAT_NOW**), or >5.5 to <16.7, or a single ≥16.7 | <3.0, or ≥16.7 on 2 consecutive readings (Excel rule kept) | Crew health!13 |
| CH-MASS | arms, legs | `(baselineMass − massKg) / baselineMass × 100`, baseline = FD7 mass | <2 % | 2–5 % inclusive | >5 % | Crew health!14 |
| INFO-SPO2, INFO-RESP, INFO-HRV, INFO-MAP | chest | `o2.*`, `hr.hrvMs`, `bp.map` | — | — | — (status `info`: "No threshold in team files"; grey if missing) | gap |

¹ "Dizziness or collapse" = symptom codes `dizziness`, `severe_dizziness`, `collapse`, `unresponsiveness`, `loss_of_consciousness`.
² 1 mmol/l = 18.0 mg/dL (standard unit conversion). Seed fasting status is unknown; the panel shows that.
³ **Approved rest (team decision 4, adapted):** one rest day at a time is approved, matching the crew routine in the data (2 training days, then 1 rest day). A second day in a row without training counts as a missed session (0 %). An EVA counts as a completed session. Setting: `MAX_REST_DAYS_IN_A_ROW` in `crew.ts`. Effect on the seed: healthy crew are green on training for all 20 days; F02 is orange on FD19 and red on FD20.

**Removed (team decision 2):** the Excel vision row (Crew health!15), `eye_test.json`, the eyes region, the SANS problem and response R3. They are not shown anywhere.

Expected results on the seed (unit-test cases):
- **M01 FD20:** every rule green (training "rest day", SpO₂/HRV/MAP info) → **overall green**.
- **F02 FD18:** sleep 5.1 orange (1 of 7), mood 4 orange, SYS 96 orange (outside personal range ≈103–110), DIA 60 orange, HR 98 orange, food 1,800/2,300 = 78 % orange, water 1.8 L **red**, glucose 4.1 mmol green, mass 59.7 vs 60.8 = 1.8 % green, symptoms orange → **overall red** (water).
- **F02 FD20:** collapse/unresponsiveness → symptoms **red** (override); DIA 48 with collapse red; HR 144 red; temp 34.8 red; glucose 2.7 mmol red; sleep red (3 of 7 nights <6); mood 1 red; food 17 % orange (only 2 of 7 days <75 %); mass 4.9 % orange; SpO₂ grey (no data) → **overall red**.
- **M02 FD17:** SYS 124 just outside the rolling range → orange (expected; see risks).

### 5.2 Ship rules (simulated feed)

| Id | Value | GREEN | ORANGE | RED | Source |
|---|---|---|---|---|---|
| SH-CO2 | 1-h avg mmHg + 7-day avg | ≤3.0 AND 7-day ≤2.5 | >3.0 and <4.0, OR 7-day >2.5 | ≥4.0 (placeholder in the Excel file itself) | Cabin!3 |
| SH-CABIN-T | °C | 20–25 | 18 to <20, or >25 to 27 | <18 or >27 | Cabin!4 |
| SH-RH | % | 30–60 | 25 to <30, or >60 to 75 | <25 or >75 | Cabin!5 |
| SH-PIO2 | mmHg | 145–155 | 127 to <145, or >155 to 333 | <127 or >333 | Cabin!6 |
| SH-PRESSURE | kPa | **nominal band set so the simulated value is always inside** (team decision 7: the ship regulates it automatically) | outside nominal but inside 34.5–103 | ≤34.5 or >103 | Cabin!7 |
| SH-DILUENT | % | ≥30 | (none defined) | <30 | Cabin!8 |
| SH-RAD-CAREER | cumulative mission dose, mSv | <480 | 480 to <600 | ≥600 | Cabin!9 |
| SH-RAD-SPE | mSv per event | <125 | 125 to <250 | ≥250 | Cabin!10 |
| SH-RAD-RATE | mSv/day | — | — | — (`info`, no numbers in files) | Cabin!11 |

**Radiation (team decision 5):** radiation is measured **by the ship, not per crew member**: one ship-wide feed, like CO₂ and air quality. The team will add the data later. Until then, the radiation tiles are present but **empty**: grey "No data yet". The thresholds above are wired and ready. Radiation values are **not** simulated.
Expected file (optional; the build script reads it if present): `radiation.json` in the repo root, one record per flight day:
```json
[{ "day": "F01", "environment": "Spacecraft", "dose_rate_msv_day": 0.3, "mission_dose_msv": 0.3, "spe_dose_msv": 0 }]
```
`mission_dose_msv` is cumulative for the mission and is compared with the career limits. The tile says "mission dose; prior career dose unknown", because no crew has a prior-dose value. `spe_dose_msv` is 0 when there is no solar particle event. The script copies it into `seed.json` as `ship.radiation[]`; the app shows the latest day and a trend chart on the Ship tab.

**Simulator** (`sim/shipFeed.ts`): ticks every 2 s with a small, clamped random walk that **always stays inside green**. Start values come from figures in the Excel notes: CO₂ 2.0 mmHg, cabin 22.5 °C, RH 45 %, PIO₂ 150 mmHg ("about 150"), pressure 101 kPa ("at 101 kPa"), diluent 79 % (21 % O₂). Nominal pressure band = 101 ± 1 kPa (team decision 7, marked "Team decision: ship-regulated value, simulated"). On start it creates a 7-day CO₂ history so the 7-day average exists. Every ship tile shows a **SIMULATED** badge. The ship engine is fully implemented, so real values that leave green would still show orange or red with the response from R8.

### 5.3 Cross rules (from file notes)

| Id | Trigger | Effect | Source |
|---|---|---|---|
| X-HEADACHE-CO2 | `headache` or `mild_headache` today | Alert "New headache: check cabin CO₂"; highlight the CO₂ tile | Crew health!E5 |
| X-POOR-SLEEP-TRAINING | CH-SLEEP orange/red, or `fatigue`/`mild_fatigue`/`slight_exhaustion` | "Reduce ARED loads by 10 % (×0.90) and shorten the treadmill run to 30 min today" | training.txt |
| X-RED-ACTION | any rule red | "Prompt review by the crew surgeon or mission control. With serious symptoms, treat as an emergency." | Rules!B12 |

### 5.4 Symptom catalogue (`data/symptoms.ts`)

| Code | Label | Level | Region |
|---|---|---|---|
| space_adaptation_syndrome | Space adaptation sickness | orange | head |
| mild_headache / headache | (Mild) headache | orange | head |
| dizziness / severe_dizziness | (Severe) dizziness | orange (feeds the BP rule ¹) | head |
| nausea | Nausea | orange | abdomen |
| mild_fatigue / fatigue / slight_exhaustion / weakness | Fatigue / exhaustion / weakness | orange | whole body |
| muscle_soreness | Muscle soreness | orange | arms, legs |
| severe_hypotension | Very low blood pressure (reported) | orange (the BP rule decides red) | chest |
| collapse / unresponsiveness | Collapse / unresponsive | **red** | head, whole body |
| *new:* chest_pain, marked_breathlessness | Chest pain / marked breathlessness | **red** | chest |
| *new:* loss_of_consciousness | Loss of consciousness | **red** | head, whole body |
| *new:* sudden_vision_loss | Sudden vision loss | **red** (Excel red-flag symptom, kept by team) | head |
| *new:* urinary_discomfort | Urinary discomfort | orange (proposal) | abdomen (kidneys) |
| *new:* tooth_pain | Tooth pain | orange (proposal) | head |
| *new:* digestive_upset | Digestive upset | orange (proposal) | abdomen |

"New" codes come from the Excel red-symptom list and the .odt problem list. Orange levels for urinary, tooth and digestive symptoms are proposals *(placeholder, verify against NASA Human Research Program or other space agency sources)*.

---

## 6. 3D body

### 6.1 Approach
- **Built in code from primitives** (`StylizedBody.tsx`): capsules, spheres and rounded boxes, so **no third-party model and no licence**. It has a translucent "hologram" look: emissive colour = status, a soft pulse on orange and a faster pulse on red, and an edge glow.
- Two proportion presets (`male` / `female`). `<OrbitControls>` with limited zoom and idle auto-rotate. Hover → outline + tooltip; click → `RegionPanel`. A scan-line sweep runs after each check-in.
- **Swappable:** `BodyScene` only depends on `interface BodyModelProps { sex: 'male'|'female'; regionStatus: Record<RegionId, Status>; selected: RegionId|null; onSelect(id: RegionId): void; }`. `GltfBody.tsx` is a ready stub that loads a `.glb` and colours meshes whose **names equal the RegionIds**. To swap, export a model with those mesh names, put it in `public/models/`, and change one import. Any outside model must be CC0/CC-BY, with its licence recorded in `app/README.md`.

### 6.2 Regions (team decision 11)

| RegionId | Mesh | Rules | Problems (.odt) |
|---|---|---|---|
| `head` | head | CH-MOOD, CH-SLEEP, head symptoms | Balance / space sickness (R4); Sleep: insomnia, fatigue, stress (R6); headaches; **dental** |
| `chest` | upper torso | CH-SYS, CH-DIA, CH-HR, INFO-SPO2/RESP/HRV/MAP | Heart: low blood pressure (R1) |
| `abdomen` | lower torso | CH-FOOD, CH-WATER, CH-GLU, `urinary_discomfort` | Digestive problems; **kidneys: UTI, kidney stones (R5)** |
| `arms` | both arms | CH-TRAINING, CH-MASS | Muscle and bone loss (R2) |
| `legs` | both legs | CH-TRAINING, CH-MASS | Muscle and bone loss (R2) |
| `body` | aura around the whole figure | CH-TEMP, whole-body symptoms | Infection (R9); radiation cancer risk (→ ship tab, R7) |

Region status = worst of its rules: red > orange > grey > green (`info` ignored). Overall status = worst across all regions and ship rules.

### 6.3 Region panel
Status chip and reason → each rule's value vs baseline and thresholds → a 20-day sparkline (link to Trends) → problems for this region (title, what it is, response, prevention, source) → **Action** box (§6.5) → "How to measure" buttons.

### 6.4 Five-hazard view (toggle, .odt part 3)
Five hazard cards or rings around the body, each with the worst status of its rules and the translated prevention text from `prevence 5 problémů.txt`:
radiation → SH-RAD-* · isolation → CH-MOOD, CH-SLEEP · distance from Earth → `info` card with prevention text and the ground-contact note · altered gravity → CH-SYS, CH-DIA, CH-HR, CH-MASS, CH-TRAINING, `space_adaptation_syndrome` · hostile closed environment → CH-TEMP, SH-CO2, SH-PIO2, SH-CABIN-T, SH-RH, SH-PRESSURE, SH-DILUENT. *(Mapping is a proposal: placeholder, verify…)*

### 6.5 Actions (`engine/actions.ts`, .odt part 5)

| Status | Next step shown | Source |
|---|---|---|
| grey | "**Re-measure**", or "measure at rest" for exercise readings | Rules!B8 |
| orange | "**Rest and re-measure** at the next check-in" + matching response and prevention | .odt part 5 |
| orange + TREAT_NOW (glucose 3.0 to <3.9) | "Low blood sugar: treat now, re-measure, inform the Crew Medical Officer". *Treatment details not in our files (placeholder, verify…)* | Crew health!C13 |
| red | "**Contact the flight surgeon / mission control now** for prompt review" | Rules!B12 |
| red symptom | "**Treat as an emergency**: follow the onboard medical protocol and alert the Crew Medical Officer" | Rules!B12, AI measure.txt |

Ground-contact note under every red action: *"Contact with Earth may be delayed or unavailable. Act on the onboard medical protocol first; the crew is trained for this, and the ship carries diagnostics, telemedicine and a pharmacy."* (from "Distance from Earth"; wording needs verification, .odt).

---

## 7. Content

### 7.1 Problems (`data/problems.ts`)
From the .odt (INVENTORY §4.1–4.2), **without the vision/SANS item and R3**: low BP → R1; balance / space sickness → R4; kidneys (UTI, stones) → R5; sleep/stress → R6; radiation cancer risk → R7; common issues (headache → X-HEADACHE-CO2, digestive, dental). Also: muscle and bone loss → R2; infection → R9 (CH-TEMP); cabin O₂/CO₂ → R8. "What it is" text comes from the prevence indicator table and the Excel notes. **Use only translated file text.**

### 7.2 Problems tab
Cards grouped by body system with the region icon, linked rules and live status, response, prevention and source file. A filter: "only problems linked to active warnings".

### 7.3 Explanations and how-tos (`data/explanations.ts`)
For each indicator: **What it means** (prevence table / Excel notes), **Why the risk matters**, and **How to measure** in the 7-heading structure from `AI measure.txt`. Equipment names come from `AI measure.txt` (Actiwatch, CEVIS, T2, ARED, SLAMMD, …) and conditions from Excel Rules!B10. **All step-by-step text is a draft** and shows the tag **"Needs verification"**. That includes SpO₂/resp rate, which no file covers.

---

## 8. Mascot (`data/mascot.ts`)

`copy-assets.mjs` copies the originals to `public/mascot/` with clean names: `default.png` (Dr._Biscuit.png), `good.jpg`, `alarm.jpg` (scared = shocked), `sick.jpg`, `sleep.jpg`, `workout.jpg`, `drink.jpg`, `measure.jpg`. The mapping lives in one file, so new images (team decision 12) drop in by adding a file and one line.

| Situation | Image | Example line |
|---|---|---|
| Start, crew overview, neutral | default | "Hi, I'm Dr. Biscuit. Pick a crew member or start today's check-in." |
| Overall green | good | "All systems green. Great work!" |
| Overall orange | alarm (until a "worried" image is added) | "Something needs a closer look. Tap the orange area." |
| Overall red | alarm | "Red alert: contact the flight surgeon now." |
| Red with a symptom or temperature rule | sick | "You're not feeling well. Follow the medical protocol." |
| Check-in steps: sleep / training / food and water / BP and HR | sleep / workout / drink / measure | Short guidance per step |
| Other how-tos | default | — |

The JPGs have white backgrounds, so they are shown inside a light rounded "ID-card" frame. The original art is unchanged. Motion respects `prefers-reduced-motion`.

---

## 9. Screens and flow

1. **Crew overview (start screen):** 4 large cards (F01, F02, M01, M02). Each shows the overall status, a small static body silhouette with region colours, the current flight day, the latest key values (sleep, mood, BP, HR, temp, glucose, mass) with 20-day sparklines, active alerts, and a "Daily check-in" button (disabled once done today). Ship tiles sit along the bottom, and the mascot reacts to the worst crew status.
2. **Crew detail:** header (crew, flight day, check-in button, Export/Import/Reset menu) · **left:** 3D body + hazard toggle · **right:** region panel or summary of active alerts · tabs: **Body | Trends | Rules | Problems & Solutions | Ship** · mascot in the corner · back to overview.
3. **Check-in wizard:** step-by-step cards with mascot guidance and a "How to measure" link on each field. It covers every field of `DailyEntry`. One check-in per crew per calendar day; a second attempt shows "Already done today". Submitting runs the engine → scan animation on the body → `AlertCenter` shows new orange/red items with actions. The new day appears in every chart and in the overview.
4. **Trends:** chart grid. Each chart has a line, a rolling baseline band (mean ± 2 SD), shaded orange/red zones, hollow markers for exercise readings, and user-entered points marked differently from seed points.
5. **Rules tab:** a table grouped Crew / Ship / Cross: rule, green/orange/red text, inputs, current value, **OK / watch / firing**, basis, source cell, placeholder or team-decision tags.
6. **Disclaimer** (fixed footer): *"Prototype for decision support only. Not a diagnostic or predictive tool and not a replacement for flight surgeon judgement. Colours mark the priority of a check, not a diagnosis. Thresholds are a prototype working table, not a validated NASA alarm protocol."*

---

## 10. Build order

| # | Step | Done when |
|---|---|---|
| 1 | Scaffold `app/` (Vite React-TS, pinned `package.json`, `.gitignore` for `node_modules`, `dist`, `public/mascot`, `src/data/generated`), theme CSS | `npm run dev` shows a dark page titled "Astronaut Health Monitor" |
| 2 | `build-seed.mjs` + `copy-assets.mjs` | `seed.json` has 80 entries; `seed-report.json` lists the 3 fixes; F02 FD18–20 SpO₂ = null; 8 images in `public/mascot`; `git status` shows **no changes** to the original files |
| 3 | `types.ts`, `crew.ts`, `units.ts`, `baseline.ts` (rolling) + tests | `npm test` passes; F02's baseline for FD18 has SYS range ≈103–110; a new entry shifts the next day's baseline |
| 4 | `rules.ts` + `symptoms.ts` with cell refs and team-decision tags | Every Excel row except Crew health!15 has a rule; ids tested |
| 5 | `evaluate.ts` (crew rules) + tests | The 4 expected cases in §5.1 pass; boundary and persistence tests pass (1 bad night = orange, 3 of 7 = red) |
| 6 | `aggregate.ts`, `actions.ts`, region and hazard maps | F02 FD20 → head, chest and body red; M01 FD20 → all green |
| 7 | Store + `io.ts` | An entry survives reload; export → import round-trips; reset returns to seed |
| 8 | Crew overview screen + shell, tabs, disclaimer | All 4 crew visible with correct overall colours (F02 red, others green or orange as computed); disclaimer on every screen |
| 9 | 3D body | Rotates; correct colours for M01 and F02; hover and click work; smooth on a laptop |
| 10 | Region panel | Clicking `chest` on F02 shows BP/HR values, reasons, R1 and "Contact the flight surgeon now" |
| 11 | Trends tab | Every indicator charted with baseline band and zones |
| 12 | Check-in wizard + how-to modal + one-per-day lock | A check-in adds a point to every chart, updates the overview, recolours the body and shows alerts; a second one the same day is blocked |
| 13 | Rules tab + Problems & Solutions tab | OK/watch/firing matches current data; problems link to regions and rules; no eye/vision content anywhere |
| 14 | Ship feed + ship and cross rules + empty radiation tiles + optional radiation loader | Tiles update every 2 s with a SIMULATED badge and stay green; radiation shows "No data yet"; a headache check-in highlights CO₂ |
| 15 | Mascot + speech bubble | The image and line change with status and per check-in step |
| 16 | Five-hazard toggle | 5 hazard cards with correct statuses and prevention text |
| 17 | Polish + README | Readable from 3 m (min 18 px); README covers run/test/build, data flow, model swap, placeholders and how to add mascot images and radiation data |

Report progress after each step.

---

## 11. Risks

- **Narrow baselines:** the smooth synthetic data gives tight ±2 SD ranges, so some ordinary days turn orange (e.g. M02 FD17 systolic 124). It's explainable; mention it in the pitch.
- **Rolling baseline drift:** a slowly worsening crew member slowly pulls their own baseline along. The absolute limits (BP 90/140, HR 40/120) still catch extremes.
- **Sleep orange is common** (Excel: ISS crews average about 6 h).
- **Medical credibility:** every non-file value is tagged as a placeholder or "Team decision". The disclaimer is permanent.
- **localStorage** is per browser. Use Export before switching machines at the venue.

## 12. Decisions made (checklist)

- [x] Stack: Vite + React + TypeScript + react-three-fiber/drei + Recharts + Zustand + framer-motion + Vitest
- [x] 3D body built from primitives (no licence issue), swappable via `GltfBody`
- [x] Repo JSON → build-time seed (in-memory fixes only; the team commits fixes to the originals later) + localStorage + Export/Import/Reset
- [x] Ship feed simulated, always green, labelled SIMULATED; radiation is a ship-wide feed, empty until the team adds `radiation.json`
- [x] Approved rest = one rest day at a time (routine: 2 training days, 1 rest day); a 2nd rest day in a row = missed session. Exercise/EVA readings and FD1–6 mass are shown as "not rated" (blue), not as missing data
- [x] Ages: F01 32, F02 35, M01 35, M02 38
- [x] Mascot: Dr. Biscuit as guide and reactor; the team adds missing images later
- [x] **One full scan per day** at the start of the day (all measurements)
- [x] Colours green / orange / red; grey = no data; `info` = no threshold
- [x] Eye test and vision problems removed
- [x] Food plan = each crew member's normal JSON intake (Excel food bands applied as % of that)
- [x] Crew names "Crew member F01/F02/M01/M02"
- [x] Cabin pressure nominal band set so the regulated value is always normal
- [x] Exercise/EVA readings not rated; `critical` rated as resting
- [x] Rolling 20-day baseline, updated by new check-ins
- [x] Dental problems under the head region; kidney problems under the abdomen; sudden vision loss kept as a red symptom (head)
- [x] No demo mode: a 4-crew dashboard with full seed data + daily check-ins
- [x] Single out-of-band day = orange; ≥3 of last 7 days = red
- [x] Original repo files are never modified; all code in `app/`

## 13. Team answers (14 Nov 2026)

| # | Topic | Team answer | Status |
|---|---|---|---|
| 1 | Check-in cadence | One full scan every day | Done |
| 2 | Eye test | Remove the eye category and its problems (edema grading: none/trace green, mild orange, severe red; no longer used) | Done |
| 3 | Food plan | Adjust so normal JSON intake is normal → plan = each crew member's normal intake | Done |
| 4 | Training rest days | Adapted (14 Nov): one rest day at a time is approved, matching the crew routine in the data (2 training days, then 1 rest day); a 2nd day in a row without training = missed session | Done |
| 5 | Radiation | Ship-wide measurement (like CO₂); team adds `radiation.json` later; empty until then | Done |
| 6 | Names / age | "Crew member F01" etc.; ages F01 32, F02 35, M01 35, M02 38 | Done |
| 7 | Cabin pressure | Set the range so it is always normal (ship-regulated) | Done |
| 8 | Colour | Orange | Done |
| 9 | Exercise / critical readings | Yes | Done |
| 10 | Baseline | Rolling, updated by new check-ins (20 days of data) | Done |
| 11 | Regions | Yes; teeth under head, kidneys under abdomen; sudden vision loss kept as red symptom | Done |
| 12 | Mascot | Missing images added later | Done |
| 13 | Demo | No demo mode; 4-crew dashboard with data + daily check-ins | Done |
| 14 | Source fixes | In memory only; team commits fixes later | Done |
| 15 | Single bad day | Orange; red when it persists (≥3 of 7 days) | Done |

**Nothing open. Ready to build on the team's "yes".**
