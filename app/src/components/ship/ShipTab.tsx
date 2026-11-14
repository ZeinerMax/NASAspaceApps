// Ship details (opened from the landing page): live SIMULATED cabin air with a mini trend, and radiation (ship-wide).
// Short cards; the response / prevention text appears only when something is not green, or on demand.
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
    const bad = r.status === 'orange' || r.status === 'red';
    return (
      <div key={r.ruleId} className="panel" style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 4, borderColor: `color-mix(in srgb, ${STATUS_COLOR[r.status]} 40%, transparent)` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <strong style={{ flex: 1, fontSize: 16 }}>{rule.label}</strong>
          <StatusChip status={r.status} />
        </div>
        <div className="mono" style={{ fontSize: 24, color: STATUS_COLOR[r.status] }}>{r.status === 'grey' ? '—' : r.valueLabel.split(' · ')[0]}</div>
        {key && history.length > 1 && (
          <div style={{ height: 40 }}>
            <ResponsiveContainer>
              <LineChart data={history}>
                <YAxis hide domain={['dataMin - 0.5', 'dataMax + 0.5']} />
                <Line dataKey={key} stroke={STATUS_COLOR[r.status]} dot={false} strokeWidth={2} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
        {bad && <><div className="dim" style={{ fontSize: 15 }}>{r.reason}</div><ActionBox result={r} compact /></>}
      </div>
    );
  };

  const cabin = ship.filter((r) => !r.ruleId.startsWith('SH-RAD'));
  const rad = ship.filter((r) => r.ruleId.startsWith('SH-RAD'));
  const cabinBad = cabin.some((r) => r.status === 'orange' || r.status === 'red');
  const radBad = rad.some((r) => r.status === 'orange' || r.status === 'red');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <section style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><h3>Cabin air</h3><SimTag /></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>{cabin.map(card)}</div>
        {cabinBad && <p><strong style={{ color: 'var(--accent)' }}>Solution: </strong>{airProblem.response}</p>}
      </section>
      <section style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <h3>Radiation</h3>
          {!SEED_RADIATION.length && <span className="dim" style={{ fontSize: 15 }}>No data yet (radiation.json)</span>}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>{rad.map(card)}</div>
        {radBad && <p><strong style={{ color: 'var(--accent)' }}>Solution: </strong>{radProblem.response}</p>}
        <details className="more"><summary>Radiation prevention</summary><p className="dim" style={{ fontSize: 15 }}>{radProblem.prevention}</p></details>
      </section>
    </div>
  );
}
