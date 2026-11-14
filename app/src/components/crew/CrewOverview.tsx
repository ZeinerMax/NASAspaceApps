// Start screen: all 4 crew with their data visible (team decision 13) + ship tiles + mascot.
import { motion } from 'framer-motion';
import { CREW } from '../../data/crew';
import { mascotForStatus } from '../../data/mascot';
import { buildTimeline, useShipResults } from '../../store/useCrewView';
import { useAppStore } from '../../store/useAppStore';
import { worst } from '../../engine/aggregate';
import Mascot from '../mascot/Mascot';
import ShipStrip from '../ship/ShipStrip';
import CrewCard from './CrewCard';
import { useMemo } from 'react';

export default function CrewOverview() {
  const userEntries = useAppStore((s) => s.userEntries);
  const timelines = useMemo(() => CREW.map((c) => buildTimeline(c.id, userEntries)), [userEntries]);
  const maxDay = Math.max(...timelines.map((t) => t[t.length - 1].entry.flightDay));
  const ship = useShipResults(maxDay);

  const latest = timelines.map((t) => t[t.length - 1]);
  const overall = worst(latest.map((d) => d.overall));
  const reds = CREW.filter((_, i) => latest[i].overall === 'red').map((c) => c.id);
  const mood = overall === 'red'
    ? { image: 'alarm' as const, line: `Crew member${reds.length > 1 ? 's' : ''} ${reds.join(', ')} need${reds.length > 1 ? '' : 's'} attention now. Open the card to see why.` }
    : overall === 'green' ? mascotForStatus('green', { name: 'Whole crew' })
    : { image: 'default' as const, line: "Hi, I'm Dr. Biscuit! Each card shows today's status. Start with the daily check-in." };

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
        <h2>Crew overview</h2>
        <span className="dim">Latest status of all 4 crew members · flight day {maxDay}</span>
      </div>
      <motion.div
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(330px, 1fr))', gap: 18 }}
        initial="hidden" animate="show"
        variants={{ show: { transition: { staggerChildren: 0.06 } } }}
      >
        {CREW.map((c, i) => <CrewCard key={c.id} crew={c} timeline={timelines[i]} />)}
      </motion.div>
      <div className="panel" style={{ padding: 16, marginRight: 300 }}>
        <ShipStrip results={ship} />
      </div>
      <Mascot mood={mood} />
    </>
  );
}
