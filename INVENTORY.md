# INVENTORY: NASA Space Apps 2026, Astronaut Health Monitoring

This inventory covers every source file in the repo (commit `a13a0be`, read on 14 Nov 2026). The original files are unchanged. Excel was read with `openpyxl`, the `.odt` by parsing its `content.xml`, JSON with Python's `json` module, and images visually.

Legend: **[CZ]** = Czech content, translated in section 4.

---

## 1. File list

| # | File | Language | What it holds |
|---|------|----------|---------------|
| 1 | `Hackathon important files problems adn structure.odt` | **[CZ]** first half, English second half | **Team structure document.** (a) Health problems per body system **[CZ]**; (b) "when X happens, do Y" response list **[CZ]**; (c) the team's 6-part app structure in English: check-ins, rules tab, body map, trends, action, explanations. |
| 2 | `Crew Health & Cabin Monitoring Thresholds (Space-Adjusted).xlsx` | English | **Main threshold source.** 7 sheets: `Crew health` (13 indicators with green/orange/red), `Cabin & radiation` (9 indicators), `Rules` (10 definitions), `Changes vs v1`, `Open items`, `Sources`, `Dropdown options`. |
| 3 | `Crew Health & Cabin Monitoring Thresholds (Space-Adjusted) (1).xlsx` | English | **Byte-identical duplicate** of #2 (`cmp` reports no difference). Ignore it. |
| 4 | `prevence 5 problémů.txt` | **[CZ]** | Prevention for the 5 main space hazards (radiation, isolation, distance from Earth, altered gravity, hostile closed environment), plus a table of what each self-assessment indicator reveals. |
| 5 | `AI measure.txt` | English | A *prompt specification* for an AI "Instructions" button: 11 measurement categories, the equipment named for each, the required display structure (7 headings), style and medical-safety rules. **It contains no step-by-step instructions itself.** |
| 6 | `training.txt` | English (DeepL translation) | ARED/T2 training-load formula (body-weight multipliers, sex and age factors), a rule to **reduce load 10 % and shorten the run to 30 min after poor sleep or high fatigue**, 3 example astronauts and a sample workout screen. |
| 7–18 | 12 × `*.json` seed data | English | Daily records for 4 crew members × 20 flight days. Details in section 3. |
| 19–27 | `NASA mascot/*` (9 images) | n/a | Mascot "Dr. Biscuit" (orange tabby cat in a lab coat). Details in section 6. |

No other files exist. The Excel `Changes vs v1` sheet mentions a "Czech PDF" (version 1), which is **not** in the repo. It is superseded by the Excel file.

---

## 2. Thresholds (from the Excel file)

Cell references use the form `Sheet!Row`. "Basis" is the Excel classification: Agency standard / Published research / Clinical reference / Proposed.

### 2.1 Crew health (`Crew health` sheet)

| Row | Indicator [unit] | GREEN | ORANGE | RED | Basis |
|---|---|---|---|---|---|
| 3 | Sleep [h/night] | 7–9 | 6 to <7, or >9 | <6 on ≥3 of the last 7 nights | Proposed |
| 4 | Mood [1–10, 1 = worst] | 7 to 10 | 4 to <7 | <4 | Proposed |
| 5 | Symptoms | None | New mild symptoms (e.g. mild headache, mild nausea, eye strain) | Any serious symptom: loss of consciousness, chest pain, marked breathlessness, sudden vision loss. **Overrides every number.** | Proposed |
| 6 | Food [% of planned energy] | ≥90 % | 75 to <90 % | <75 % on ≥3 of the last 7 days | Proposed |
| 7 | Water [L/day] | ≥2.5 | 2.0 to <2.5 | <2.0 | Proposed |
| 8 | Training [% of planned session] | ≥90 % | 50 to <90 % | <50 % on ≥3 of the last 7 planned sessions | Proposed |
| 9 | Systolic BP [mmHg] | Inside personal range AND 90 to <140 | Outside personal range, or 140–180, or <90 with no symptoms | >180, or <90 with dizziness or collapse | Clinical reference |
| 10 | Diastolic BP [mmHg] | Inside personal range AND 60 to <90 | Outside personal range, or 90–120, or <60 with no symptoms | >120, or <60 with dizziness or collapse | Clinical reference |
| 11 | Resting pulse [/min] | Inside personal range (60–100 if no baseline yet) | Outside personal range | >120 or <40 at rest, or any deviation with serious symptoms | Proposed |
| 12 | Body temperature at rest [°C] | Ground 36.0–37.5 / **In flight 36.0–38.0** | Ground 35 to <36 or >37.5 to <40 / In flight 35 to <36 or >38.0 to <40 | <35 or ≥40 | Published research |
| 13 | Fasting glucose [**mmol/l**] | 3.9–5.5 | 3.0 to <3.9 (**treat now**), or >5.5 to <16.7 | <3.0, or ≥16.7 on 2 consecutive readings | Clinical reference |
| 14 | Body mass loss vs baseline [%] | <2 % | 2 % to 5 % (inclusive) | >5 % | Proposed |
| 15 | Vision vs baseline | No change (same chart, distance, correction) | 1-line decline in near or distance acuity, or hyperopic shift ≥+0.50 D, or new blur | ≥2-line decline, any sudden vision loss, or clinician-confirmed optic disc swelling | Published research |

