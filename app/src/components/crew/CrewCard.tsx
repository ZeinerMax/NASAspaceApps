import { motion } from 'framer-motion';
import type { CrewMember } from '../../types';
import type { DayView } from '../../store/useCrewView';
import { todayIso, useAppStore } from '../../store/useAppStore';
import { ruleById } from '../../data/rules';
import { StatusChip, STATUS_COLOR } from '../common';
import { metricById } from '../trends/metrics';
import Sparkline from '../trends/Sparkline';
import BodySilhouette from './BodySilhouette';

const KEY_METRICS = ['sleep', 'mood', 'sys', 'hr', 'temp', 'glucose', 'water', 'mass'];

export default function CrewCard({ crew, timeline }: { crew: CrewMember; timeline: DayView[] }) {
  const selectCrew = useAppStore((s) => s.selectCrew);
  const openCheckIn = useAppStore((s) => s.openCheckIn);
  const doneToday = useAppStore((s) => s.lastCheckInDate[crew.id] === todayIso());
  const day = timeline[timeline.length - 1];
  const alerts = day.results.filter((r) => r.ruleId.startsWith('CH-') && (r.status === 'red' || r.status === 'orange'));
  const color = STATUS_COLOR[day.overall];

  return (
    <motion.article
      variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } } }}
      className="panel"
      style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 14, borderColor: `color-mix(in srgb, ${color} 45%, transparent)`, boxShadow: day.overall === 'red' ? `0 0 40px -10px ${color}` : undefined }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <h3>{crew.displayName}</h3>
          <div className="dim" style={{ fontSize: 15 }}>
            {crew.sex === 'female' ? 'Female' : 'Male'} · {crew.ageYears} y · FD {day.entry.flightDay} · {day.entry.environment.replace(/_/g, ' ')}
          </div>
        </div>
        <StatusChip status={day.overall} />
      </div>

      <div style={{ display: 'flex', gap: 14 }}>
        <BodySilhouette regions={day.regions} sex={crew.sex} size={190} />
        <div style={{ flex: 1, display: 'grid', gap: 2 }}>
          {KEY_METRICS.map((id) => {
            const m = metricById(id);
            const v = m.value(day.entry, crew, timeline.map((d) => d.entry));
            const st = day.results.find((r) => r.ruleId === m.ruleId)?.status ?? 'grey';
            return (
              <div key={id} style={{ display: 'grid', gridTemplateColumns: '1fr auto 64px', alignItems: 'center', gap: 6, fontSize: 15 }}>
                <span className="dim">{m.label}{id === 'sys' && ' / dia'}</span>
                <span className="mono" style={{ color: STATUS_COLOR[st], fontWeight: 600 }}>
                  {v == null ? '—' : id === 'sys' ? `${v}/${day.entry.bp.dia ?? '—'}` : v.toFixed(m.digits)}
                </span>
                <Sparkline metric={m} timeline={timeline} crew={crew} width={64} height={22} days={14} />
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ minHeight: 48, display: 'flex', flexWrap: 'wrap', gap: 6, alignContent: 'flex-start' }}>
        {alerts.length === 0 ? <span className="dim" style={{ fontSize: 15 }}>No warnings today.</span>
          : alerts.slice(0, 5).map((r) => <StatusChip key={r.ruleId} status={r.status} label={ruleById(r.ruleId).label} />)}
        {alerts.length > 5 && <span className="dim" style={{ fontSize: 15 }}>+{alerts.length - 5} more</span>}
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <button className="btn" style={{ flex: 1, justifyContent: 'center' }} onClick={() => selectCrew(crew.id)}>Body scan →</button>
        <button className="btn btn-primary" disabled={doneToday} onClick={() => openCheckIn(crew.id)} title={doneToday ? 'Already done today' : undefined}>
          {doneToday ? '✓ Checked in today' : 'Daily check-in'}
        </button>
      </div>
    </motion.article>
  );
}
