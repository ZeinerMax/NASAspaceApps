// Flat 2D body used on the overview cards (the 3D body is in components/body).
import type { RegionId, Status } from '../../types';
import { STATUS_COLOR } from '../common';

export default function BodySilhouette({ regions, sex, size = 150 }: { regions: Record<RegionId, Status>; sex: 'male' | 'female'; size?: number }) {
  const f = (r: RegionId) => STATUS_COLOR[regions[r]];
  const sh = sex === 'female' ? 0.88 : 1; // shoulder width
  const hip = sex === 'female' ? 1.08 : 1;
  const style = (r: RegionId) => ({ fill: f(r), fillOpacity: 0.28, stroke: f(r), strokeWidth: 1.6 });
  return (
    <svg viewBox="0 0 100 200" width={size * 0.5} height={size} aria-label="Body status">
      <defs>
        <filter id="glow"><feGaussianBlur stdDeviation="2.2" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      </defs>
      {/* whole-body aura */}
      <ellipse cx="50" cy="104" rx="46" ry="96" fill="none" stroke={f('body')} strokeOpacity={0.55} strokeDasharray="3 4" strokeWidth={1.4} />
      <g filter="url(#glow)">
        <circle cx="50" cy="24" r="14" {...style('head')} />
        <rect x={50 - 20 * sh} y="42" width={40 * sh} height="40" rx="10" {...style('chest')} />
        <rect x={50 - 17 * hip} y="84" width={34 * hip} height="30" rx="9" {...style('abdomen')} />
        <rect x={50 - 20 * sh - 11} y="44" width="9" height="66" rx="4.5" {...style('arms')} />
        <rect x={50 + 20 * sh + 2} y="44" width="9" height="66" rx="4.5" {...style('arms')} />
        <rect x={50 - 15 * hip} y="117" width="13" height="74" rx="6" {...style('legs')} />
        <rect x={50 + 15 * hip - 13} y="117" width="13" height="74" rx="6" {...style('legs')} />
      </g>
    </svg>
  );
}
