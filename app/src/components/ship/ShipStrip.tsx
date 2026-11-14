// Compact ship tiles (CO₂, cabin air, radiation). Cabin values are SIMULATED; radiation comes from radiation.json.
import { motion } from 'framer-motion';
import type { RuleResult } from '../../types';
import { ruleById } from '../../data/rules';
import { SimTag, STATUS_COLOR } from '../common';

const SHORT: Record<string, string> = {
  'SH-CO2': 'CO₂', 'SH-CABIN-T': 'Cabin temp', 'SH-RH': 'Humidity', 'SH-PIO2': 'PIO₂', 'SH-PRESSURE': 'Pressure',
  'SH-DILUENT': 'Diluent gas', 'SH-RAD-CAREER': 'Mission dose', 'SH-RAD-SPE': 'Solar event', 'SH-RAD-RATE': 'Dose rate',
};

export default function ShipStrip({ results, highlight = [], onOpen }: { results: RuleResult[]; highlight?: string[]; onOpen?: () => void }) {
  const cabin = results.filter((r) => !r.ruleId.startsWith('SH-RAD'));
  const rad = results.filter((r) => r.ruleId.startsWith('SH-RAD'));
  const tile = (r: RuleResult) => {
    const hl = highlight.includes(r.ruleId);
    return (
      <motion.button
        key={r.ruleId}
        onClick={onOpen}
        title={`${ruleById(r.ruleId).label}: ${r.reason}`}
        className={`panel s-${r.status}`}
        animate={hl ? { boxShadow: ['0 0 0 0 rgba(255,154,60,0)', '0 0 0 6px rgba(255,154,60,0.45)', '0 0 0 0 rgba(255,154,60,0)'] } : {}}
        transition={hl ? { duration: 1.4, repeat: Infinity } : {}}
        style={{ padding: '10px 14px', minWidth: 132, textAlign: 'left', borderColor: `color-mix(in srgb, ${STATUS_COLOR[r.status]} 40%, transparent)`, cursor: onOpen ? 'pointer' : 'default' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }} className="dim">
          <span className="dot" /> {SHORT[r.ruleId]}
        </div>
        <div className="mono" style={{ fontSize: 18, marginTop: 2 }}>{r.valueLabel.split(' · ')[0]}</div>
      </motion.button>
    );
  };
  return (
    <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', alignItems: 'stretch' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}><span className="section-title">Ship · cabin air</span><SimTag /></div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{cabin.map(tile)}</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}><span className="section-title">Ship · radiation</span><span className="faint" style={{ fontSize: 13 }}>ship-wide, from radiation.json</span></div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{rad.map(tile)}</div>
      </div>
    </div>
  );
}