Important column-E notes, all used in the app:
- **Sleep:** ISS crews average about 6 h, so orange and red will be common. "That is a real signal, not a bug."
- **Symptoms:** a new headache should trigger a CO₂ check, since NASA links headaches to CO₂ at about 2.8–4.5 mmHg. Blurred near vision relates to SANS.
- **Food:** plan = the individual's mission target. NASA's planning average is 3,035 kcal/day.
- **Water:** 2.5 L/day is the NASA minimum supply.
- **Training:** approved rest is not a missed session. ISS crews train about 600 min/week.
- **BP and pulse:** build the personal range from supine, rested readings.
- **Temperature:** core temperature rises about 1 °C over ~2.5 months. Use resting readings only and keep the same sensor type.
- **Glucose:** fasting means ≥8 h without food. No space-specific threshold was found.
- **Mass:** take the baseline about flight day 7, because of the early fluid loss (3–4 %). Also track cumulative loss.
- **Vision:** SANS causes hyperopic shifts of +0.50 to +1.75 D, and about 60 % of long-duration crew report degraded vision.

### 2.2 Cabin and radiation (`Cabin & radiation` sheet)

Title: "red = environment check, not automatically a threat to life".

| Row | Indicator [unit] | GREEN | ORANGE | RED | Basis |
|---|---|---|---|---|---|
| 3 | CO₂, 1-h average pp [mmHg] | ≤3.0 AND 7-day avg ≤2.5 | >3.0 and below mission emergency limit, OR 7-day avg >2.5 | ≥ mission emergency limit. **Prototype placeholder: 4.0** | Agency standard |
| 4 | Cabin temperature [°C] | 20–25 | 18 to <20, or >25 to 27 | <18 or >27 | Agency standard |
| 5 | Relative humidity [%] | 30–60 | 25 to <30, or >60 to 75 | <25 or >75 | Proposed |
| 6 | Inspired O₂ partial pressure PIO₂ [mmHg] | 145–155 | 127 to <145, or >155 to 333 | <127 or >333 | Agency standard |
| 7 | Total cabin pressure [kPa] | **Within mission-defined nominal band (no number)** | Outside nominal band but inside 34.5–103 | ≤34.5 or >103 | Agency standard |
| 8 | Diluent gas fraction [%] | ≥30 | None defined | <30 | Agency standard |
| 9 | Radiation, career effective dose [mSv] | 0 to <480 | 480 to <600 | ≥600 | Agency standard |
| 10 | Radiation, solar particle event dose [mSv/event] | <125 | 125 to <250 | ≥250 | Agency standard |
| 11 | Radiation dose rate [mSv/day] | Within mission-planned rate | Above planned rate | Mission-defined alarm | Proposed: **no numbers** |

