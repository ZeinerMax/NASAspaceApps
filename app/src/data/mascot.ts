// Dr. Biscuit: which image and line to show (PLAN.md §8). Images are copied to public/mascot by scripts/copy-assets.mjs.
// To add a new image (e.g. a "worried" one): add it to copy-assets.mjs and to MASCOT_IMAGES below, then use it here.
import type { Status } from '../types';

export const MASCOT_IMAGES = {
  default: 'mascot/default.png',
  good: 'mascot/good.jpg',
  alarm: 'mascot/alarm.jpg',
  sick: 'mascot/sick.jpg',
  sleep: 'mascot/sleep.jpg',
  workout: 'mascot/workout.jpg',
  drink: 'mascot/drink.jpg',
  measure: 'mascot/measure.jpg',
} as const;

export type MascotImage = keyof typeof MASCOT_IMAGES;

export interface MascotMood {
  image: MascotImage;
  line: string;
}

export function mascotForStatus(status: Status, opts: { name?: string; sick?: boolean } = {}): MascotMood {
  const who = opts.name ? `${opts.name}: ` : '';
  switch (status) {
    case 'green':
      return { image: 'good', line: `${who}All systems green. Great work!` };
    case 'orange':
      return { image: 'alarm', line: `${who}Something needs a closer look. Tap the orange area to see why.` };
    case 'red':
      return opts.sick
        ? { image: 'sick', line: `${who}You're not well. Follow the medical protocol and contact the flight surgeon now.` }
        : { image: 'alarm', line: `${who}Red alert! Contact the flight surgeon / mission control now.` };
    case 'grey':
      return { image: 'default', line: `${who}Some values are missing. Please re-measure them at the next check-in.` };
    default:
      return { image: 'default', line: "Hi, I'm Dr. Biscuit. Pick a crew member or start today's check-in." };
  }
}
