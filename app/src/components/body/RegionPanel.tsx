// Side panel: today's summary (no region selected) or the details of one body region.
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { CrewMember, RegionId, RuleResult } from '../../types';
import type { DayView } from '../../store/useCrewView';
import { REGIONS, regionById } from '../../data/regions';
import { ruleById } from '../../data/rules';
import { PROBLEMS } from '../../data/problems';
import { symptomDef } from '../../data/symptoms';
import { statusRank } from '../../engine/aggregate';
import { StatusChip, STATUS_COLOR } from '../common';
import { metricsForRule } from '../trends/metrics';
import Sparkline from '../trends/Sparkline';
import ActionBox from '../alerts/ActionBox';
import HowToModal from '../checkin/HowToModal';

function RuleRow({ r, timeline, crew, onHowTo }: { r: RuleResult; timeline: DayView[]; crew: CrewMember; onHowTo: (id: string) => void }) {
  const rule = ruleById(r.ruleId);
  const metric = metricsForRule(r.ruleId)[0];
  return (
    <div style={{ padding: '10px 0', borderBottom: '1px dashed rgba(120,160,255,0.14)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span className={`dot s-${r.status}`} style={{ background: STATUS_COLOR[r.status] }} />
        <strong style={{ flex: 1 }}>{rule.label}</strong>
        {metric && <Sparkline metric={metric} timeline={timeline} crew={crew} width={110} height={28} />}
      </div>
      <div className="mono" style={{ fontSize: 16, margin: '2px 0 0 20px' }}>{r.valueLabel}</div>
      <div className="dim" style={{ fontSize: 15, marginLeft: 20 }}>
        {r.reason}{' '}
        {rule.explanationId && <button className="link" onClick={() => onHowTo(rule.explanationId!)}>How to measure</button>}
      </div>
    </div>
  );
}

export default function RegionPanel({ crew, day, timeline, region, onSelect }: {
  crew: CrewMember; day: DayView; timeline: DayView[]; region: RegionId | null; onSelect: (r: RegionId | null) => void;
}) {
  const [howTo, setHowTo] = useState<string | null>(null);
  const byId = new Map(day.results.map((r) => [r.ruleId, r]));

  let content: React.ReactNode;
  if (!region) {
    const alerts = day.results
      .filter((r) => r.ruleId.startsWith('CH-') && r.status !== 'green' && r.status !== 'info')
      .sort((a, b) => statusRank(b.status) - statusRank(a.status));
    content = (
      <>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <h3 style={{ flex: 1 }}>Scan summary · FD {day.entry.flightDay}</h3>
          <StatusChip status={day.overall} />
        </div>
        <p className="dim" style={{ fontSize: 16 }}>Click a body region (or a row below) for details. Green everywhere means healthy.</p>
        <div style={{ display: 'grid', gap: 6 }}>
          {REGIONS.map((reg) => (
            <button key={reg.id} className="btn" style={{ justifyContent: 'space-between', borderRadius: 12 }} onClick={() => onSelect(reg.id)}>
              <span>{reg.label} <span className="faint" style={{ fontSize: 14 }}>· {reg.subtitle}</span></span>
              <StatusChip status={day.regions[reg.id]} />
            </button>
          ))}
        </div>
        <div className="section-title" style={{ marginTop: 8 }}>Active warnings ({alerts.length})</div>
        {alerts.length === 0 && <p className="dim">No warnings. All systems green.</p>}
        <div style={{ display: 'grid', gap: 8 }}>
          {alerts.map((r) => (
            <div key={r.ruleId}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <StatusChip status={r.status} label={ruleById(r.ruleId).label} />
                <span className="mono dim" style={{ fontSize: 15 }}>{r.valueLabel}</span>
              </div>
              <div style={{ marginTop: 4 }}><ActionBox result={r} compact /></div>
            </div>
          ))}
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
    const problems = PROBLEMS.filter((p) => p.regions.includes(region));
    content = (
      <>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="btn btn-sm" onClick={() => onSelect(null)} aria-label="Back to summary">←</button>
          <div style={{ flex: 1 }}>
            <h3>{reg.label}</h3>
            <div className="faint" style={{ fontSize: 15 }}>{reg.subtitle}</div>
          </div>
          <StatusChip status={day.regions[region]} />
        </div>

        {worstRes && <ActionBox result={worstRes} />}

        <div>
          <div className="section-title">Measurements · FD {day.entry.flightDay}</div>
          {results.map((r) => <RuleRow key={r.ruleId} r={r} timeline={timeline} crew={crew} onHowTo={setHowTo} />)}
          {syms.length > 0 && (
            <div style={{ padding: '10px 0' }}>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                <strong>Symptoms:</strong>
                {syms.map((s) => <StatusChip key={s.code} status={s.level} label={s.label} />)}
              </div>
            </div>
          )}
          {infos.map((r) => <RuleRow key={r.ruleId} r={r} timeline={timeline} crew={crew} onHowTo={setHowTo} />)}
        </div>

        {problems.length > 0 && (
          <div style={{ display: 'grid', gap: 10 }}>
            <div className="section-title">Possible health problems</div>
            {problems.map((p) => (
              <details key={p.id} className="panel" style={{ padding: '10px 14px' }} open={day.regions[region] !== 'green'}>
                <summary style={{ cursor: 'pointer', fontWeight: 600 }}>{p.title}</summary>
                <p className="dim" style={{ fontSize: 16, marginTop: 6 }}>{p.whatItIs}</p>
                {p.response && <p style={{ fontSize: 16, marginTop: 6 }}><strong style={{ color: 'var(--accent)' }}>Response: </strong>{p.response}</p>}
                {p.prevention && <p style={{ fontSize: 16, marginTop: 6 }}><strong style={{ color: 'var(--green)' }}>Prevention: </strong>{p.prevention}</p>}
                <p className="faint" style={{ fontSize: 13, marginTop: 6 }}>Source: {p.source}</p>
              </details>
            ))}
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <AnimatePresence mode="wait">
        <motion.div
          key={region ?? 'summary'}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -8 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
        >
          {content}
        </motion.div>
      </AnimatePresence>
      {howTo && <HowToModal id={howTo} onClose={() => setHowTo(null)} />}
    </>
  );
}