Reference figures from the notes: ISS dose rate is typically 0.2–0.5 mSv/day, and beyond low Earth orbit it is about 2–3× higher. 3.0 mmHg CO₂ ≈ 3,950 ppm, 2.5 ≈ 3,290 ppm and 4.0 ≈ 5,260 ppm.

### 2.3 Rules and definitions (`Rules` sheet, version 2, 14 Nov 2026)

| Rule | Definition (verbatim summary) |
|---|---|
| What colours mean | Colours mark the **priority of a check, not a diagnosis**. This is a prototype working table, not a validated NASA alarm protocol. |
| Basis column | Agency standard / Published research / Clinical reference / Proposed (as above). |
| Flight phase | Use Ground values before launch and In-flight values after launch. |
| Personal baseline | Proposed: **mean ± 2 SD of at least 7 valid readings**, same posture and time of day. In flight, start about flight day 7. |
| "Repeatedly" | ≥3 of the last 7 days, nights or planned sessions. |
| Missing or unreliable data | **Never green.** Show grey "No data" and count it as an action item. |
| Symptom precedence | Unconsciousness, chest pain, marked breathlessness or sudden vision loss → red, overriding every number. |
| Measurement conditions | BP and pulse: rested ≥5 min, same posture. Temperature: at rest, not within 30 min of exercise, same sensor. Glucose: fasting ≥8 h. Mass: space mass-measurement device. Vision: same chart, distance and correction. |
| Boundaries | "to <X" means X belongs to the next band; "to X inclusive" includes X. |
| Action on red | Any single red needs **prompt review by the crew surgeon or mission control**. With serious symptoms, treat as an emergency. |

`Open items` lists 10 items that still need an owner: CO₂ emergency limit, clinical sign-off, exercise temperature, humidity envelope, PIO₂ table, re-verifying AHA/CDC/NHS values, glucose in microgravity, dose-rate alarms and agency limit, mass baseline day, and a validated mood questionnaire. `Sources` lists 15 references with links.

---

## 3. Seed data (12 JSON files)

Every file is a flat array with one record per crew member per flight day: 4 crew × 20 days = 80 records. Common fields are `subject_id`, `sex`, `day` (`F01`…`F20` = flight day), `environment` and `condition`.

| File | Measurement fields | Range in data | Unit issue |
|---|---|---|---|
| `blood_presure.json` (sic) | `sys`, `dia`, `map` | sys 82–137, dia 48–87 | – |
| `heart rate.json` | `hr_bpm`, `hrv_ms` | HR 60–144, HRV 14–70 | HRV has no threshold |
| `oxygen_saturation.json` | `spo2_pct`, `resp_rate` | SpO₂ 95–99, resp 13–27 | **No thresholds exist for SpO₂ or resp rate.** File is **broken**: see gaps |
| `body_temperature.json` | `temp_c` | 34.8–37.8 | – |
| `blood_sugar.json` | `blood_sugar_mg_dl` | 48–122 | **mg/dL in data vs mmol/l in Excel** → convert (÷18) |
| `body_mass.json` | `body_mass_kg` | 57.8–81.5 | – |
| `sleep_hours.json` | `sleep_hours` | 2.5–8.0 | – |
| `mood_score.json` | `mood_score`, `mood_state` | 1–9; 12 state words | – |
| `food_intake.json` | `calories_kcal`, `water_ml` | kcal 400–3,100; water 500–3,500 ml | Excel uses **% of plan** (no plan given) and **L** |
| `training_done.json` | `training_type`, `duration_min`, `completed` | 0–360 min | Excel uses **% of planned session** (no plan given) |
| `eye_test.json` | `visual_acuity` (Snellen), `optic_disc_edema`, `status` | 20/20…20/80; none/trace/mild/moderate/severe | Excel uses "lines" and diopters |
| `symptoms.json` | `symptoms` (array of codes) | 13 distinct codes | Codes need severity mapping |

**Mission timeline** (same for all crew): FD1–3 Spacecraft → FD4–11 Space_Station → FD12–15 Lunar_Base → FD16–17 Rover → FD18–20 Spacecraft.
**Conditions:** `resting` (67), `post_exercise` (FD8, 4), `eva` (FD14 and FD16, 8), `critical` (F02 FD20, 1).

