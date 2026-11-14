// Daily check-in: ONE full scan per crew member per day, at the start of the day (team decision 1).
// Every field has "How to measure". On submit the entry is stored, statuses are recalculated and results shown.
import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { CrewId, DailyEntry } from '../../types';
import { crewById } from '../../data/crew';
import { SYMPTOMS } from '../../data/symptoms';
import { MASCOT_IMAGES, type MascotImage } from '../../data/mascot';
import { todayIso, useAppStore } from '../../store/useAppStore';
import { buildHistory } from '../../store/useCrewView';
import { Modal } from '../common';
import HowToModal from './HowToModal';

type NumKey = 'sleep' | 'mood' | 'kcal' | 'water' | 'minutes' | 'sys' | 'dia' | 'hr' | 'spo2' | 'resp' | 'temp' | 'glucose' | 'mass';

interface FieldDef { key: NumKey; label: string; unit: string; min: number; max: number; step: number; howTo: string; placeholder?: string }

// Plausible input ranges (input sanity checks only, NOT health thresholds).
const F: Record<NumKey, FieldDef> = {
  sleep: { key: 'sleep', label: 'Sleep last night', unit: 'h', min: 0, max: 16, step: 0.1, howTo: 'sleep', placeholder: '7.5' },
  mood: { key: 'mood', label: 'Mood score', unit: '1–10', min: 1, max: 10, step: 0.5, howTo: 'mood' },
  kcal: { key: 'kcal', label: 'Food eaten yesterday', unit: 'kcal', min: 0, max: 8000, step: 10, howTo: 'food', placeholder: '2400' },
  water: { key: 'water', label: 'Water yesterday', unit: 'ml', min: 0, max: 8000, step: 50, howTo: 'water', placeholder: '2600' },
  minutes: { key: 'minutes', label: 'Minutes exercised yesterday', unit: 'min', min: 0, max: 600, step: 5, howTo: 'training', placeholder: '60' },
  sys: { key: 'sys', label: 'Systolic (upper)', unit: 'mmHg', min: 50, max: 260, step: 1, howTo: 'bp', placeholder: '115' },
  dia: { key: 'dia', label: 'Diastolic (lower)', unit: 'mmHg', min: 30, max: 160, step: 1, howTo: 'bp', placeholder: '72' },
  hr: { key: 'hr', label: 'Resting heart rate', unit: '/min', min: 20, max: 250, step: 1, howTo: 'hr', placeholder: '64' },
  spo2: { key: 'spo2', label: 'Oxygen saturation', unit: '%', min: 50, max: 100, step: 1, howTo: 'spo2', placeholder: '98' },
  resp: { key: 'resp', label: 'Breathing rate', unit: '/min', min: 4, max: 60, step: 1, howTo: 'spo2', placeholder: '14' },
  temp: { key: 'temp', label: 'Body temperature (rest)', unit: '°C', min: 30, max: 44, step: 0.1, howTo: 'temp', placeholder: '36.6' },
  glucose: { key: 'glucose', label: 'Fasting glucose', unit: 'mg/dL', min: 20, max: 600, step: 1, howTo: 'glucose', placeholder: '88' },
  mass: { key: 'mass', label: 'Body mass', unit: 'kg', min: 30, max: 200, step: 0.1, howTo: 'mass', placeholder: '70.0' },
};

const MOOD_WORDS = ['optimal', 'good', 'calm', 'focused', 'energized', 'strained', 'tense', 'tired', 'fatigued', 'anxious', 'distressed'];
const TRAINING_TYPES = [
  ['resistance_training', 'Resistance training (ARED)'], ['resistance_and_cardio', 'Resistance + cardio'], ['light_cardio', 'Light cardio (T2 / CEVIS)'],
  ['eva_spacewalk', 'EVA / spacewalk'], ['rest', 'Rest day'], ['none', 'No session (missed)'],
] as const;

interface Step { title: string; mascot: MascotImage; line: string; fields: NumKey[] }

