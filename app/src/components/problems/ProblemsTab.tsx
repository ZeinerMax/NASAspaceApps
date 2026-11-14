// Health problems and solutions from the team files (translated), linked to body regions and live rule status.
import { useState } from 'react';
import type { RuleResult } from '../../types';
import type { DayView } from '../../store/useCrewView';
import { PROBLEMS } from '../../data/problems';
import { ruleById } from '../../data/rules';
import { regionById } from '../../data/regions';
import { problemLinks } from '../../engine/problems';
import { StatusChip, STATUS_COLOR } from '../common';

export default function ProblemsTab({ day, ship }: { day: DayView; ship: RuleResult[] }) {
  const [onlyActive, setOnlyActive] = useState(false);
  const items = PROBLEMS.map((p) => {
    const { rules: linked, symptoms, status } = problemLinks(p, [...day.results, ...ship], day.entry);
    return { p, linked, symptoms, status };
  }).filter((x) => !onlyActive || x.status === 'orange' || x.status === 'red');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingBottom: 140 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <p className="dim" style={{ flex: 1 }}>
          Possible health problems and what to do about them, translated from the team's documents. Status shows whether a linked rule is currently warning.
        </p>
        <label className="check" style={{ whiteSpace: 'nowrap' }}>
          <input type="checkbox" checked={onlyActive} onChange={(e) => setOnlyActive(e.target.checked)} /> Only problems with active warnings
        </label>
      </div>
      {items.length === 0 && <p className="dim">No problems linked to active warnings.</p>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))', gap: 14 }}>
        {items.map(({ p, linked, symptoms, status }) => (
          <article key={p.id} className="panel" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8, borderColor: `color-mix(in srgb, ${STATUS_COLOR[status]} 40%, transparent)` }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <div className="section-title">{p.system}</div>
                <h3>{p.title}</h3>
              </div>
              <StatusChip status={status} />
            </div>
            <p className="dim" style={{ fontSize: 16 }}>{p.whatItIs}</p>
            {p.response && <p style={{ fontSize: 16 }}><strong style={{ color: 'var(--accent)' }}>Response: </strong>{p.response}</p>}
            {p.prevention && <p style={{ fontSize: 16 }}><strong style={{ color: 'var(--green)' }}>Prevention: </strong>{p.prevention}</p>}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 'auto' }}>
              {p.regions.map((r) => <span key={r} className="chip s-info">{regionById(r).label}</span>)}
              {linked.map((r) => <StatusChip key={r.ruleId} status={r.status} label={ruleById(r.ruleId).label} />)}
              {symptoms.map((s) => <StatusChip key={s.code} status={s.level} label={s.label} />)}
              {p.symptomCodes?.length && !symptoms.length ? <span className="faint" style={{ fontSize: 14, alignSelf: 'center' }}>Not reported today</span> : null}
            </div>
            <p className="faint" style={{ fontSize: 13 }}>Source: {p.source}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