**Symptom codes found:** `none`, `space_adaptation_syndrome`, `mild_headache`, `mild_fatigue`, `muscle_soreness`, `slight_exhaustion`, `headache`, `dizziness`, `fatigue`, `severe_dizziness`, `nausea`, `weakness`, `collapse`, `severe_hypotension`, `unresponsiveness`.
**Mood states:** focused, calm, good, optimal, energized, strained, tense, fatigued, tired, anxious, distressed, critical.
**Training types:** none, resistance_training, resistance_and_cardio, eva_spacewalk, `eva_spac_walk` (typo), light_cardio.

### 3.1 The crew (4 people: 2 men, 2 women)

| ID | Sex | Start mass (FD1) | Story in the data |
|---|---|---|---|
| M01 | male | 81.5 kg | Healthy throughout; normal EVA strain on FD14 and FD16. |
| M02 | male | 78.0 kg | Healthy; slightly higher BP and HR; tense on FD1; tired after EVAs. |
| F01 | female | 63.5 kg | Healthy throughout. |
| F02 | female | 61.0 kg | Healthy until FD17, then **deteriorates fast on FD18–20**: BP 96/60 → 91/56 → 82/48, HR 98 → 114 → 144, temp 36.0 → 35.5 → 34.8, glucose 74 → 63 → 48 mg/dL, sleep 5.1 → 3.8 → 2.5 h, mood 4 → 3 → 1, intake 1,800 → 400 kcal, vision 20/25 → 20/80, optic disc edema mild → severe, ending in **collapse and unresponsiveness**. This is a ready-made red scenario. |

**No names, ages, heights, agency, career radiation dose or mission plans (kcal or training) exist for any crew member.**

### 3.2 Baselines

The files contain **no explicit baseline values**. The Excel `Rules` sheet defines the method: mean ± 2 SD of ≥7 valid readings, from about FD7. Applied to the first 7 `resting` readings from FD7 onward (FD7, 9, 10, 11, 12, 13, 15), the results are below. They are *computed*, not file values.

| Crew | Systolic | Diastolic | Resting HR | Temp °C | Glucose mg/dL | Mass kg (FD7) |
|---|---|---|---|---|---|---|
| M01 | 116.3 ± 1.8 → 112.7–119.9 | 73.3 ± 1.8 → 69.7–76.9 | 63.1 ± 2.8 → 57.6–68.7 | 36.6 | 87.4 | 81.3 |
| M02 | 120.7 ± 1.5 → 117.7–123.7 | 76.9 ± 1.3 → 74.2–79.5 | 67.1 ± 2.0 → 63.2–71.0 | 36.7 | 91.0 | 77.8 |
| F01 | 105.3 ± 2.3 → 100.7–109.9 | 66.1 ± 1.8 → 62.6–69.7 | 69.0 ± 3.1 → 62.8–75.2 | 36.5 | 85.3 | 63.3 |
| F02 | 106.7 ± 1.8 → 103.1–110.3 | 67.1 ± 1.5 → 64.2–70.1 | 70.4 ± 2.7 → 65.0–75.8 | 36.6 | 87.6 | 60.8 |

Note: the synthetic data is very smooth, so the ±2 SD ranges are narrow and some ordinary days will show orange (for example M02 FD17, systolic 124).

---

## 4. Czech → English translations (all on-screen content)

### 4.1 `Hackathon important files problems adn structure.odt`: health problems

| Czech (original) | English (for screen) |
|---|---|
| Problémy: | Health problems: |
| Srdce: nízký tlak | Heart: low blood pressure |
| Zrak: zhoršení vidění, Syndrom SANS | Vision: worsening eyesight, SANS (spaceflight-associated neuro-ocular syndrome) |
| Rovnováha: Vesmírná nemoc | Balance: space sickness (space motion sickness) |
| Ledviny: infekce močových cest, ledvinové kameny | Kidneys: urinary tract infections, kidney stones |
| Spánek: nespavost, únava, stres | Sleep: insomnia, fatigue, stress |
| Radiace: zvýšené riziko rakoviny | Radiation: increased cancer risk |
| Běžné věci: bolesti hlavy, trávící a zubní potíže | Common issues: headaches, digestive problems and dental problems |