export default function CheckInWizard({ crewId }: { crewId: CrewId }) {
  const crew = crewById(crewId);
  const close = useAppStore((s) => s.openCheckIn);
  const addEntry = useAppStore((s) => s.addEntry);
  const userEntries = useAppStore((s) => s.userEntries);
  const doneToday = useAppStore((s) => s.lastCheckInDate[crewId] === todayIso());
  const last = useMemo(() => { const h = buildHistory(crewId, userEntries); return h[h.length - 1]; }, [crewId, userEntries]);
  const flightDay = last.flightDay + 1;
  // Yesterday without training → a rest day today would be the 2nd in a row (counts as missed).
  const yesterdayRest = !last.training.type.startsWith('eva') && !(last.training.minutes && last.training.minutes > 0);

  const [vals, setVals] = useState<Partial<Record<NumKey, string>>>({ mood: '7' });
  const [moodWord, setMoodWord] = useState('good');
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [other, setOther] = useState('');
  const [trainingType, setTrainingType] = useState<string>('resistance_training');
  const [step, setStep] = useState(0);
  const [howTo, setHowTo] = useState<string | null>(null);

  const steps: Step[] = [
    { title: 'Sleep & mood', mascot: 'sleep', line: 'Good morning! How did you sleep, and how do you feel today?', fields: ['sleep', 'mood'] },
    { title: 'Symptoms', mascot: 'default', line: 'Tick anything you feel today. Red-flag symptoms are at the top.', fields: [] },
    { title: 'Food & water', mascot: 'drink', line: 'What did you eat and drink yesterday? Check your food diary.', fields: ['kcal', 'water'] },
    { title: 'Training', mascot: 'workout', line: 'How much of yesterday\'s session did you complete? One rest day after a training day is fine.', fields: ['minutes'] },
    { title: 'Heart & lungs', mascot: 'measure', line: 'Rest 5 minutes in your usual posture, then measure blood pressure and heart rate.', fields: ['sys', 'dia', 'hr', 'spo2', 'resp'] },
    { title: 'Temperature & glucose', mascot: 'default', line: 'At rest, and before breakfast for glucose (8 h fasting).', fields: ['temp', 'glucose'] },
    { title: 'Body mass', mascot: 'default', line: 'Use the mass-measurement device. Normal scales don\'t work in weightlessness.', fields: ['mass'] },
    { title: 'Review & submit', mascot: 'good', line: 'All done! Check your answers and submit the scan.', fields: [] },
  ];
  const cur = steps[step];

  const num = (k: NumKey): number | null => {
    const s = vals[k]?.trim();
    if (!s) return null;
    const v = Number(s.replace(',', '.'));
    return Number.isFinite(v) ? v : NaN;
  };
  const invalid = (k: NumKey) => { const v = num(k); return v != null && (Number.isNaN(v) || v < F[k].min || v > F[k].max); };
  const stepInvalid = cur.fields.some(invalid) || (step === 1 && false);

  const submit = () => {
    const noSession = trainingType === 'none' || trainingType === 'rest';
    const minutes = noSession ? 0 : num('minutes');
    const entry: DailyEntry = {
      id: `${crewId}-FD${flightDay}-${Date.now()}`,
      crewId, flightDay, date: todayIso(), source: 'user',
      environment: last.environment, condition: 'resting',
      sleepHours: num('sleep'),
      mood: { score: num('mood'), state: moodWord },
      symptoms, symptomsOther: other.trim() || null,
      food: { kcal: num('kcal'), waterMl: num('water') },
      training: { type: trainingType, minutes, completed: trainingType === 'rest' ? null : (minutes ?? 0) > 0, restDay: trainingType === 'rest' },
      bp: { sys: num('sys'), dia: num('dia'), map: null },
      hr: { bpm: num('hr'), hrvMs: null },
      o2: { spo2Pct: num('spo2'), respRate: num('resp') },
      tempC: num('temp'),
      glucoseMgDl: num('glucose'),
      massKg: num('mass'),
    };
    addEntry(entry, todayIso());
  };

  const field = (k: NumKey) => {
    const f = F[k];
    const bad = invalid(k);
    return (
      <div className="field" key={k}>
        <label htmlFor={`f-${k}`}>{f.label} <span className="faint" style={{ fontSize: 15 }}>{f.unit}</span>
          <span className="spacer" /><button type="button" className="link" onClick={() => setHowTo(f.howTo)}>How to measure</button>
        </label>
        <input id={`f-${k}`} className={`input mono ${bad ? 'invalid' : ''}`} inputMode="decimal" placeholder={f.placeholder}
          value={vals[k] ?? ''} onChange={(e) => setVals((v) => ({ ...v, [k]: e.target.value }))} />
        {bad && <span style={{ color: 'var(--red)', fontSize: 14 }}>Please check: expected {f.min}–{f.max} {f.unit}.</span>}
      </div>
    );
  };

  const missing = (Object.keys(F) as NumKey[]).filter((k) => !((trainingType === 'none' || trainingType === 'rest') && k === 'minutes') && num(k) == null);

  if (doneToday) {
    return (
      <Modal title="Daily check-in" onClose={() => close(null)}>
        <p>{crew.displayName} has already done today's check-in. The next one is possible tomorrow (one scan per day).</p>
      </Modal>
    );
  }

  return (
    <>
      <Modal
        wide
        title={<>Daily check-in · {crew.displayName} · <span className="mono">FD {flightDay}</span></>}
        onClose={() => close(null)}
        footer={
          <>
            <div style={{ display: 'flex', gap: 6, flex: 1 }}>
              {steps.map((s, i) => (
                <button key={s.title} onClick={() => !stepInvalid && setStep(i)} title={s.title} aria-label={`Step ${i + 1}: ${s.title}`}
                  style={{ height: 6, flex: 1, borderRadius: 4, border: 'none', background: i <= step ? 'var(--accent)' : 'rgba(255,255,255,0.12)' }} />
              ))}
            </div>
            <button className="btn" disabled={step === 0} onClick={() => setStep(step - 1)}>Back</button>
            {step < steps.length - 1
              ? <button className="btn btn-primary" disabled={stepInvalid} onClick={() => setStep(step + 1)}>Next</button>
              : <button className="btn btn-primary" onClick={submit}>Submit scan ✓</button>}
          </>
        }
      >
        <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: 24 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
            <motion.img key={cur.mascot} src={MASCOT_IMAGES[cur.mascot]} alt="Dr. Biscuit"
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 18 }}
              style={{ width: 140, height: 168, objectFit: 'contain', background: '#f6f8ff', borderRadius: 16, padding: 6 }} />
            <div className="panel" style={{ padding: '10px 12px', fontSize: 15 }}>{cur.line}</div>
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.2 }}
              style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="section-title">Step {step + 1} of {steps.length} · {cur.title}</div>

              {step === 0 && (
                <>
                  {field("sleep")}
                  <div className="field">
                    <label>Mood score: <span className="mono" style={{ fontSize: 22 }}>{vals.mood ?? '—'}</span> / 10
                      <span className="spacer" /><button type="button" className="link" onClick={() => setHowTo('mood')}>How to measure</button></label>
                    <input type="range" min={1} max={10} step={0.5} value={vals.mood ?? 7} onChange={(e) => setVals((v) => ({ ...v, mood: e.target.value }))} style={{ accentColor: '#5ee7ff' }} />
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {MOOD_WORDS.map((w) => (
                        <button key={w} type="button" className="btn btn-sm" onClick={() => setMoodWord(w)}
                          style={moodWord === w ? { borderColor: 'var(--accent)', background: 'rgba(94,231,255,0.12)' } : undefined}>{w}</button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {step === 1 && (
                <>
                  <button type="button" className="link" style={{ alignSelf: 'flex-start' }} onClick={() => setHowTo('symptoms')}>How to fill this in</button>
                  {(['red', 'orange'] as const).map((lvl) => (
                    <div key={lvl}>
                      <div className="section-title" style={{ color: lvl === 'red' ? 'var(--red)' : undefined, marginBottom: 6 }}>
                        {lvl === 'red' ? 'Serious (red flag): act now' : 'Mild / new symptoms'}
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 8 }}>
                        {SYMPTOMS.filter((s) => s.level === lvl).map((s) => {
                          const on = symptoms.includes(s.code);
                          return (
                            <label key={s.code} className={`check ${lvl === 'red' ? 'red-flag' : ''} ${on ? 'checked' : ''}`}>
                              <input type="checkbox" checked={on} onChange={() => setSymptoms((cur) => (on ? cur.filter((c) => c !== s.code) : [...cur, s.code]))} />
                              {s.label}
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                  <div className="field">
                    <label htmlFor="f-other">Anything else?</label>
                    <input id="f-other" className="input" value={other} onChange={(e) => setOther(e.target.value)} placeholder="Describe other symptoms (optional)" />
                  </div>
                  {symptoms.length === 0 && !other && <p className="dim">No symptoms ticked = "None".</p>}
                </>
              )}

              {step === 2 && <>{field("kcal")}{field("water")}<p className="faint" style={{ fontSize: 15 }}>Plan for {crew.displayName}: {crew.plannedKcalPerDay} kcal/day.</p></>}

              {step === 3 && (
                <>
                  <div className="field">
                    <label>Type of exercise <span className="spacer" /><button type="button" className="link" onClick={() => setHowTo('training')}>How to measure</button></label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {TRAINING_TYPES.map(([id, label]) => (
                        <button key={id} type="button" className="btn btn-sm" onClick={() => setTrainingType(id)}
                          style={trainingType === id ? { borderColor: 'var(--accent)', background: 'rgba(94,231,255,0.12)' } : undefined}>{label}</button>
                      ))}
                    </div>
                  </div>
                  {trainingType !== 'none' && trainingType !== 'rest' && field('minutes')}
                  {trainingType === 'rest' && (yesterdayRest
                    ? <p style={{ color: 'var(--orange)' }}>Yesterday was already without training. A second rest day in a row counts as a missed session.</p>
                    : <p>🛌 One rest day after a training day is part of the plan.</p>)}
                  <p className="faint" style={{ fontSize: 15 }}>Planned session: {crew.plannedTrainingMin} min. Routine: 2 training days, then 1 rest day. An EVA counts as a completed session.</p>
                </>
              )}

              {step === 4 && <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>{field("sys")}{field("dia")}{field("hr")}<div />{field("spo2")}{field("resp")}</div>}
              {step === 5 && <>{field("temp")}{field("glucose")}</>}
              {step === 6 && field("mass")}

              {step === 7 && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 24px' }}>
                  {(Object.keys(F) as NumKey[]).map((k) => (
                    <div key={k} className="kv"><span className="dim">{F[k].label}</span>
                      <span className="mono">{k === 'minutes' && trainingType === 'rest' ? 'rest day' : num(k) == null ? <span style={{ color: 'var(--grey)' }}>no data</span> : `${num(k)} ${F[k].unit}`}</span></div>
                  ))}
                  <div className="kv"><span className="dim">Mood word</span><span>{moodWord}</span></div>
                  <div className="kv"><span className="dim">Symptoms</span><span>{symptoms.length || other ? [...symptoms.map((c) => SYMPTOMS.find((s) => s.code === c)?.label ?? c), other].filter(Boolean).join(', ') : 'None'}</span></div>
                  {missing.length > 0 && (
                    <p style={{ gridColumn: '1 / -1', color: 'var(--orange)', marginTop: 8 }}>
                      {missing.length} value(s) left empty. They will show as grey "No data" (missing data is never green).
                    </p>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </Modal>
      {howTo && <HowToModal id={howTo} onClose={() => setHowTo(null)} />}
    </>
  );
}
