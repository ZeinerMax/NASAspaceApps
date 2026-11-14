// One indicator over time: shaded orange/red zones and one FILLED dot per day, coloured by that day's status:
// green = healthy, orange = warning, red = immediate action. Grey = no rating possible (exercise/EVA reading, or no
// threshold exists). A day without an entry has no dot at all.
import { memo, useMemo } from 'react';
import { CartesianGrid, ComposedChart, Line, ReferenceArea, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { CrewMember, Status } from '../../types';
import type { DayView } from '../../store/useCrewView';
import { STATUS_COLOR, StatusChip } from '../common';
import type { Metric } from './metrics';

interface Row { fd: number; value: number | null; status: Status }

/** Dot colour: the status colour; "no rating" (info/grey) shows as a filled neutral grey. */
const dotColor = (s: Status) => (s === 'green' || s === 'orange' || s === 'red' ? STATUS_COLOR[s] : '#8b97b5');

function TrendChart({ metric, timeline, crew, onHowTo }: { metric: Metric; timeline: DayView[]; crew: CrewMember; onHowTo: (id: string) => void }) {
  const history = useMemo(() => timeline.map((d) => d.entry), [timeline]);
  const rows: Row[] = useMemo(() => timeline.map((d) => ({
    fd: d.entry.flightDay,
    value: metric.value(d.entry, crew, history),
    status: d.results.find((r) => r.ruleId === metric.ruleId)?.status ?? 'grey',
  })), [timeline, history, metric, crew]);

  const zones = useMemo(() => metric.zones?.(crew, history) ?? [], [metric, crew, history]);
  const latest = [...rows].reverse().find((r) => r.value != null) ?? rows[rows.length - 1];
  const [d0, d1] = metric.domain ?? ['auto', 'auto'];
  const domain: [any, any] = [
    d0 === 'auto' ? 'auto' : (min: number) => Math.floor(Math.min(d0, min)),
    d1 === 'auto' ? 'auto' : (max: number) => Math.ceil(Math.max(d1, max)),
  ];

  return (
    <div className="panel" style={{ padding: '12px 12px 6px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
        <h3 style={{ fontSize: 18, flex: 1 }}>{metric.label} <span className="faint" style={{ fontSize: 14 }}>{metric.unit}</span></h3>
        <span className="mono" style={{ color: dotColor(latest.status), fontWeight: 600 }}>{latest.value == null ? '—' : latest.value.toFixed(metric.digits)}</span>
        <StatusChip status={latest.status} />
      </div>
      <div style={{ height: 170 }}>
        <ResponsiveContainer>
          <ComposedChart data={rows} margin={{ top: 6, right: 8, bottom: 0, left: -18 }}>
            <CartesianGrid stroke="rgba(120,160,255,0.08)" vertical={false} />
            {zones.map((z, i) => (
              <ReferenceArea key={i} y1={z.y1} y2={z.y2} fill={STATUS_COLOR[z.status]} fillOpacity={z.status === 'green' ? 0.05 : 0.1} stroke="none" ifOverflow="hidden" />
            ))}
            <XAxis dataKey="fd" tick={{ fill: '#9aa8cc', fontSize: 13 }} stroke="rgba(120,160,255,0.2)" />
            <YAxis domain={domain} tick={{ fill: '#9aa8cc', fontSize: 13 }} stroke="rgba(120,160,255,0.2)" width={52} allowDecimals />
            <Line
              dataKey="value" stroke="rgba(200,215,255,0.5)" strokeWidth={2} connectNulls={false} isAnimationActive={false}
              dot={(p: any) => {
                const r: Row = p.payload;
                if (r.value == null) return <g key={p.key} />; // no entry → no marker
                const c = dotColor(r.status);
                return <circle key={p.key} cx={p.cx} cy={p.cy} r={4.5} fill={c} stroke={c} strokeWidth={1} />;
              }}
              activeDot={false}
            />
            <Tooltip
              contentStyle={{ background: '#101834', border: '1px solid rgba(120,160,255,0.25)', borderRadius: 10, fontSize: 14 }}
              labelFormatter={(v) => `Day ${v}`}
              formatter={(v: any) => [v == null ? '—' : `${Number(v).toFixed(metric.digits)} ${metric.unit}`, metric.label]}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div style={{ textAlign: 'right', paddingBottom: 4 }}>
        <button className="link" onClick={() => onHowTo(metric.explanationId)}>How to measure</button>
      </div>
    </div>
  );
}

export default memo(TrendChart);