### 4.2 Same file: responses ("when X, do Y")

| # | Czech (original) | English (for screen) |
|---|---|---|
| R1 | Když klesá krevní tlak, ověří se měření a příčina; podle lékařského plánu se doplní tekutiny a případně použijí kompresní oděvy, zejména při návratu do gravitace. NASA | When blood pressure drops: check the measurement and the cause; replace fluids according to the medical plan and, if needed, use compression garments, especially on return to gravity. (Source given: NASA) |
| R2 | Když ubývají svaly a kostní hmota, upraví se odporové cvičení a výživa. | When muscle and bone mass decrease: adjust resistance exercise and nutrition. |
| R3 | Když se zhoršuje zrak, provede se oční vyšetření; u SANS zatím není spolehlivě ověřená prevence. | When vision worsens: carry out an eye examination. There is not yet a reliably proven prevention for SANS. |
| R4 | Když nastane nevolnost nebo dezorientace, omezí se náročné činnosti a podle lékaře se podají léky proti nevolnosti. | When nausea or disorientation occurs: limit demanding activities; anti-nausea medication is given as directed by a doctor. |
| R5 | Když se objeví močové obtíže, vyšetří se moč a případně provede ultrazvuk kvůli infekci nebo kamenům. | When urinary problems appear: test the urine and, if needed, do an ultrasound to check for infection or stones. |
| R6 | Když se zhorší spánek či psychika, upraví se režim, osvětlení a pracovní zátěž a zajistí psychologická podpora. www.nasa.gov | When sleep or mental health worsens: adjust the schedule, lighting and workload, and arrange psychological support. (Source given: www.nasa.gov) |
| R7 | Když vzroste radiace, posádka se přesune do stíněného úkrytu a odloží výstupy. | When radiation rises: the crew moves to the shielded shelter and postpones spacewalks (EVAs). |
| R8 | Když klesne kyslík nebo vzroste CO₂, aktivují se nouzové postupy a řeší se porucha podpory života. | When oxygen falls or CO₂ rises: activate emergency procedures and fix the life-support fault. |
| R9 | Když vznikne podezření na infekci, zjistí se její původ, omezí přenos a nasadí cílená léčba; antibiotika jsou určena pro bakteriální infekce. | When an infection is suspected: find its source, limit transmission and start targeted treatment. Antibiotics are only for bacterial infections. |

### 4.3 `prevence 5 problémů.txt`

