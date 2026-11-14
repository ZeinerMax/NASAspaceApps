// Tiny inline trend: line + dots coloured by that day's rule status.
import type { DayView } from '../../store/useCrewView';
import type { CrewMember } from '../../types';
import { STATUS_COLOR } from '../common';
import type { Metric } from './metrics';

export default function Sparkline({ metric, timeline, crew, width = 140, height = 34, days = 20 }: {
  metric: Metric; timeline: DayView[]; crew: CrewMember; width?: number; height?: number; days?: number;
}) {
  const tl = timeline.slice(-days);
  const all = timeline.map((d) => d.entry);
  const pts = tl.map((d) => ({ v: metric.value(d.entry, crew, all), s: d.results.find((r) => r.ruleId === metric.ruleId)?.status ?? 'grey' }));
  const vals = pts.map((p) => p.v).filter((v): v is number => v != null);
  if (!vals.length) return <svg width={width} height={height} />;
  const min = Math.min(...vals), max = Math.max(...vals);
  const pad = 4;
  const x = (i: number) => pad + (i * (width - 2 * pad)) / Math.max(1, tl.length - 1);
  const y = (v: number) => (max === min ? height / 2 : height - pad - ((v - min) / (max - min)) * (height - 2 * pad));
  const path = pts.map((p, i) => (p.v == null ? null : `${x(i)},${y(p.v)}`)).filter(Boolean).join(' ');
  return (
    <svg width={width} height={height} aria-hidden>
      <polyline points={path} fill="none" stroke="rgba(160,190,255,0.45)" strokeWidth={1.5} />
      {pts.map((p, i) => p.v != null && (
        <circle key={i} cx={x(i)} cy={y(p.v)} r={i === pts.length - 1 ? 3.6 : 2.2} fill={STATUS_COLOR[p.s]} />
      ))}
    </svg>
  );
}
