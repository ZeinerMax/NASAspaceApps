// Side panel: summary of warnings (nothing selected) or the short details of one region.
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { RegionId, RuleResult } from '../../types';
import type { DayView } from '../../store/useCrewView';
import { REGIONS, regionById } from '../../data/regions';
import { ruleById } from '../../data/rules';
import { PROBLEMS } from '../../data/problems';
import { symptomDef } from '../../data/symptoms';
import { statusRank, worst } from '../../engine/aggregate';
import { StatusChip, STATUS_COLOR } from '../common';
import ActionBox from '../alerts/ActionBox';
import HowToModal from '../checkin/HowToModal';

const shortValue = (r: RuleResult) => r.valueLabel.split(' · ')[0];

// What is shown next to each region in the summary list: short label + key number, coloured by that rule's status.
type Item = { label: string; ruleIds: string[]; text: (r: Map<string, RuleResult>, d: DayView) => string };
const numVal = (r: Map<string, RuleResult>, id: string, f: (v: number) => string) => {
  const v = r.get(id)?.value;
  return typeof v === 'number' ? f(v) : '—';
};
const training: Item = { label: 'Training', ruleIds: ['CH-TRAINING'], text: (r) => (r.get('CH-TRAINING')?.value === 'rest' ? 'rest day' : numVal(r, 'CH-TRAINING', (v) => `${Math.round(v)}%`)) };
const mass: Item = { label: 'Mass', ruleIds: ['CH-MASS'], text: (r) => numVal(r, 'CH-MASS', (v) => `${v > 0 ? '−' : '+'}${Math.abs(v).toFixed(1)}%`) };
const SUMMARY: Record<RegionId, Item[]> = {
  head: [
    { label: 'Sleep', ruleIds: ['CH-SLEEP'], text: (r) => numVal(r, 'CH-SLEEP', (v) => `${v.toFixed(1)} h`) },
    { label: 'Mood', ruleIds: ['CH-MOOD'], text: (r) => numVal(r, 'CH-MOOD', (v) => v.toFixed(1)) },
  ],
  chest: [
    { label: 'BP', ruleIds: ['CH-SYS', 'CH-DIA'], text: (_r, d) => (d.entry.bp.sys == null ? '—' : `${d.entry.bp.sys}/${d.entry.bp.dia ?? '—'}`) },
    { label: 'HR', ruleIds: ['CH-HR'], text: (_r, d) => (d.entry.hr.bpm == null ? '—' : String(d.entry.hr.bpm)) },
    { label: 'SpO₂', ruleIds: ['INFO-SPO2'], text: (_r, d) => (d.entry.o2.spo2Pct == null ? '—' : `${d.entry.o2.spo2Pct}%`) },
  ],
  abdomen: [
    { label: 'Food', ruleIds: ['CH-FOOD'], text: (r) => numVal(r, 'CH-FOOD', (v) => `${Math.round(v)}%`) },
    { label: 'Water', ruleIds: ['CH-WATER'], text: (r) => numVal(r, 'CH-WATER', (v) => `${v.toFixed(1)} L`) },
    { label: 'Glucose', ruleIds: ['CH-GLU'], text: (r) => numVal(r, 'CH-GLU', (v) => v.toFixed(1)) },
  ],
  arms: [training, mass],
  legs: [training, mass],
  body: [
    { label: 'Temp', ruleIds: ['CH-TEMP'], text: (r) => numVal(r, 'CH-TEMP', (v) => `${v.toFixed(1)}°`) },
    { label: 'Symptoms', ruleIds: ['CH-SYMPTOMS'], text: (_r, d) => (d.entry.symptoms.length ? String(d.entry.symptoms.length) : 'none') },
  ],
};

