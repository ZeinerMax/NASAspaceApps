// Compact ship strip (landing page): CO₂, cabin air and radiation in ONE row. Cabin values are SIMULATED;
// radiation comes from radiation.json (ship-wide) and shows "—" until the team adds it.
import { motion } from 'framer-motion';
import type { RuleResult } from '../../types';
import { ruleById } from '../../data/rules';
import { SimTag, STATUS_COLOR } from '../common';

const SHORT: Record<string, string> = {
  'SH-CO2': 'CO₂', 'SH-CABIN-T': 'Temp', 'SH-RH': 'Humidity', 'SH-PIO2': 'O₂', 'SH-PRESSURE': 'Pressure',
  'SH-DILUENT': 'Diluent', 'SH-RAD-CAREER': 'Radiation', 'SH-RAD-SPE': 'Solar event', 'SH-RAD-RATE': 'Dose rate',
};

export default function ShipStrip({ results, highlight = [], onOpen }: { results: RuleResult[]; highlight?: string[]; onOpen?: () => void }) {
  return (
    <button className="ship-strip" onClick={onOpen} aria-label="Open ship details">
      <span className="ship-title"><span className="section-title">Ship</span><SimTag /></span>
      {results.map((r) => {
        const hl = highlight.includes(r.ruleId);
        const noData = r.status === 'grey';
        return (
          <motion.span
            key={r.ruleId}
            className="ship-tile"
            title={`${ruleById(r.ruleId).label}: ${r.reason}`}
            animate={hl ? { boxShadow: ['0 0 0 0 rgba(255,154,60,0)', '0 0 0 5px rgba(255,154,60,0.45)', '0 0 0 0 rgba(255,154,60,0)'] } : {}}
            transition={hl ? { duration: 1.4, repeat: Infinity } : {}}
            style={{ borderColor: `color-mix(in srgb, ${STATUS_COLOR[r.status]} 45%, transparent)` }}
          >
            <span className="ship-label"><span className="dot" style={{ background: STATUS_COLOR[r.status] }} />{SHORT[r.ruleId]}</span>
            <span className="mono ship-value">{noData ? '—' : r.valueLabel.split(' · ')[0]}</span>
          </motion.span>
        );
      })}
    </button>
  );
}
