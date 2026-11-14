import { useCallback, useState } from 'react';
import type { CrewMember } from '../../types';
import type { DayView } from '../../store/useCrewView';
import { METRICS } from './metrics';
import TrendChart from './TrendChart';
import HowToModal from '../checkin/HowToModal';

export default function TrendGrid({ crew, timeline }: { crew: CrewMember; timeline: DayView[] }) {
  const [howTo, setHowTo] = useState<string | null>(null);
  const open = useCallback((id: string) => setHowTo(id), []);
  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: 12, paddingBottom: 90 }}>
        {METRICS.map((m) => <TrendChart key={m.id} metric={m} timeline={timeline} crew={crew} onHowTo={open} />)}
      </div>
      {howTo && <HowToModal id={howTo} onClose={() => setHowTo(null)} />}
    </>
  );
}
