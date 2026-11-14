// Ship tab: live (SIMULATED) cabin air with trend, radiation (ship-wide, from radiation.json), responses.
import { Line, LineChart, ResponsiveContainer, YAxis } from 'recharts';
import type { RuleResult, ShipReading } from '../../types';
import { useAppStore } from '../../store/useAppStore';
import { ruleById } from '../../data/rules';
import { PROBLEMS } from '../../data/problems';
import { SEED_RADIATION } from '../../data/seed';
import { SimTag, StatusChip, STATUS_COLOR } from '../common';
import ActionBox from '../alerts/ActionBox';

const SERIES: Partial<Record<string, keyof ShipReading>> = {
  'SH-CO2': 'co2mmHg', 'SH-CABIN-T': 'cabinTempC', 'SH-RH': 'rhPct', 'SH-PIO2': 'pio2mmHg', 'SH-PRESSURE': 'pressureKPa', 'SH-DILUENT': 'diluentPct',
};

export default function ShipTab({ ship }: { ship: RuleResult[] }) {
  const history = useAppStore((s) => s.shipHistory);
  const airProblem = PROBLEMS.find((p) => p.id === 'cabin-air')!;
  const radProblem = PROBLEMS.find((p) => p.id === 'radiation')!;

  const card = (r: RuleResult) => {
    const rule = ruleById(r.ruleId);
    const key = SERIES[r.ruleId];
    return (
      <div key={r.ruleId} className="panel" style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 6, borderColor: `color-mix(in srgb, ${STATUS_COLOR[r.status]} 40%, transparent)` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <strong style={{ flex: 1 }}>{rule.label}</strong>
          <StatusChip status={r.status} />
        </div>
        <div className="mono" style={{ fontSize: 26, color: STATUS_COLOR[r.status] }}>{r.valueLabel.split(' · ')[0]}</div>
        {r.valueLabel.includes(' · ') && <div className="mono dim" style={{ fontSize: 14 }}>{r.valueLabel.split(' · ')[1]}</div>}
        {key && history.length > 1 && (
          <div style={{ height: 50 }}>
            <ResponsiveContainer>
              <LineChart data={history}>
                <YAxis hide domain={['dataMin - 0.5', 'dataMax + 0.5']} />
                <Line dataKey={key} stroke={STATUS_COLOR[r.status]} dot={false} strokeWidth={2} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
        <div className="dim" style={{ fontSize: 14 }}>{r.reason}</div>
        <div className="faint" style={{ fontSize: 13 }}>Green {rule.green} · Orange {rule.orange} · Red {rule.red}</div>
        <ActionBox result={r} compact />
      </div>
    );
  };

  const cabin = ship.filter((r) => !r.ruleId.startsWith('SH-RAD'));
  const rad = ship.filter((r) => r.ruleId.startsWith('SH-RAD'));
  const cabinBad = cabin.some((r) => r.status === 'orange' || r.status === 'red');
  const radBad = rad.some((r) => r.status === 'orange' || r.status === 'red');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: 140 }}>
      <section style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <h3>Cabin air</h3><SimTag />
          <span className="dim" style={{ fontSize: 15 }}>Simulated live feed, updates every 2 s. Measured by the ship, the same for all crew.</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>{cabin.map(card)}</div>
        {cabinBad && <p><strong style={{ color: 'var(--accent)' }}>Response: </strong>{airProblem.response}</p>}
      </section>
      <section style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <h3>Radiation</h3>
          <span className="dim" style={{ fontSize: 15 }}>
            Ship-wide dosimetry. {SEED_RADIATION.length ? `${SEED_RADIATION.length} days loaded from radiation.json.` : 'No data yet: add radiation.json to the repo root (format in PLAN.md §5.2).'}
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>{rad.map(card)}</div>
        {radBad && <p><strong style={{ color: 'var(--accent)' }}>Response: </strong>{radProblem.response}</p>}
        <p className="dim" style={{ fontSize: 15 }}><strong>Prevention: </strong>{radProblem.prevention}</p>
      </section>
    </div>
  );
}