| Czech (original) | English (for screen) |
|---|---|
| 1. Prevence pěti hlavních hrozeb vesmíru | 1. Preventing the five main hazards of spaceflight |
| Vesmírná radiace (Space Radiation). Kosmické lodě využívají stínění z materiálů bohatých na vodík (například polyethylen a nádrže s vodou) a mají speciální úkryty pro případ slunečních bouří. Dávku ozáření hlídají osobní dozimetry a zkracování doby přeletů. | **Space radiation.** Spacecraft use shielding made of hydrogen-rich materials (for example polyethylene and water tanks) and have special shelters for solar storms. Personal dosimeters track the radiation dose, and shorter transit times reduce it. |
| Izolace a uzavřený prostor (Isolation and Confinement). Prevencí je pečlivý psychologický výběr posádky, pravidelné videohovory s rodinou a psychology, dostatek volného času na koníčky a pěstování rostlin na palubě. K udržení zdravého spánku slouží dynamické LED osvětlení simulující pozemský den a noc. | **Isolation and confinement.** Prevention means careful psychological selection of the crew, regular video calls with family and psychologists, enough free time for hobbies, and growing plants on board. Dynamic LED lighting that simulates Earth's day and night helps keep sleep healthy. |
| Vzdálenost od Země (Distance from Earth). Protože při cestách na Měsíc či Mars nelze poslat rychlou pomoc ani zásoby, posádka prochází pokročilým lékařským výcvikem. Loď je vybavena autonomními diagnostickými přístroji, telemedicínou a palubní lékárnou pro samostatné řešení akutních stavů. | **Distance from Earth.** On trips to the Moon or Mars, quick help or supplies cannot be sent, so the crew receives advanced medical training. The ship carries autonomous diagnostic devices, telemedicine and an on-board pharmacy so the crew can handle acute conditions on their own. |
| Změněná gravitace (Gravity Fields). Úbytku svalů, řídnutí kostí a oslabení srdce brání dvouhodinové každodenní cvičení na speciálních strojích (běhací pás, rotoped, posilovací systém ARED) doplněné stravou bohatou na vápník a vitamín D. Proti přesunu tekutin do hlavy se používají stehenní manžety a podtlakové kalhoty. | **Altered gravity.** Two hours of exercise every day on special machines (treadmill, exercise bike, ARED resistance system), plus a diet rich in calcium and vitamin D, prevent muscle loss, bone thinning and a weakening heart. Thigh cuffs and lower-body negative-pressure trousers counter the shift of body fluids toward the head. |
| Nepřátelské uzavřené prostředí (Hostile Closed Environments). Obytný prostor funguje jako uzavřený ekosystém s neustálou filtrací vzduchu a recyklací vody. Posádka pravidelně dezinfikuje povrchy a odebírá stěry, aby se v lodi nepřemnožily nebezpečné bakterie a plísně, které by napadly oslabenou imunitu. | **Hostile closed environment.** The habitat works as a closed ecosystem with constant air filtering and water recycling. The crew regularly disinfects surfaces and takes swab samples so that dangerous bacteria and moulds, which could attack a weakened immune system, do not spread on board. |
| 2. Význam sledovaných zdravotních ukazatelů (Self-Assessment) | 2. Why we track these health indicators (self-assessment) |
| Na dlouhých misích musí astronauti sami včas odhalit počínající zdravotní problém. K tomu jim slouží pravidelné měření těchto šesti klíčových parametrů: | On long missions, astronauts must spot an emerging health problem early by themselves. Regular measurement of these six key parameters helps them do that: |
| Ukazatel / Co ve vesmíru odhaluje a čemu předchází | Indicator / What it reveals in space and what it helps prevent |
| Krevní tlak a tepová frekvence: Odhaluje adaptaci srdce na beztíži, dehydrataci nebo oslabení cévního systému (riziko omdlení při návratu do gravitace). | **Blood pressure and heart rate:** show how the heart adapts to weightlessness, and reveal dehydration or a weakened blood-vessel system (risk of fainting on return to gravity). |
| Hladina cukru v krvi: Hlídá správný metabolismus a dostatečný příjem energie, protože astronauti ve vesmíru často trpí nechutenstvím a hubnou. | **Blood sugar:** checks healthy metabolism and enough energy intake, because astronauts in space often lose their appetite and lose weight. |
| Tělesná teplota: Slouží jako včasné varování před infekcí, zánětem nebo reaktivací spících virů vlivem oslabené imunity. | **Body temperature:** an early warning of infection, inflammation or reactivation of dormant viruses caused by weakened immunity. |
| Denní počet hodin spánku: Upozorňuje na narušení biorytmu a chronickou únavu, která zvyšuje riziko chyb při ovládání lodi. | **Daily hours of sleep:** flags a disrupted body clock and chronic fatigue, which raises the risk of mistakes when operating the spacecraft. |
| Nálada (Mood): Pomáhá včas zachytit počínající úzkost, deprese, syndrom vyhoření nebo napětí v týmu z důvodu izolace. | **Mood:** helps catch early anxiety, depression, burnout or tension in the team caused by isolation. |

File name: "prevence 5 problémů" = "prevention of 5 problems".

### 4.4 The team's app structure (`.odt`, already English, summarised)

