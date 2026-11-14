// One crew member: day scrubber, tabs (Body | Trends | Rules | Problems & Solutions | Ship), mascot.
import { useState } from 'react';
import { motion } from 'framer-motion';
import type { CrewId, RegionId } from '../../types';
import { crewById } from '../../data/crew';
import { mascotForStatus } from '../../data/mascot';
import { symptomDef } from '../../data/symptoms';
import { todayIso, useAppStore, type Tab } from '../../store/useAppStore';
import { useDayView, useHazards, useShipResults } from '../../store/useCrewView';
import { StatusChip } from '../common';
import BodyScene from '../body/BodyScene';
import RegionPanel from '../body/RegionPanel';
import HazardView from '../body/HazardView';
import Mascot from '../mascot/Mascot';
import TrendGrid from '../trends/TrendGrid';
import RulesTab from '../rules/RulesTab';
import ProblemsTab from '../problems/ProblemsTab';
import ShipTab from '../ship/ShipTab';
import ShipStrip from '../ship/ShipStrip';

const TABS: { id: Tab; label: string }[] = [
  { id: 'body', label: 'Body scan' }, { id: 'trends', label: 'Trends' }, { id: 'rules', label: 'Rules' },
  { id: 'problems', label: 'Problems & solutions' }, { id: 'ship', label: 'Ship' },
];

export default function CrewDetail({ crewId }: { crewId: CrewId }) {
  const crew = crewById(crewId);
  const { timeline, day } = useDayView(crewId);
  const tab = useAppStore((s) => s.tab);
  const setTab = useAppStore((s) => s.setTab);
  const setViewDay = useAppStore((s) => s.setViewDay);
  const openCheckIn = useAppStore((s) => s.openCheckIn);
  const doneToday = useAppStore((s) => s.lastCheckInDate[crewId] === todayIso());
  const ship = useShipResults(day.entry.flightDay);
  const hazards = useHazards(day, ship);
  const [region, setRegion] = useState<RegionId | null>(null);
  const [hazardMode, setHazardMode] = useState(false);

  const first = timeline[0].entry.flightDay;
  const last = timeline[timeline.length - 1].entry.flightDay;
  const isLatest = day.entry.flightDay === last;
  const sick = day.results.some((r) => (r.ruleId === 'CH-SYMPTOMS' || r.ruleId === 'CH-TEMP') && r.status === 'red');
  const mood = mascotForStatus(day.overall, { name: crew.id, sick });
  const co2Highlight = day.entry.symptoms.some((c) => symptomDef(c).headache) ? ['SH-CO2'] : [];

  return (
    <>
      {/* title row + day scrubber */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
        <div>
          <h2>{crew.displayName}</h2>
          <div className="dim" style={{ fontSize: 15 }}>
            {crew.sex === 'female' ? 'Female' : 'Male'} · {crew.ageYears} y · {day.entry.environment.replace(/_/g, ' ')} · {day.entry.condition.replace('_', ' ')}
            {day.entry.source === 'user' && <> · <span style={{ color: 'var(--accent)' }}>daily check-in {day.entry.date}</span></>}
          </div>
        </div>
        <StatusChip status={day.overall} />
        <div className="panel" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 16px', flex: '1 1 340px', maxWidth: 560 }}>
          <span className="dim" style={{ fontSize: 15, whiteSpace: 'nowrap' }}>Flight day</span>
          <input type="range" min={first} max={last} value={day.entry.flightDay} style={{ flex: 1, accentColor: '#5ee7ff' }}
            onChange={(e) => { const v = Number(e.target.value); setViewDay(v === last ? null : v); }} aria-label="Flight day" />
          <span className="mono" style={{ fontSize: 20, minWidth: 64 }}>FD {day.entry.flightDay}</span>
          {!isLatest && <button className="btn btn-sm" onClick={() => setViewDay(null)}>Latest</button>}
        </div>
        <div className="spacer" />
        <button className="btn btn-primary" disabled={doneToday} onClick={() => openCheckIn(crewId)}>
          {doneToday ? '✓ Checked in today' : '+ Daily check-in'}
        </button>
      </div>

      <div className="tabs" role="tablist">
        {TABS.map((t) => (
          <button key={t.id} className="tab" role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)}>
            {tab === t.id && <motion.span layoutId="tab-bg" className="tab-bg" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />}
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'body' && (
        <div className="grid-2" style={{ flex: 1 }}>
          <div className="panel" style={{ position: 'relative', minHeight: 560, overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 14, left: 16, zIndex: 2, display: 'flex', gap: 8 }}>
              <button className="btn btn-sm" aria-pressed={!hazardMode} onClick={() => setHazardMode(false)}
                style={!hazardMode ? { borderColor: 'var(--accent)' } : undefined}>Body regions</button>
              <button className="btn btn-sm" aria-pressed={hazardMode} onClick={() => setHazardMode(true)}
                style={hazardMode ? { borderColor: 'var(--accent)' } : undefined}>Five hazards</button>
            </div>
            {hazardMode ? (
              <div style={{ paddingTop: 52 }} className="scroll"><HazardView statuses={hazards} /></div>
            ) : (
              <>
                <div style={{ position: 'absolute', inset: 0 }}>
                  <BodyScene sex={crew.sex} regionStatus={day.regions} selected={region} onSelect={setRegion} scanKey={`${crewId}-${day.entry.id}`} />
                </div>
                <div style={{ position: 'absolute', top: 16, right: 16, display: 'grid', gap: 4, fontSize: 14, padding: '8px 12px', background: 'rgba(5,8,22,0.6)', borderRadius: 10 }} className="dim">
                  <span><span className="dot" style={{ display: 'inline-block', background: 'var(--green)' }} /> healthy</span>
                  <span><span className="dot" style={{ display: 'inline-block', background: 'var(--orange)' }} /> warning</span>
                  <span><span className="dot" style={{ display: 'inline-block', background: 'var(--red)' }} /> act now</span>
                  <span><span className="dot" style={{ display: 'inline-block', background: 'var(--grey)' }} /> no data</span>
                  <span className="faint" style={{ marginTop: 4 }}>drag to rotate<br />floor ring = whole body</span>
                </div>
              </>
            )}
          </div>
          <div className="panel scroll" style={{ padding: 18, maxHeight: 'calc(100vh - 290px)', minHeight: 560 }}>
            <RegionPanel crew={crew} day={day} timeline={timeline} region={region} onSelect={setRegion} />
          </div>
          <div className="panel" style={{ padding: 14, gridColumn: '1 / -1', marginRight: 300 }}>
            <ShipStrip results={ship} highlight={co2Highlight} onOpen={() => setTab('ship')} />
          </div>
        </div>
      )}
      {tab === 'trends' && <TrendGrid crew={crew} timeline={timeline} viewDay={day.entry.flightDay} />}
      {tab === 'rules' && <RulesTab day={day} ship={ship} />}
      {tab === 'problems' && <ProblemsTab day={day} ship={ship} />}
      {tab === 'ship' && <ShipTab ship={ship} />}

      <Mascot mood={mood} />
    </>
  );
}
