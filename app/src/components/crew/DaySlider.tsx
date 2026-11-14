// Flight-day slider that stays smooth while dragging.
// The thumb follows the pointer through LOCAL state (instant). The rest of the page is updated at most once per
// animation frame, and a fixed-size layout means nothing moves while the value changes.
import { memo, useEffect, useRef, useState } from 'react';

function DaySlider({ min, max, value, onCommit }: { min: number; max: number; value: number; onCommit: (day: number) => void }) {
  const [local, setLocal] = useState(value);
  const raf = useRef(0);
  const pending = useRef<number | null>(null); // value we sent to the page and are waiting to see come back

  // follow outside changes (e.g. a new check-in), but never fight the user's drag
  useEffect(() => {
    if (pending.current == null || value === pending.current) {
      pending.current = null;
      setLocal(value);
    }
  }, [value]);
  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value);
    setLocal(v);
    pending.current = v;
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => onCommit(v));
  };

  return (
    <div className="panel day-slider">
      <span className="dim">Day</span>
      <input type="range" min={min} max={max} step={1} value={local} onChange={onChange} aria-label="Flight day" />
      <span className="mono day-num">{local}</span>
    </div>
  );
}

export default memo(DaySlider);