function Row({ r, onHowTo }: { r: RuleResult; onHowTo: (id: string) => void }) {
  const rule = ruleById(r.ruleId);
  const bad = r.status === 'orange' || r.status === 'red';
  return (
    <div style={{ padding: '8px 0', borderBottom: '1px dashed rgba(120,160,255,0.14)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span className="dot" style={{ background: STATUS_COLOR[r.status] }} />
        <strong style={{ flex: 1 }}>
          {rule.label}
          {rule.explanationId && <button className="help-btn" title="How to measure" aria-label={`How to measure ${rule.label}`} onClick={() => onHowTo(rule.explanationId!)}>?</button>}
        </strong>
        <span className="mono" style={{ color: STATUS_COLOR[r.status] }}>{shortValue(r)}</span>
      </div>
      {bad && <div className="dim" style={{ fontSize: 15, marginLeft: 20 }}>{r.reason}</div>}
    </div>
  );
}

export default function RegionPanel({ day, region, onSelect }: { day: DayView; region: RegionId | null; onSelect: (r: RegionId | null) => void }) {
  const [howTo, setHowTo] = useState<string | null>(null);
  const byId = new Map(day.results.map((r) => [r.ruleId, r]));

  let content: React.ReactNode;
  if (!region) {
    content = (
      <div style={{ display: 'grid', gap: 8 }}>
        {REGIONS.map((reg) => {
          const st = day.regions[reg.id];
          const bad = st === 'orange' || st === 'red';
          return (
            <button key={reg.id} className="region-row" style={bad ? { borderColor: `color-mix(in srgb, ${STATUS_COLOR[st]} 55%, transparent)` } : undefined} onClick={() => onSelect(reg.id)}>
              <span className="region-name"><span className="dot" style={{ background: STATUS_COLOR[st] }} />{reg.label}</span>
              <span className="region-info">
                {SUMMARY[reg.id].map((it) => {
                  const s = worst(it.ruleIds.map((id) => byId.get(id)?.status ?? 'grey'));
                  return (
                    <span key={it.label}>
                      <span className="dim">{it.label} </span>
                      <b className="mono" style={{ color: s === 'info' || s === 'grey' ? 'var(--text-dim)' : STATUS_COLOR[s] }}>{it.text(byId, day)}</b>
                    </span>
                  );
                })}
              </span>
              {bad && <span className="region-flag" style={{ color: STATUS_COLOR[st] }}>{st === 'red' ? 'Act now' : 'Warning'}</span>}
            </button>
          );
        })}
      </div>
    );
  } else {
    const reg = regionById(region);
    const results = reg.ruleIds.map((id) => byId.get(id)!).filter(Boolean);
    const infos = reg.infoRuleIds.map((id) => byId.get(id)!).filter(Boolean);
    const syms = day.entry.symptoms.map(symptomDef).filter((d) => d.regions.includes(region));
    const symResult = byId.get('CH-SYMPTOMS');
    const worstRes = [...results, ...(syms.length && symResult ? [symResult] : [])].sort((a, b) => statusRank(b.status) - statusRank(a.status))[0];
    const problems = PROBLEMS.filter((p) => p.regions.includes(region) && (p.response || p.prevention));
    const bad = day.regions[region] === 'orange' || day.regions[region] === 'red';
    content = (
      <>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="btn btn-sm" onClick={() => onSelect(null)} aria-label="Back">←</button>
          <h3 style={{ flex: 1 }}>{reg.label}</h3>
          <StatusChip status={day.regions[region]} />
        </div>

        {worstRes && bad && <ActionBox result={worstRes} />}

        <div>
          {results.map((r) => <Row key={r.ruleId} r={r} onHowTo={setHowTo} />)}
          {syms.length > 0 && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', padding: '10px 0' }}>
              {syms.map((s) => <StatusChip key={s.code} status={s.level} label={s.label} />)}
            </div>
          )}
          {infos.map((r) => <Row key={r.ruleId} r={r} onHowTo={setHowTo} />)}
        </div>

        {problems.length > 0 && (
          <div style={{ display: 'grid', gap: 8 }}>
            <div className="section-title">Problem & solution</div>
            {problems.map((p) => (
              <details key={p.id} className="panel" style={{ padding: '8px 14px' }} open={bad && problems.length === 1}>
                <summary style={{ cursor: 'pointer', fontWeight: 600 }}>{p.title}</summary>
                {p.response && <p style={{ fontSize: 16, marginTop: 6 }}><strong style={{ color: 'var(--accent)' }}>Solution: </strong>{p.response}</p>}
                {p.prevention && (
                  <details className="more"><summary>Prevention</summary><p className="dim" style={{ fontSize: 15 }}>{p.prevention}</p></details>
                )}
              </details>
            ))}
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={region ?? 'summary'}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16 }}
          style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
        >
          {content}
        </motion.div>
      </AnimatePresence>
      {howTo && <HowToModal id={howTo} onClose={() => setHowTo(null)} />}
    </>
  );
}
