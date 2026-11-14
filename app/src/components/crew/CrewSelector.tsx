// Selector for the 4 crew members (2 women, 2 men) with a sliding highlight. Arrow keys also work.
import { memo } from 'react';
import { motion } from 'framer-motion';
import type { CrewId } from '../../types';
import { CREW } from '../../data/crew';
import type { DayView } from '../../store/useCrewView';
import { STATUS_COLOR } from '../common';

function CrewSelector({ value, onChange, latest }: { value: CrewId; onChange: (id: CrewId) => void; latest: Record<CrewId, DayView> }) {
  const move = (d: number) => onChange(CREW[(CREW.findIndex((c) => c.id === value) + d + CREW.length) % CREW.length].id);
  return (
    <div
      className="crew-selector"
      role="tablist"
      aria-label="Crew member"
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') { e.preventDefault(); move(1); }
        if (e.key === 'ArrowLeft') { e.preventDefault(); move(-1); }
      }}
    >
      {CREW.map((c) => {
        const st = latest[c.id].overall;
        const on = c.id === value;
        return (
          <button key={c.id} role="tab" aria-selected={on} tabIndex={on ? 0 : -1} className="crew-pill" onClick={() => onChange(c.id)}>
            {on && <motion.span layoutId="crew-pill-bg" className="tab-bg" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />}
            <span className={`dot ${st === 'red' ? 'pulse' : ''}`} style={{ background: STATUS_COLOR[st] }} />
            <span>{c.sex === 'female' ? '♀' : '♂'} {c.id}</span>
          </button>
        );
      })}
    </div>
  );
}

export default memo(CrewSelector);
