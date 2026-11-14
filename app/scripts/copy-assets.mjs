// Copies the mascot images from "NASA mascot/" to public/mascot/ with clean names.
// The originals are never changed. Add new images here (and in src/data/mascot.ts).
import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const srcDir = join(here, '..', '..', 'NASA mascot');
const outDir = join(here, '..', 'public', 'mascot');
mkdirSync(outDir, { recursive: true });

const map = {
  'Dr._Biscuit.png': 'default.png',
  'buscuit_good.jpg': 'good.jpg',
  'Buscuit_scared.jpg': 'alarm.jpg', // Buscuit_schocked.jpg is byte-identical
  'Buscuit_sick.jpg': 'sick.jpg',
  'Buscuit_sleep.jpg': 'sleep.jpg',
  'Buscuit_workout.jpg': 'workout.jpg',
  'Buscuit_drink.jpg': 'drink.jpg',
  'Buscuit_measure_heart.jpg': 'measure.jpg',
};

// Body images (repo root, read only) → public/body. Used as is; overlays are drawn on top in the app.
const bodyOut = join(here, '..', 'public', 'body');
mkdirSync(bodyOut, { recursive: true });
const bodyMap = { 'male_body_anatomy.jpg': 'male.jpg', 'femal_body_anatomy.jpg': 'female.jpg' };
for (const [from, to] of Object.entries(bodyMap)) {
  const src = join(here, '..', '..', from);
  if (!existsSync(src)) console.warn(`body image missing in repo root: ${from}`);
  else copyFileSync(src, join(bodyOut, to));
}

let n = 0;
for (const [from, to] of Object.entries(map)) {
  const src = join(srcDir, from);
  if (!existsSync(src)) {
    console.warn(`mascot: missing ${from}`);
    continue;
  }
  copyFileSync(src, join(outDir, to));
  n++;
}
console.log(`mascot: ${n} images copied`);