1. **Check-ins:** a daily quick check-in (sleep, mood, symptoms, exercise, food) plus a **bigger scan (BP, HR, temperature, glucose)**. Recommendation: **scan every 3 days, plus an early extra scan when a check-in or rule flags something** (marked as an assumption to verify against NASA HRP).
2. **Rules tab:** simple rules, status OK / watch / firing, and the data behind each.
3. **Body map:** regions coloured "green, yellow or red", click for details, and an **optional five-hazard view toggle**.
4. **Trends:** charts per indicator against the astronaut's own baseline, with check-in and scan data on one timeline.
5. **Action:** the next step per warning (**rest, re-measure, or contact the flight surgeon**) and **a note on when ground contact may be delayed**. The wording needs verification.
6. **Explanations:** what each indicator means, how to measure it, and why the risk matters.

---

## 5. Measurement how-tos

| Measurement | What the files give | Status |
|---|---|---|
| Sleep | Equipment: Actiwatch or wrist actigraphy plus sleep diary (`AI measure.txt`) | Steps **missing** → draft, "needs verification" |
| Mood | Digital self-assessment questionnaire; no device | Steps missing → draft |
| Symptoms | Digital symptom questionnaire | Steps missing → draft |
| Food and water | ISS food inventory, nutrition database, digital food diary | Steps missing → draft |
| Training | CEVIS, T2 treadmill, ARED plus monitoring devices | Steps missing → draft |
| Blood pressure | "ISS-approved BP equipment" (no device name); rested ≥5 min, same posture, supine baseline (Excel) | Partial → draft plus Excel conditions |
| Heart rate | HR monitor, ECG or approved equipment; rested ≥5 min, same posture | Partial → draft |
| Body temperature | Approved thermometer; at rest, not within 30 min of exercise, same sensor type | Partial → draft |
| Blood glucose | Approved glucose testing or ISS point-of-care lab; fasting ≥8 h; hygiene | Partial → draft |
| Body mass | **SLAMMD**; why normal scales don't work in microgravity | Partial → draft |
| Eye test | ISS ophthalmic equipment or vision charts; same chart, distance and correction; near and distance acuity | Partial → draft |
| SpO₂ and resp rate | Not mentioned in any file | **Missing entirely** |

`AI measure.txt` also defines the **display structure** for every how-to: What are you measuring? / Required equipment / Before you start / Step-by-step / How to enter the result / Common mistakes / Important safety information.

---

## 6. Mascot ("Dr. Biscuit")

| File | Shows | Format and size | Proposed use |
|---|---|---|---|
| `Dr._Biscuit.png` | Smiling, waving, clipboard | PNG **with transparency**, 439×568 | Default, greeting, neutral guide |
| `buscuit_good.jpg` | Sunglasses, thumbs up | JPG, white background, 912×1180 | **Healthy / all green** |
| `Buscuit_scared.jpg` | Wide eyes, paws on cheeks, "!?" | JPG 912×1180 | **Warning or red** |
| `Buscuit_schocked.jpg` | **Byte-identical to `Buscuit_scared.jpg`** | JPG 912×1180 | Duplicate: only one alarm emotion exists |
| `Buscuit_sick.jpg` | Mask, thermometer, hospital gown, tissue | JPG 912×1180 | Red with symptoms or temperature; illness |
| `Buscuit_sleep.jpg` | Sleep mask, pillow, alarm clock | JPG 912×1180 | Sleep how-to; sleep warning |
| `Buscuit_workout.jpg` | Running on a treadmill | JPG 912×1180 | Training how-to |
| `Buscuit_drink.jpg` | Drinking water | JPG 912×1180 | Water and food how-to |
| `Buscuit_measure_heart.jpg` | BP cuff, monitor showing 120/80, serious face | JPG **1824×2360 (1.7 MB)** | BP and HR how-to; "concerned" look |

File names misspell "Biscuit" as "Buscuit"; the signature on the drawings reads "Schulz".
**Missing emotions or poses:** a distinct *warning/worried* emotion separate from scared (orange and red currently share one image), and poses for eye test, glucose, temperature, body mass, mood, radiation and the ship environment. The 8 JPGs have **white backgrounds**, which will look like boxes on a dark theme.

---

## 7. Gaps, contradictions and unreadable content

