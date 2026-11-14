// Ship rules engine (PLAN.md §5.2). Thresholds from Excel sheet "Cabin & radiation".
import type { RadiationDay, RuleResult, ShipReading, Status } from '../types';
import { stateOf } from './evaluate';
import { fmt } from './units';

const r = (ruleId: string, status: Status, value: number | null, valueLabel: string, reason: string): RuleResult => ({
  ruleId, status, value, valueLabel, reason, ruleState: stateOf(status), flags: [],
});

/** Prototype placeholder from the Excel file (mission emergency limit). */
export const CO2_EMERGENCY_MMHG = 4.0;
/** Team decision 7: nominal band, ship-regulated. */
export const PRESSURE_NOMINAL_KPA: [number, number] = [100, 102];

export function evaluateShip(s: ShipReading | null, rad: RadiationDay | null): RuleResult[] {
  const out: RuleResult[] = [];
  if (s) {
    const co2 = `${fmt(s.co2mmHg, 2, 'mmHg')} · 7-day ${fmt(s.co2Avg7d, 2)}`;
    if (s.co2mmHg >= CO2_EMERGENCY_MMHG) out.push(r('SH-CO2', 'red', s.co2mmHg, co2, `At or above the emergency limit (${CO2_EMERGENCY_MMHG} mmHg, placeholder).`));
    else if (s.co2mmHg > 3.0 || s.co2Avg7d > 2.5) out.push(r('SH-CO2', 'orange', s.co2mmHg, co2, s.co2mmHg > 3.0 ? 'Above the 3.0 mmHg 1-hour requirement.' : '7-day average above 2.5 mmHg (headache risk).'));
    else out.push(r('SH-CO2', 'green', s.co2mmHg, co2, '1-hour average ≤3.0 and 7-day average ≤2.5 mmHg.'));

    const t = s.cabinTempC;
    out.push(t < 18 || t > 27 ? r('SH-CABIN-T', 'red', t, fmt(t, 1, '°C'), 'Outside 18–27 °C.')
      : t < 20 || t > 25 ? r('SH-CABIN-T', 'orange', t, fmt(t, 1, '°C'), 'Outside the 20–25 °C comfort zone.')
      : r('SH-CABIN-T', 'green', t, fmt(t, 1, '°C'), 'Within 20–25 °C.'));

    const h = s.rhPct;
    out.push(h < 25 || h > 75 ? r('SH-RH', 'red', h, fmt(h, 0, '%'), 'Outside 25–75 %.')
      : h < 30 || h > 60 ? r('SH-RH', 'orange', h, fmt(h, 0, '%'), 'Outside 30–60 %.')
      : r('SH-RH', 'green', h, fmt(h, 0, '%'), 'Within 30–60 %.'));

    const p = s.pio2mmHg;
    out.push(p < 127 || p > 333 ? r('SH-PIO2', 'red', p, fmt(p, 0, 'mmHg'), 'Outside 127–333 mmHg.')
      : p < 145 || p > 155 ? r('SH-PIO2', 'orange', p, fmt(p, 0, 'mmHg'), 'Outside the 145–155 mmHg target.')
      : r('SH-PIO2', 'green', p, fmt(p, 0, 'mmHg'), 'Within 145–155 mmHg.'));

    const k = s.pressureKPa;
    const [lo, hi] = PRESSURE_NOMINAL_KPA;
    out.push(k <= 34.5 || k > 103 ? r('SH-PRESSURE', 'red', k, fmt(k, 1, 'kPa'), 'Outside the 34.5–103 kPa tolerance.')
      : k < lo || k > hi ? r('SH-PRESSURE', 'orange', k, fmt(k, 1, 'kPa'), 'Outside the nominal band.')
      : r('SH-PRESSURE', 'green', k, fmt(k, 1, 'kPa'), 'Within the nominal band.'));

    const d = s.diluentPct;
    out.push(d < 30 ? r('SH-DILUENT', 'red', d, fmt(d, 0, '%'), 'Below 30 %.') : r('SH-DILUENT', 'green', d, fmt(d, 0, '%'), 'At least 30 %.'));
  }

  // Radiation: ship-wide data added by the team later (radiation.json). Until then: grey "No data yet".
  const none = (id: string) => r(id, 'grey', null, 'No data yet', 'Radiation data has not been added yet (radiation.json).');
  if (!rad) {
    out.push(none('SH-RAD-CAREER'), none('SH-RAD-SPE'), none('SH-RAD-RATE'));
    return out;
  }
  const m = rad.missionDoseMSv;
  out.push(m == null ? none('SH-RAD-CAREER')
    : m >= 600 ? r('SH-RAD-CAREER', 'red', m, fmt(m, 1, 'mSv'), 'At or above the 600 mSv NASA career limit.')
    : m >= 480 ? r('SH-RAD-CAREER', 'orange', m, fmt(m, 1, 'mSv'), 'Above 80 % (480 mSv) of the career limit.')
    : r('SH-RAD-CAREER', 'green', m, fmt(m, 1, 'mSv'), 'Below 480 mSv (prior career dose unknown).'));
  const e = rad.speDoseMSv;
  out.push(e == null ? none('SH-RAD-SPE')
    : e >= 250 ? r('SH-RAD-SPE', 'red', e, fmt(e, 1, 'mSv'), 'At or above the 250 mSv per-event limit.')
    : e >= 125 ? r('SH-RAD-SPE', 'orange', e, fmt(e, 1, 'mSv'), 'Above 125 mSv (50 % of the event limit).')
    : r('SH-RAD-SPE', 'green', e, fmt(e, 1, 'mSv'), e > 0 ? 'Solar particle event below 125 mSv.' : 'No solar particle event.'));
  const rate = rad.doseRateMSvDay;
  out.push(rate == null ? none('SH-RAD-RATE') : r('SH-RAD-RATE', 'info', rate, fmt(rate, 2, 'mSv/day'), 'No numeric bands in the files (mission-defined).'));
  return out;
}
