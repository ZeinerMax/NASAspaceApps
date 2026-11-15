// Five-hazard view (.odt part 3): each hazard's status and prevention text.
import type { HazardId, RadiationDay, Status } from '../../types';
import { HAZARDS, GROUND_CONTACT_NOTE } from '../../data/hazards';
import { StatusChip, STATUS_COLOR } from '../common';

const dose = (value: number | null, unit: string) => value == null ? 'Not reported' : `${value.toFixed(2)} ${unit}`;

export default function HazardView({ statuses, radiation }: { statuses: Record<HazardId, Status>; radiation: RadiationDay | null }) {
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
            {h.id === 'radiation' && (
              <div style={{ display: 'grid', gap: 6, marginTop: 10, padding: '10px 12px', border: '1px solid var(--panel-border)', borderRadius: 10, background: 'rgba(255,255,255,0.03)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 14 }}>
                  <span className="dim">Mission cumulative dose</span>
                  <strong className="mono">{dose(radiation?.missionDoseMSv ?? null, 'mSv')}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 14 }}>
                  <span className="dim">Estimated dose rate</span>
                  <strong className="mono">{dose(radiation?.doseRateMSvDay ?? null, 'mSv/day')}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 14 }}>
                  <span className="dim">Solar particle event dose</span>
                  <strong className="mono">{dose(radiation?.speDoseMSv ?? null, 'mSv')}</strong>
                </div>
                <p className="faint" style={{ fontSize: 12, marginTop: 2 }}>Dose rate is derived from consecutive cumulative readings. Solar event dose is not included in radiace.json.</p>
              </div>
            )}
            <p className="dim" style={{ fontSize: 15, marginTop: 8 }}>{h.prevention}</p>
            {h.id === 'distance' && <p style={{ fontSize: 15, marginTop: 6 }}>🛰 {GROUND_CONTACT_NOTE}</p>}
          </details>
        );
      })}
    </div>
  );
}
