// Five-hazard view (.odt part 3): each hazard's worst status; the prevention text is shown on demand.
import type { HazardId, Status } from '../../types';
import { HAZARDS, GROUND_CONTACT_NOTE } from '../../data/hazards';
import { StatusChip, STATUS_COLOR } from '../common';

export default function HazardView({ statuses }: { statuses: Record<HazardId, Status> }) {
  return (
    <div style={{ display: 'grid', gap: 10 }}>
      {HAZARDS.map((h) => {
        const s = statuses[h.id];
        return (
          <details key={h.id} className="panel" style={{ padding: '10px 14px', borderColor: `color-mix(in srgb, ${STATUS_COLOR[s]} 45%, transparent)` }}>
            <summary style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 22, color: STATUS_COLOR[s] }}>{h.icon}</span>
              <strong style={{ flex: 1 }}>{h.label}</strong>
              <StatusChip status={s} label={s === 'info' ? 'Info' : undefined} />
            </summary>
            <p className="dim" style={{ fontSize: 15, marginTop: 8 }}>{h.prevention}</p>
            {h.id === 'distance' && <p style={{ fontSize: 15, marginTop: 6 }}>🛰 {GROUND_CONTACT_NOTE}</p>}
          </details>
        );
      })}
    </div>
  );
}
