// Shown right after a check-in: immediate response for every orange/red value (PLAN.md feature 3).
import type { CrewId } from '../../types';
import { crewById } from '../../data/crew';
import { ruleById } from '../../data/rules';
import { PROBLEMS } from '../../data/problems';
import { mascotForStatus, MASCOT_IMAGES } from '../../data/mascot';
import { statusRank } from '../../engine/aggregate';
import { problemsForResult } from '../../engine/problems';
import { useAppStore } from '../../store/useAppStore';
import { useTimeline } from '../../store/useCrewView';
import { Modal, StatusChip } from '../common';
import ActionBox from './ActionBox';

export default function ScanResults({ crewId, flightDay }: { crewId: CrewId; flightDay: number }) {
  const dismiss = useAppStore((s) => s.dismissResults);
  const crew = crewById(crewId);
  const day = useTimeline(crewId).find((d) => d.entry.flightDay === flightDay);
  if (!day) return null;

  const issues = day.results
    .filter((r) => r.ruleId.startsWith('CH-') && (r.status === 'red' || r.status === 'orange' || r.status === 'grey'))
    .sort((a, b) => statusRank(b.status) - statusRank(a.status));
  const cross = day.results.filter((r) => r.ruleId.startsWith('X-') && r.status !== 'green');
  const sick = day.results.some((r) => (r.ruleId === 'CH-SYMPTOMS' || r.ruleId === 'CH-TEMP') && r.status === 'red');
  const mood = mascotForStatus(day.overall, { sick });

  return (
    <Modal
      wide
      title={<>Scan results · {crew.displayName} · FD {flightDay}</>}
      icon={<StatusChip status={day.overall} />}
      onClose={dismiss}
      footer={<><span className="dim" style={{ flex: 1, fontSize: 15 }}>The body map, charts and rules have been updated.</span><button className="btn btn-primary" onClick={dismiss}>Show body scan →</button></>}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: 22 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
          <img src={MASCOT_IMAGES[mood.image]} alt="Dr. Biscuit" style={{ width: 140, height: 168, objectFit: 'contain', background: '#f6f8ff', borderRadius: 16, padding: 6 }} />
          <div className="panel" style={{ padding: '10px 12px', fontSize: 15 }}>{mood.line}</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {issues.length === 0 && <p style={{ fontSize: 22 }}>✓ All values are in the green range. Have a great day!</p>}
          {issues.map((r) => {
            const rule = ruleById(r.ruleId);
            const problems = problemsForResult(PROBLEMS, r, day.entry).filter((p) => p.response || p.prevention).slice(0, 2);
            return (
              <div key={r.ruleId} className="panel" style={{ padding: 14, display: 'grid', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <StatusChip status={r.status} />
                  <strong style={{ flex: 1 }}>{rule.label}</strong>
                  <span className="mono dim">{r.valueLabel}</span>
                </div>
                <div className="dim" style={{ fontSize: 16 }}>{r.reason}</div>
                <ActionBox result={r} />
                {r.status !== 'grey' && problems.map((p) => (
                  <div key={p.id} style={{ fontSize: 16 }}>
                    <strong>{p.title}: </strong>
                    {p.response && <span><span style={{ color: 'var(--accent)' }}>Response</span> {p.response} </span>}
                    {p.prevention && <span><span style={{ color: 'var(--green)' }}>Prevention</span> {p.prevention}</span>}
                  </div>
                ))}
              </div>
            );
          })}
          {cross.map((r) => (
            <div key={r.ruleId} className="panel" style={{ padding: 12, borderColor: 'rgba(94,231,255,0.35)' }}>
              <strong>{ruleById(r.ruleId).label}: </strong><span className="dim">{r.reason}</span>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}
