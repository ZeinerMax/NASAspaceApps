// Side panel: summary of warnings (nothing selected) or the short details of one region.
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { RegionId, RuleResult } from '../../types';
import type { DayView } from '../../store/useCrewView';
import { REGIONS, regionById } from '../../data/regions';
import { ruleById } from '../../data/rules';
import { PROBLEMS } from '../../data/problems';
import { symptomDef } from '../../data/symptoms';
import { statusRank } from '../../engine/aggregate';
import { StatusChip, STATUS_COLOR } from '../common';
import ActionBox from '../alerts/ActionBox';
import HowToModal from '../checkin/HowToModal';

const shortValue = (r: RuleResult) => r.valueLabel.split(' · ')[0];

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
    const alerts = day.results
      .filter((r) => r.ruleId.startsWith('CH-') && (r.status === 'orange' || r.status === 'red'))
      .sort((a, b) => statusRank(b.status) - statusRank(a.status));
    content = (
      <>
        <div className="section-title">Regions</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          {REGIONS.map((reg) => (
            <button key={reg.id} className="btn btn-sm" style={{ justifyContent: 'flex-start', borderRadius: 12 }} onClick={() => onSelect(reg.id)}>
              <span className="dot" style={{ background: STATUS_COLOR[day.regions[reg.id]] }} /> {reg.label}
            </button>
          ))}
        </div>
        <div className="section-title" style={{ marginTop: 6 }}>Warnings ({alerts.length})</div>
        {alerts.length === 0 && <p className="dim">None. All healthy.</p>}
        <div style={{ display: 'grid', gap: 6 }}>
          {alerts.map((r) => {
            const target = ruleById(r.ruleId).regions[0];
            return (
              <button key={r.ruleId} className="btn" style={{ justifyContent: 'space-between', borderRadius: 12 }} onClick={() => target && onSelect(target)}>
                <StatusChip status={r.status} label={ruleById(r.ruleId).label} />
                <span className="mono dim" style={{ fontSize: 15 }}>{shortValue(r)}</span>
              </button>
            );
          })}
        </div>
      </>
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
