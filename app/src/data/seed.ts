// Typed access to the generated seed (built by scripts/build-seed.mjs from the repo JSON files).
import seedJson from './generated/seed.json';
import type { DailyEntry, RadiationDay } from '../types';

export const SEED_ENTRIES = seedJson.entries as DailyEntry[];
export const SEED_RADIATION = (seedJson.radiation ?? []) as RadiationDay[];
