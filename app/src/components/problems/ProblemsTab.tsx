// Health problems and solutions from the team files (translated), linked to body regions and today's status.
// Compact cards; the explanation, solution and prevention are inside a collapsed section.
import { useState } from 'react';
import type { DayView } from '../../store/useCrewView';
import { PROBLEMS } from '../../data/problems';
import { regionById } from '../../data/regions';
import { problemLinks } from '../../engine/problems';
import { StatusChip, STATUS_COLOR } from '../common';

// Ship-only problems (cabin air, radiation) are shown from the landing page's ship panel, not here.
const CREW_PROBLEMS = PROBLEMS.filter((p) => !(p.ruleIds.length > 0 && p.ruleIds.every((id) => id.startsWith('SH-')) && !p.symptomCodes?.length));

export default function ProblemsTab({ day }: { day: DayView }) {
  const [onlyActive, setOnlyActive] = useState(false);
  const items = CREW_PROBLEMS.map((p) => ({ p, status: problemLinks(p, day.results, day.entry).status }))
    .filter((x) => !onlyActive || x.status === 'orange' || x.status === 'red');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingBottom: 90 }}>
      <label className="check" style={{ alignSelf: 'flex-start' }}>
        <input type="checkbox" checked={onlyActive} onChange={(e) => setOnlyActive(e.target.checked)} /> Only active warnings
      </label>
      {items.length === 0 && <p className="dim">No active warnings.</p>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 12 }}>
        {items.map(({ p, status }) => (
          <article key={p.id} className="panel" style={{ padding: 14, borderColor: `color-mix(in srgb, ${STATUS_COLOR[status]} 40%, transparent)` }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <h3 style={{ flex: 1, fontSize: 18 }}>{p.title}</h3>
              <StatusChip status={status} />
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', margin: '8px 0' }}>
              {p.regions.map((r) => <span key={r} className="chip s-info">{regionById(r).label}</span>)}
            </div>
            <details className="more">
              <summary>Solution & details</summary>
              <p className="dim" style={{ fontSize: 15, marginTop: 6 }}>{p.whatItIs}</p>
              {p.response && <p style={{ fontSize: 16, marginTop: 6 }}><strong style={{ color: 'var(--accent)' }}>Solution: </strong>{p.response}</p>}
              {p.prevention && <p style={{ fontSize: 16, marginTop: 6 }}><strong style={{ color: 'var(--green)' }}>Prevention: </strong>{p.prevention}</p>}
              <p className="faint" style={{ fontSize: 13, marginTop: 6 }}>Source: {p.source}</p>
            </details>
          </article>
        ))}
      </div>
    </div>
  );
}
