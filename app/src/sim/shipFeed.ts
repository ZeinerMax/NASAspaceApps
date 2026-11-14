// SIMULATED ship sensors (PLAN.md §5.2). A small, clamped random walk that always stays inside green.
// Start values are figures quoted in the Excel notes (PIO₂ "about 150", "at 101 kPa", 21 % O₂ → 79 % diluent).
// Radiation is NOT simulated: it comes from the team's radiation.json once added.
import type { ShipReading } from '../types';

interface Channel { start: number; min: number; max: number; step: number }

const CH = {
  co2mmHg: { start: 2.0, min: 1.6, max: 2.4, step: 0.05 },
  cabinTempC: { start: 22.5, min: 21.5, max: 23.5, step: 0.1 },
  rhPct: { start: 45, min: 40, max: 50, step: 0.6 },
  pio2mmHg: { start: 150, min: 147, max: 153, step: 0.4 },
  pressureKPa: { start: 101, min: 100.6, max: 101.4, step: 0.05 },
  diluentPct: { start: 79, min: 78.5, max: 79.5, step: 0.05 },
} satisfies Record<string, Channel>;

const walk = (v: number, c: Channel) => Math.min(c.max, Math.max(c.min, v + (Math.random() * 2 - 1) * c.step));

/** 7 simulated daily CO₂ averages, so the 7-day average exists from the start. */
const co2Days: number[] = Array.from({ length: 7 }, () => 1.8 + Math.random() * 0.4);

export function initialReading(): ShipReading {
  return {
    t: Date.now(),
    co2mmHg: CH.co2mmHg.start,
    co2Avg7d: co2Days.reduce((a, b) => a + b, 0) / co2Days.length,
    cabinTempC: CH.cabinTempC.start,
    rhPct: CH.rhPct.start,
    pio2mmHg: CH.pio2mmHg.start,
    pressureKPa: CH.pressureKPa.start,
    diluentPct: CH.diluentPct.start,
    simulated: true,
  };
}

export function nextReading(p: ShipReading): ShipReading {
  const co2 = walk(p.co2mmHg, CH.co2mmHg);
  return {
    t: Date.now(),
    co2mmHg: co2,
    // today's running value counts as the 7th day
    co2Avg7d: (co2Days.slice(1).reduce((a, b) => a + b, 0) + co2) / 7,
    cabinTempC: walk(p.cabinTempC, CH.cabinTempC),
    rhPct: walk(p.rhPct, CH.rhPct),
    pio2mmHg: walk(p.pio2mmHg, CH.pio2mmHg),
    pressureKPa: walk(p.pressureKPa, CH.pressureKPa),
    diluentPct: walk(p.diluentPct, CH.diluentPct),
    simulated: true,
  };
}

export const SHIP_TICK_MS = 2000;
export const SHIP_HISTORY_LENGTH = 60;
