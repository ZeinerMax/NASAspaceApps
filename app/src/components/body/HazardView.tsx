// Five-hazard view (.odt part 3): each hazard's worst status + translated prevention text.
import type { HazardId, Status } from '../../types';
import { HAZARDS, GROUND_CONTACT_NOTE } from '../../data/hazards';
import { ruleById } from '../../data/rules';
import { StatusChip, STATUS_COLOR } from '../common';

export default function HazardView({ statuses }: { statuses: Record<HazardId, Status> }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12, padding: 16 }}>
      {HAZARDS.map((h) => {
        const s = statuses[h.id];
        return (
          <div key={h.id} className="panel" style={{ padding: 14, borderColor: `color-mix(in srgb, ${STATUS_COLOR[s]} 45%, transparent)` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <span style={{ fontSize: 24, color: STATUS_COLOR[s] }}>{h.icon}</span>
              <h3 style={{ flex: 1, fontSize: 18 }}>{h.label}</h3>
              <StatusChip status={s} label={s === 'info' ? 'Info' : undefined} />
            </div>
            <p className="dim" style={{ fontSize: 15 }}>{h.prevention}</p>
            {h.id === 'distance' && <p style={{ fontSize: 15, marginTop: 6 }}>🛰 {GROUND_CONTACT_NOTE}</p>}
            {h.ruleIds.length > 0 && (
              <p className="faint" style={{ fontSize: 13, marginTop: 6 }}>Rules: {h.ruleIds.map((id) => ruleById(id).label).join(', ')}</p>
            )}
          </div>
        );
      })}
      <p className="faint" style={{ fontSize: 13, gridColumn: '1 / -1' }}>
        Prevention text translated from "prevence 5 problémů.txt". The mapping of rules to hazards is a proposal (placeholder, verify against NASA Human Research Program or other space agency sources).
      </p>
    </div>
  );
}
