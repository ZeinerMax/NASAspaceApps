// Builds src/data/generated/seed.json from the team's source JSON files in the repo root.
// The source files are READ ONLY: every fix below happens in memory and is logged in seed-report.json.
// See PLAN.md §4.1.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, '..', '..');
const outDir = join(here, '..', 'src', 'data', 'generated');
mkdirSync(outDir, { recursive: true });

const report = { generatedAt: new Date().toISOString(), fixes: [], warnings: [] };

function readJson(file, { repairTruncatedArray = false } = {}) {
  const path = join(repoRoot, file);
  const text = readFileSync(path, 'utf8');
  try {
    return JSON.parse(text);
  } catch (err) {
    if (!repairTruncatedArray) throw err;
    // Known problem: oxygen_saturation.json ends with "…}," and no closing bracket.
    const repaired = text.trimEnd().replace(/,\s*$/, '') + '\n]';
    const data = JSON.parse(repaired);
    report.fixes.push({
      file,
      fix: 'File is truncated (trailing comma, no closing "]"). Parsed by closing the array in memory.',
      effect: `${data.length} records read; missing records stay null.`,
    });
    return data;
  }
}

// eye_test.json is intentionally NOT loaded (team decision 2: eye category removed).
const sources = {
  bp: readJson('blood_presure.json'),
  hr: readJson('heart rate.json'),
  o2: readJson('oxygen_saturation.json', { repairTruncatedArray: true }),
  temp: readJson('body_temperature.json'),
  glucose: readJson('blood_sugar.json'),
  mass: readJson('body_mass.json'),
  sleep: readJson('sleep_hours.json'),
  mood: readJson('mood_score.json'),
  food: readJson('food_intake.json'),
  training: readJson('training_done.json'),
  symptoms: readJson('symptoms.json'),
};

// Known problem: stray key "same_id" in one body_mass record.
const strays = sources.mass.filter((r) => 'same_id' in r);
if (strays.length) {
  report.fixes.push({
    file: 'body_mass.json',
    fix: 'Ignored unknown key "same_id".',
    effect: `${strays.length} record(s): ${strays.map((r) => `${r.subject_id} ${r.day}`).join(', ')}`,
  });
}

// Known problem: typo "eva_spac_walk".
for (const r of sources.training) {
  if (r.training_type === 'eva_spac_walk') {
    report.fixes.push({
      file: 'training_done.json',
      fix: 'Renamed training_type "eva_spac_walk" to "eva_spacewalk".',
      effect: `${r.subject_id} ${r.day}`,
    });
    r.training_type = 'eva_spacewalk';
  }
}

const key = (r) => `${r.subject_id}|${r.day}`;
const index = {};
for (const [name, rows] of Object.entries(sources)) {
  index[name] = new Map();
  for (const r of rows) {
    if (index[name].has(key(r))) report.warnings.push(`${name}: duplicate record for ${key(r)}, first one kept`);
    else index[name].set(key(r), r);
  }
}

const num = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : null);
const flightDayOf = (day) => Number(String(day).replace(/^F/, ''));

// Crew and days come from the blood pressure file (complete: 4 x 20).
const entries = [];
for (const base of sources.bp) {
  const k = key(base);
  const get = (name) => index[name].get(k) ?? null;
  const o2 = get('o2');
  const tr = get('training');
  const sym = get('symptoms');
  const mood = get('mood');
  const food = get('food');
  const hr = get('hr');

  for (const name of Object.keys(sources)) {
    if (!get(name)) report.warnings.push(`${name}: no record for ${base.subject_id} FD${flightDayOf(base.day)} (value stays null)`);
  }

  const symptoms = (sym?.symptoms ?? []).filter((s) => s && s !== 'none');
  entries.push({
    id: `${base.subject_id}-FD${flightDayOf(base.day)}`,
    crewId: base.subject_id,
    flightDay: flightDayOf(base.day),
    date: null,
    source: 'seed',
    environment: base.environment,
    condition: base.condition,
    sleepHours: num(get('sleep')?.sleep_hours),
    mood: { score: num(mood?.mood_score), state: mood?.mood_state ?? null },
    symptoms,
    symptomsOther: null,
    food: { kcal: num(food?.calories_kcal), waterMl: num(food?.water_ml) },
    training: {
      type: tr?.training_type ?? 'none',
      minutes: num(tr?.duration_min),
      completed: typeof tr?.completed === 'boolean' ? tr.completed : null,
      restDay: false, // decided by the engine (approved rest day = every 7th flight day)
    },
    bp: { sys: num(base.sys), dia: num(base.dia), map: num(base.map) },
    hr: { bpm: num(hr?.hr_bpm), hrvMs: num(hr?.hrv_ms) },
    o2: { spo2Pct: num(o2?.spo2_pct), respRate: num(o2?.resp_rate) },
    tempC: num(get('temp')?.temp_c),
    glucoseMgDl: num(get('glucose')?.blood_sugar_mg_dl),
    massKg: num(get('mass')?.body_mass_kg),
  });
}
entries.sort((a, b) => a.crewId.localeCompare(b.crewId) || a.flightDay - b.flightDay);

// Optional ship-wide radiation data, added later by the team (PLAN.md §5.2).
let radiation = [];
if (existsSync(join(repoRoot, 'radiation.json'))) {
  radiation = readJson('radiation.json').map((r) => ({
    flightDay: flightDayOf(r.day),
    environment: r.environment ?? null,
    doseRateMSvDay: num(r.dose_rate_msv_day),
    missionDoseMSv: num(r.mission_dose_msv),
    speDoseMSv: num(r.spe_dose_msv),
  }));
  radiation.sort((a, b) => a.flightDay - b.flightDay);
} else {
  report.warnings.push('radiation.json not found in repo root: radiation tiles will show "No data yet".');
}

const seed = { entries, radiation };
writeFileSync(join(outDir, 'seed.json'), JSON.stringify(seed, null, 1));
writeFileSync(join(outDir, 'seed-report.json'), JSON.stringify(report, null, 2));
console.log(`seed: ${entries.length} entries, ${radiation.length} radiation days, ${report.fixes.length} fixes, ${report.warnings.length} warnings`);