### Broken or inconsistent data
1. **`oxygen_saturation.json` is invalid JSON.** It ends after F02 FD17 with a trailing comma and no closing `]`. F02 FD18–20 are missing, which are exactly the crisis days, and only 77 of 80 records exist.
2. **`eye_test.json` line 73:** a record inside F02's block is labelled `subject_id: "M02", sex: "male"`, day F09. As a result M02 has 21 eye records and F02 has 19. It is almost certainly F02 FD9.
3. **`body_mass.json` line 81** has a stray extra field `"same_id": "F02"`.
4. **`training_done.json`:** `eva_spac_walk` is a typo for `eva_spacewalk` (F02 FD16).
5. **ID clash:** female crew IDs `F01` and `F02` look the same as flight days `F01`…`F20`.
6. File name typos: `blood_presure.json`, `heart rate.json` (space), `adn`. The duplicate `.xlsx (1)` and the duplicate scared/shocked image.

### Unit and definition mismatches between data and thresholds
7. Glucose: data in **mg/dL**, thresholds in **mmol/l**. Conversion ÷18 (standard factor 18.0). The data does not say whether readings were fasting.
8. Food: thresholds are **% of planned kcal**, but **no plan exists** in any file. NASA's 3,035 kcal average would make every normal day orange (2,600/3,035 = 86 %).
9. Training: thresholds are **% of planned session**, but no plan exists. `completed: false` with `training_type: none` cannot be told apart between approved rest and a missed session.
10. Vision: the data uses Snellen acuity and an `optic_disc_edema` grade. The Excel file uses "lines" and diopters. **`trace` edema appears for every crew member from FD10.** The Excel red rule says "clinician-confirmed optic disc swelling", but grades are not defined. No hyperopic-shift data exists.
11. Symptoms: data codes such as `severe_dizziness`, `weakness` and `severe_hypotension` are not in the Excel red list. Only `collapse` and `unresponsiveness` clearly match "loss of consciousness".
12. Water: data in ml, thresholds in L (trivial).

### Threshold gaps in the Excel file itself
13. **Sleep, food, training:** a single bad day (sleep <6 h once, food <75 % once, training <50 % once) belongs to **no band**. Red needs ≥3 of 7 and orange stops at 6 / 75 / 50.
14. **Glucose:** a single reading ≥16.7 mmol/l is in no band (orange ends below 16.7, red needs 2 consecutive).
15. **No thresholds at all** for SpO₂, respiratory rate, HRV and MAP (all in the data).
16. Total cabin pressure: the green "nominal band" has no number. Radiation dose rate has no numbers at all. CO₂ red is a labelled placeholder (4.0).
17. Career radiation dose needs each crew member's prior dose, and that is not in any file.
18. Readings during `eva`, `post_exercise` and `critical` conditions: the Excel thresholds are for rest. The status of a `critical` reading is unclear.

### Contradictions between documents
19. **Colour name:** the `.odt` says "green, **yellow** or red"; the Excel file and your brief say **orange**.
20. **Check-in cadence:** your brief says one scan per day with all measurements. The `.odt` says a daily quick check-in plus a **bigger scan every 3 days** and extra scans when flagged. The seed data has all measurements every day.
21. **Exercise volume:** "2 hours every day" (`prevence`), "~600 min/week" (Excel) and "1 h 45 min" (`training.txt`).
22. The `.odt` scan covers BP, HR, temperature and glucose. **Body mass and the eye test are not assigned** to either the check-in or the scan.
23. `training.txt` example astronauts (male 35 y/80 kg, female 32 y/60 kg, male 52 y/75 kg) **do not match** the 4 crew in the JSON. Ages are needed for its formula.
24. Problems listed in the `.odt` with **no data and no thresholds**: kidneys (UTI, stones), dental problems, digestive problems, space motion sickness (only the symptom code `space_adaptation_syndrome`), and cancer risk (only via the radiation dose).
25. Immediate red actions: apart from R1–R9 and "Action on red", the files give no specific "what to do now" steps. Low glucose is labelled "treat now" with no treatment described. The ground-contact delay has no figures.

### Unreadable
Nothing was unreadable. `oxygen_saturation.json` was read by repairing it in memory; the file itself was not changed.
