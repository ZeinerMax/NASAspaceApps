import { useState } from 'react';
import type { CrewMember } from '../../types';
import type { DayView } from '../../store/useCrewView';
import { METRICS } from './metrics';
import TrendChart from './TrendChart';
import HowToModal from '../checkin/HowToModal';

export default function TrendGrid({ crew, timeline, viewDay }: { crew: CrewMember; timeline: DayView[]; viewDay: number }) {
  const [howTo, setHowTo] = useState<string | null>(null);
  return (
    <>
      <div className="dim" style={{ fontSize: 15, display: 'flex', gap: 18, flexWrap: 'wrap' }}>
        <span>Dots are coloured by that day's rule status.</span>
        <span><span style={{ display: 'inline-block', width: 22, height: 10, background: 'rgba(94,231,255,0.25)', borderRadius: 3, verticalAlign: 'middle' }} /> personal baseline (mean ± 2 SD, rolling)</span>
        <span>○ hollow = exercise/EVA reading (not rated)</span>
        <span style={{ color: 'var(--accent)' }}>◎ ringed = new daily check-in</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))', gap: 14, paddingBottom: 140 }}>
        {METRICS.map((m) => <TrendChart key={m.id} metric={m} timeline={timeline} crew={crew} viewDay={viewDay} onHowTo={setHowTo} />)}
      </div>
      {howTo && <HowToModal id={howTo} onClose={() => setHowTo(null)} />}
    </>
  );
}
