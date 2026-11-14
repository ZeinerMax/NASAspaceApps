# Astronaut Health Monitor

NASA Space Apps Challenge 2026: "Create Health Monitoring Software for Astronauts on Space Missions".

This is a dashboard for 4 crew members. The landing page shows one crew member at a time with a compact (simulated) ship strip. The detail view has an anatomy image with highlighted organs (orange = warning, red = act now), trends, problems and solutions. The Rules page is in the header. A daily check-in adds new data, and the mascot Dr. Biscuit guides the user (and can be hidden).

> **Prototype for decision support only.** Not a diagnostic or predictive tool and not a replacement for flight surgeon judgement.

## Run it

You need Node.js 18 or newer (nodejs.org).

```bash
cd app
npm install        # first time only
npm run dev        # then open http://localhost:5173
```

Stop it with **Ctrl + C**. That's all you need to use the app.

### Optional (for developers)

```bash
npm test           # checks the warning rules still work (run after changing a threshold)
npm run build      # makes a finished copy of the website in app/dist (no Node needed to host it)
npm run preview    # opens that finished copy to check it
```

`npm run dev`, `test` and `build` first run `npm run seed`. That step reads the team files in the repo root and writes `src/data/generated/seed.json`, then copies the mascot images to `public/mascot/`. Both outputs are git-ignored.

**Deep links** for presenting: `http://localhost:5173/#/F02/details`, `#/F02/trends`, `#/M01/problems` and `#/rules`. `#/` is the landing page.

## How the data flows

```
repo root (READ ONLY)                         app
─────────────────────                         ───
*.json  ──► scripts/build-seed.mjs ──► src/data/generated/seed.json ─┐
            (fixes in memory, see seed-report.json)                  ├─► store (Zustand) ─► engine ─► UI
NASA mascot/* ──► scripts/copy-assets.mjs ──► public/mascot/         │
radiation.json (optional, add later) ──────────────────────────────►┘
new daily check-ins ──► localStorage 'astroHealth.v1' ──────────────►┘   (Data menu: Export / Import / Reset)
```

* **The original repo files are never modified.** Known problems are fixed in memory only and logged in `src/data/generated/seed-report.json`: the truncated `oxygen_saturation.json`, the stray `same_id` key and the `eva_spac_walk` typo.
* `eye_test.json` is intentionally not loaded (team decision: eye category removed).
* New check-ins live in the browser only. Use **Data → Export** before switching computers.

## Where things are

| Folder / file | What it is | Owner idea |
|---|---|---|
| `src/data/rules.ts` | Every rule as readable text and its Excel cell reference | engine |
| `src/engine/evaluate.ts` | Crew rules logic (one function per rule) | engine |
| `src/engine/ship.ts` | Ship rules logic | engine |
| `src/engine/baseline.ts` | Rolling personal baseline (mean ± 2 SD, 20 days, from FD7) | engine |
| `src/engine/aggregate.ts` | Rule results → region / overall / hazard colour | engine |
| `src/engine/__tests__/` | Tests against the seed data | engine |
| `src/data/crew.ts` | Crew list, ages, plans, rest-day rule (one rest day at a time) | data |
| `src/data/symptoms.ts`, `regions.ts`, `hazards.ts`, `problems.ts` | Content (translated from the team's Czech files) | content |
| `src/data/explanations.ts` | "How to measure" texts (**drafts, need verification**) | content |
| `src/data/mascot.ts` | Which mascot image and line to show | design |
| `src/components/body/` | `AnatomyBody` (image + overlays), `bodyConfig.ts` (**all overlay positions**), `silhouette.ts`, region panel, hazards | body |
| `src/components/checkin/` | Daily check-in wizard, how-to modal | UI |
| `src/components/trends/` | Charts (`metrics.ts` defines every chart) | UI |
| `src/components/landing/`, `crew/`, `rules/`, `problems/`, `ship/`, `alerts/` | Screens (landing page, detail view, Rules page, ship strip) | UI |
| `src/sim/shipFeed.ts` | **Simulated** cabin air feed (always inside green) | UI |
| `src/styles/theme.css` | Colours, fonts, spacing | design |

The full design is in `../PLAN.md` and all source values and translations are in `../INVENTORY.md`.

## Common tasks

**Change a threshold.** Edit the logic in `src/engine/evaluate.ts` (or `ship.ts`) and the readable text in `src/data/rules.ts`, update the chart zones in `src/components/trends/metrics.ts`, then run `npm test`.

**Add radiation data.** Put a `radiation.json` file in the repo root, with one record per flight day, measured ship-wide:
```json
[{ "day": "F01", "environment": "Spacecraft", "dose_rate_msv_day": 0.3, "mission_dose_msv": 0.3, "spe_dose_msv": 0 }]
```
Restart `npm run dev` and the radiation tiles fill in.

**Add a mascot image** (e.g. a "worried" emotion for orange):
1. Put the file in `NASA mascot/`.
2. Add a line to the `map` in `scripts/copy-assets.mjs`.
3. Add a line to `MASCOT_IMAGES` in `src/data/mascot.ts`.
4. Use it in `mascotForStatus` (for example change the `orange` case).

**Adjust the body overlays.** Everything that depends on positions in the anatomy images is in `src/components/body/bodyConfig.ts`: the organ shapes (brain, heart, lung, liver/stomach, intestines), the arm and leg areas, the clickable areas and a gap fix for the female image. Open the app with `?debug` (e.g. `http://localhost:5173/?debug#/F02/details`) to see all shapes outlined. The images (`male_body_anatomy.jpg`, `femal_body_anatomy.jpg` in the repo root) are used as they are, including the text printed inside them. Arms, legs and the whole-body outline follow the real body outline, which the app calculates from the image in the browser.

## Licences and credits

* Anatomy images: team files in the repo root (used unchanged).
* Mascot "Dr. Biscuit": team artwork (`NASA mascot/`).
* Libraries: React, Recharts, Zustand, framer-motion (all MIT).
* Fonts: Space Grotesk and JetBrains Mono (Google Fonts, SIL Open Font License). They are loaded online; without internet the browser falls back to system fonts.

## What is real, simulated or a placeholder

* **Crew data:** the team's JSON files (synthetic mission data).
* **Thresholds:** the team's Excel table, with the cell shown in the Rules tab. Rules marked *Team decision* or *Placeholder* are labelled in the UI.
* **Cabin air:** SIMULATED, labelled on screen.
* **"How to measure" steps:** drafts, tagged "Needs verification".
* Anything added that is not from the team files is marked *"placeholder, verify against NASA Human Research Program or other space agency sources"*.
