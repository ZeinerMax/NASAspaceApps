// One indicator over time: shaded orange/red zones, rolling personal baseline band, dots coloured by status.
// Hollow dots = exercise/EVA readings (not rated). Ringed dots = new daily check-ins.
import { useMemo } from 'react';
import { Area, CartesianGrid, ComposedChart, Line, ReferenceArea, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { CrewMember, Status } from '../../types';
import type { DayView } from '../../store/useCrewView';
import { computeBaseline } from '../../engine/baseline';
import { ruleById } from '../../data/rules';
import { STATUS_COLOR, StatusChip } from '../common';
import type { Metric } from './metrics';

interface Row { fd: number; value: number | null; band: [number, number] | null; status: Status; exercise: boolean; user: boolean }

export default function TrendChart({ metric, timeline, crew, viewDay, onHowTo }: {
  metric: Metric; timeline: DayView[]; crew: CrewMember; viewDay: number; onHowTo: (id: string) => void;
}) {
  const history = useMemo(() => timeline.map((d) => d.entry), [timeline]);
  const rows: Row[] = useMemo(() => timeline.map((d) => {
    const b = metric.baseline ? computeBaseline(history, metric.baseline, d.entry.flightDay) : null;
    return {
      fd: d.entry.flightDay,
      value: metric.value(d.entry, crew, history),
      band: b ? [b.low, b.high] : null,
      status: d.results.find((r) => r.ruleId === metric.ruleId)?.status ?? 'grey',
      exercise: d.entry.condition === 'eva' || d.entry.condition === 'post_exercise',
      user: d.entry.source === 'user',
    };
  }), [timeline, history, metric, crew]);

  const zones = metric.zones?.(crew, history) ?? [];
  const latest = rows.find((r) => r.fd === viewDay) ?? rows[rows.length - 1];
  const [d0, d1] = metric.domain ?? ['auto', 'auto'];
  const domain: [any, any] = [
    d0 === 'auto' ? 'auto' : (min: number) => Math.floor(Math.min(d0, min)),
    d1 === 'auto' ? 'auto' : (max: number) => Math.ceil(Math.max(d1, max)),
  ];
  const rule = ruleById(metric.ruleId);

  return (
    <div className="panel" style={{ padding: '14px 14px 6px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
        <h3 style={{ fontSize: 18, flex: 1 }}>{metric.label} <span className="faint" style={{ fontSize: 14 }}>{metric.unit}</span></h3>
        <span className="mono" style={{ color: STATUS_COLOR[latest.status], fontWeight: 600 }}>
          {latest.value == null ? '—' : latest.value.toFixed(metric.digits)}
        </span>
        <StatusChip status={latest.status} />
      </div>
      <div style={{ height: 190 }}>
        <ResponsiveContainer>
          <ComposedChart data={rows} margin={{ top: 6, right: 8, bottom: 0, left: -18 }}>
            <CartesianGrid stroke="rgba(120,160,255,0.08)" vertical={false} />
            {zones.map((z, i) => (
              <ReferenceArea key={i} y1={z.y1} y2={z.y2} fill={STATUS_COLOR[z.status]} fillOpacity={z.status === 'green' ? 0.05 : 0.1} stroke="none" ifOverflow="hidden" />
            ))}
            <XAxis dataKey="fd" tick={{ fill: '#9aa8cc', fontSize: 13 }} tickFormatter={(v) => `${v}`} stroke="rgba(120,160,255,0.2)" />
            <YAxis domain={domain} tick={{ fill: '#9aa8cc', fontSize: 13 }} stroke="rgba(120,160,255,0.2)" width={52} allowDecimals />
            {metric.baseline && <Area dataKey="band" stroke="none" fill="#5ee7ff" fillOpacity={0.13} isAnimationActive={false} connectNulls />}
            <ReferenceLine x={viewDay} stroke="rgba(94,231,255,0.6)" strokeDasharray="4 4" />
            <Line
              dataKey="value" stroke="rgba(200,215,255,0.55)" strokeWidth={2} connectNulls isAnimationActive={false}
              dot={(p: any) => {
                const r: Row = p.payload;
                if (r.value == null) return <g key={p.key} />;
                const c = STATUS_COLOR[r.status];
                return (
                  <g key={p.key}>
                    {r.user && <circle cx={p.cx} cy={p.cy} r={8} fill="none" stroke="#5ee7ff" strokeWidth={1.5} />}
                    <circle cx={p.cx} cy={p.cy} r={r.fd === viewDay ? 5.5 : 4} fill={r.exercise ? '#050816' : c} stroke={c} strokeWidth={2} />
                  </g>
                );
              }}
              activeDot={false}
            />
            <Tooltip
              contentStyle={{ background: '#101834', border: '1px solid rgba(120,160,255,0.25)', borderRadius: 10, fontSize: 14 }}
              labelFormatter={(v) => `Flight day ${v}`}
              formatter={(v: any, name: string) => name === 'band'
                ? [Array.isArray(v) ? `${v[0].toFixed(metric.digits)}–${v[1].toFixed(metric.digits)}` : '—', 'Personal range']
                : [v == null ? '—' : Number(v).toFixed(metric.digits) + ' ' + metric.unit, metric.label]}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div className="faint" style={{ fontSize: 13, display: 'flex', gap: 10, alignItems: 'center' }}>
        <span style={{ flex: 1 }}>{rule.id.startsWith('INFO') ? 'Info only: no threshold in team files' : `Orange: ${rule.orange} · Red: ${rule.red}`}</span>
        <button className="link" onClick={() => onHowTo(metric.explanationId)}>How to measure</button>
      </div>
    </div>
  );
}
