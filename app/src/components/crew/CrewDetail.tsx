// One crew member: header with day slider, tabs (Details | Trends | Problems | Tutorials), mascot.
// No ship information here (it lives on the landing page).
import { memo, useCallback, useDeferredValue, useState } from 'react';
import { motion } from 'framer-motion';
import type { CrewId, RegionId } from '../../types';
import { crewById } from '../../data/crew';
import { mascotForStatus } from '../../data/mascot';
import { todayIso, useAppStore, type Tab } from '../../store/useAppStore';
import { radiationFor, useDayView, useHazards, useShipStatuses } from '../../store/useCrewView';
import { StatusChip } from '../common';
import BodyScene from '../body/BodyScene';
import RegionPanel from '../body/RegionPanel';
import HazardView from '../body/HazardView';
import Mascot from '../mascot/Mascot';
import TrendGrid from '../trends/TrendGrid';
import ProblemsTab from '../problems/ProblemsTab';
import TutorialsTab from './TutorialsTab';
import DaySlider from './DaySlider';

const TABS: { id: Tab; label: string }[] = [
  { id: 'details', label: 'Details' },
  { id: 'trends', label: 'Trends' },
  { id: 'problems', label: 'Problems' },
  { id: 'tutorials', label: 'Tutorials' },
];

/**
 * Tab bar is isolated (memo): its sliding highlight uses framer-motion layout animation, which re-measures the page on
 * every re-render. Without this, every step of the day slider forced a layout measurement (visible as hitches).
 */
const TabBar = memo(function TabBar({ tab, onTab }: { tab: Tab; onTab: (t: Tab) => void }) {
  return (
    <div className="tabs" role="tablist" aria-label="Crew details">
      {TABS.map((t) => (
        <button key={t.id} className="tab" role="tab" aria-selected={tab === t.id} onClick={() => onTab(t.id)}>
          {tab === t.id && <motion.span layoutId="tab-bg" className="tab-bg" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />}
          {t.label}
        </button>
      ))}
    </div>
  );
});

/** Mascot is isolated so its typing animation never re-renders the rest while the slider moves. */
const CrewMascot = memo(function CrewMascot({ crewId, overall, sick }: { crewId: string; overall: Parameters<typeof mascotForStatus>[0]; sick: boolean }) {
  return <Mascot mood={mascotForStatus(overall, { name: crewId, sick })} />;
});

export default function CrewDetail({ crewId }: { crewId: CrewId }) {
  const crew = crewById(crewId);
  const { timeline, day } = useDayView(crewId);
  const tab = useAppStore((s) => s.tab);
  const setTab = useAppStore((s) => s.setTab);
  const setViewDay = useAppStore((s) => s.setViewDay);
  const openCheckIn = useAppStore((s) => s.openCheckIn);
  const doneToday = useAppStore((s) => s.lastCheckInDate[crewId] === todayIso());
  const shipStatuses = useShipStatuses(day.entry.flightDay);
  const hazards = useHazards(day, shipStatuses);
  const radiation = radiationFor(day.entry.flightDay);
  const [region, setRegion] = useState<RegionId | null>(null);
  const [hazardMode, setHazardMode] = useState(false);

  const first = timeline[0].entry.flightDay;
  const last = timeline[timeline.length - 1].entry.flightDay;
  const commitDay = useCallback((d: number) => setViewDay(d === last ? null : d), [setViewDay, last]);

  // the mascot follows the day with a small delay so dragging the slider stays smooth
  const mascotDay = useDeferredValue(day);
  const sick = mascotDay.results.some((r) => (r.ruleId === 'CH-SYMPTOMS' || r.ruleId === 'CH-TEMP') && r.status === 'red');

  return (
    <>
      <div className="detail-head">
        <div>
          <h2>{crew.displayName}</h2>
          <div className="dim" style={{ fontSize: 15 }}>{crew.sex === 'female' ? 'Female' : 'Male'} · {crew.ageYears} y</div>
        </div>
        {/* fixed-width slot: the chip text changes width with the status and would otherwise push the slider sideways */}
        <div className="status-slot"><StatusChip status={day.overall} /></div>
        {tab !== 'trends' && tab !== 'tutorials' && <DaySlider min={first} max={last} value={day.entry.flightDay} onCommit={commitDay} />}
        <div className="spacer" />
        <button className="btn btn-primary" disabled={doneToday} onClick={() => openCheckIn(crewId)}>
          {doneToday ? '✓ Done today' : '+ Check-in'}
        </button>
      </div>

      <TabBar tab={tab} onTab={setTab} />

      {tab === 'details' && (
        <div className="details-grid">
          <div className="panel details-body">
            <BodyScene sex={crew.sex} regionStatus={day.regions} selected={region} onSelect={setRegion} />
          </div>
          <div className="panel scroll details-side">
            <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
              <button className="btn btn-sm" aria-pressed={!hazardMode} onClick={() => setHazardMode(false)} style={!hazardMode ? { borderColor: 'var(--accent)' } : undefined}>Body</button>
              <button className="btn btn-sm" aria-pressed={hazardMode} onClick={() => setHazardMode(true)} style={hazardMode ? { borderColor: 'var(--accent)' } : undefined}>Hazards</button>
            </div>
            {hazardMode ? <HazardView statuses={hazards} radiation={radiation} /> : <RegionPanel day={day} region={region} onSelect={setRegion} />}
          </div>
        </div>
      )}
      {tab === 'trends' && <TrendGrid crew={crew} timeline={timeline} />}
      {tab === 'problems' && <ProblemsTab day={day} />}
      {tab === 'tutorials' && <TutorialsTab />}

      <CrewMascot crewId={crew.id} overall={mascotDay.overall} sick={sick} />
    </>
  );
}
