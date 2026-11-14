// Landing page: ONE crew member at a time (selector on top), a short status summary, and a compact ship strip.
// Fits in one window without scrolling. Click the crew member to open the detail view.
import { memo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { crewById } from '../../data/crew';
import { ruleById } from '../../data/rules';
import { mascotForStatus } from '../../data/mascot';
import { symptomDef } from '../../data/symptoms';
import { statusRank } from '../../engine/aggregate';
import { todayIso, useAppStore } from '../../store/useAppStore';
import { useAllCrew, useShipResults } from '../../store/useCrewView';
import { Modal, StatusChip, STATUS_COLOR } from '../common';
import AnatomyBody from '../body/AnatomyBody';
import CrewSelector from '../crew/CrewSelector';
import Mascot from '../mascot/Mascot';
import ShipStrip from '../ship/ShipStrip';
import ShipTab from '../ship/ShipTab';
import { metricById } from '../trends/metrics';

const VITALS = ['sleep', 'mood', 'sys', 'hr', 'temp', 'glucose'];

/** Own component: it re-renders every 2 s with the simulated feed, nothing else on the page does. */
const ShipPanel = memo(function ShipPanel({ flightDay, headache }: { flightDay: number; headache: boolean }) {
  const ship = useShipResults(flightDay);
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="panel ship-panel"><ShipStrip results={ship} highlight={headache ? ['SH-CO2'] : []} onOpen={() => setOpen(true)} /></div>
      {open && <Modal wide title="Ship" onClose={() => setOpen(false)}><ShipTab ship={ship} /></Modal>}
    </>
  );
});

export default function Landing() {
  const crewId = useAppStore((s) => s.landingCrew);
  const setLandingCrew = useAppStore((s) => s.setLandingCrew);
  const selectCrew = useAppStore((s) => s.selectCrew);
  const openCheckIn = useAppStore((s) => s.openCheckIn);
  const doneToday = useAppStore((s) => s.lastCheckInDate[crewId] === todayIso());

  const { timelines, latest } = useAllCrew();

  const crew = crewById(crewId);
  const day = latest[crewId];
  const entries = timelines[crewId].map((d) => d.entry);
  const alerts = day.results
    .filter((r) => r.ruleId.startsWith('CH-') && (r.status === 'orange' || r.status === 'red'))
    .sort((a, b) => statusRank(b.status) - statusRank(a.status));
  const sick = day.results.some((r) => (r.ruleId === 'CH-SYMPTOMS' || r.ruleId === 'CH-TEMP') && r.status === 'red');
  const headache = day.entry.symptoms.some((c) => symptomDef(c).headache);

  return (
    <div className="landing">
      <CrewSelector value={crewId} onChange={setLandingCrew} latest={latest} />

      <AnimatePresence mode="wait" initial={false}>
        <motion.article
          key={crewId}
          className="panel landing-card"
          role="button"
          tabIndex={0}
          aria-label={`Open details of ${crew.displayName}`}
          onClick={() => selectCrew(crewId)}
          onKeyDown={(e) => { if (e.key === 'Enter') selectCrew(crewId); }}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
          style={{ borderColor: `color-mix(in srgb, ${STATUS_COLOR[day.overall]} 45%, transparent)`, boxShadow: day.overall === 'red' ? `0 0 40px -12px ${STATUS_COLOR.red}` : undefined }}
        >
          <div className="landing-body">
            <AnatomyBody sex={crew.sex} regionStatus={day.regions} />
          </div>
          <div className="landing-info">
            <div>
              <h2 style={{ fontSize: 30 }}>{crew.displayName}</h2>
              <div className="dim">{crew.sex === 'female' ? 'Female' : 'Male'} · {crew.ageYears} y · day {day.entry.flightDay}</div>
            </div>
            <div><span style={{ fontSize: 20 }}><StatusChip status={day.overall} /></span></div>
            <div className="vitals">
              {VITALS.map((id) => {
                const m = metricById(id);
                const v = m.value(day.entry, crew, entries);
                const st = day.results.find((r) => r.ruleId === m.ruleId)?.status ?? 'grey';
                return (
                  <div key={id} className="vital">
                    <span className="dim">{m.label.replace('Systolic BP', 'Blood pressure').replace('Resting heart rate', 'Heart rate').replace('Body temperature', 'Temperature').replace('Fasting glucose', 'Glucose')}</span>
                    <span className="mono" style={{ color: STATUS_COLOR[st], fontWeight: 600 }}>
                      {v == null ? '—' : id === 'sys' ? `${v}/${day.entry.bp.dia ?? '—'}` : v.toFixed(m.digits)}
                      <span className="faint" style={{ fontSize: 13, fontWeight: 400 }}> {m.unit === '/10' ? '' : m.unit}</span>
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="chips">
              {alerts.length === 0
                ? <span className="dim">No warnings</span>
                : <>
                    {alerts.slice(0, 3).map((r) => <StatusChip key={r.ruleId} status={r.status} label={ruleById(r.ruleId).label} />)}
                    {alerts.length > 3 && <span className="dim">+{alerts.length - 3} more</span>}
                  </>}
            </div>
            <div className="landing-actions">
              <button className="btn btn-primary" onClick={(e) => { e.stopPropagation(); selectCrew(crewId); }}>Details →</button>
              <button className="btn" disabled={doneToday} onClick={(e) => { e.stopPropagation(); openCheckIn(crewId); }}>{doneToday ? '✓ Done today' : '+ Check-in'}</button>
            </div>
          </div>
        </motion.article>
      </AnimatePresence>

      <ShipPanel flightDay={day.entry.flightDay} headache={headache} />
      <Mascot mood={mascotForStatus(day.overall, { name: crew.id, sick })} />
    </div>
  );
}
