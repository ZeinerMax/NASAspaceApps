// Health problems, responses and prevention: translated from the team's Czech files.
// Sources: "Hackathon important files problems adn structure.odt" (problems + responses R1–R9),
// "prevence 5 problémů.txt" (five hazards + indicator meanings), Excel notes. Translations: INVENTORY.md §4.
// Eye/vision (SANS, R3) removed by team decision 2.
import type { Problem } from '../types';

const ODT = 'Hackathon important files problems adn structure.odt';
const PREV = 'prevence 5 problémů.txt';

export const PROBLEMS: Problem[] = [
  {
    id: 'low-bp', title: 'Low blood pressure', system: 'Heart',
    regions: ['chest'], ruleIds: ['CH-SYS', 'CH-DIA', 'CH-HR'], hazardIds: ['gravity'],
    whatItIs: 'Blood pressure and heart rate show how the heart adapts to weightlessness, and reveal dehydration or a weakened blood-vessel system (risk of fainting on return to gravity).',
    response: 'Check the measurement and the cause. Replace fluids according to the medical plan and, if needed, use compression garments, especially on return to gravity. (Source given: NASA)',
    prevention: 'Thigh cuffs and lower-body negative-pressure trousers counter the shift of body fluids toward the head.',
    source: `${ODT}; ${PREV}`,
  },
  {
    id: 'space-sickness', title: 'Balance: space sickness', system: 'Balance',
    regions: ['head'], ruleIds: [], hazardIds: ['gravity'], symptomCodes: ['space_adaptation_syndrome', 'nausea', 'dizziness', 'severe_dizziness'],
    whatItIs: 'Nausea and disorientation while the body adapts to altered gravity (space adaptation sickness).',
    response: 'Limit demanding activities. Anti-nausea medication is given as directed by a doctor.',
    prevention: null, source: ODT,
  },
  {
    id: 'sleep', title: 'Sleep: insomnia, fatigue, stress', system: 'Sleep and mental health',
    regions: ['head'], ruleIds: ['CH-SLEEP', 'CH-MOOD'], hazardIds: ['isolation'],
    whatItIs: 'Daily hours of sleep flag a disrupted body clock and chronic fatigue, which raises the risk of mistakes when operating the spacecraft. Mood helps catch early anxiety, depression, burnout or tension in the team caused by isolation.',
    response: 'Adjust the schedule, lighting and workload, and arrange psychological support. (Source given: www.nasa.gov)',
    prevention: 'Careful psychological selection of the crew, regular video calls with family and psychologists, enough free time for hobbies, and growing plants on board. Dynamic LED lighting that simulates Earth\'s day and night helps keep sleep healthy.',
    source: `${ODT}; ${PREV}`,
  },
  {
    id: 'headache', title: 'Headaches', system: 'Common issues',
    regions: ['head'], ruleIds: ['SH-CO2'], hazardIds: ['environment'], symptomCodes: ['headache', 'mild_headache'],
    whatItIs: 'A common complaint in flight. NASA data link headaches to cabin CO₂ at about 2.8–4.5 mmHg, so a new headache should trigger a CO₂ check.',
    response: 'Check cabin CO₂. When oxygen falls or CO₂ rises: activate emergency procedures and fix the life-support fault.',
    prevention: null, source: `${ODT}; Excel Crew health!E5`,
  },
  {
    id: 'dental', title: 'Dental problems', system: 'Common issues',
    regions: ['head'], ruleIds: [], hazardIds: [], symptomCodes: ['tooth_pain'],
    whatItIs: 'Listed by the team as a common issue on long missions. No measurement covers it; report tooth pain in the daily check-in.',
    response: null, prevention: null, source: ODT,
  },
  {
    id: 'digestive', title: 'Digestive problems', system: 'Common issues',
    regions: ['abdomen'], ruleIds: ['CH-FOOD', 'CH-WATER'], hazardIds: [], symptomCodes: ['digestive_upset', 'nausea'],
    whatItIs: 'Listed by the team as a common issue. Astronauts in space often lose their appetite and lose weight; blood sugar checks healthy metabolism and enough energy intake.',
    response: null, prevention: null, source: `${ODT}; ${PREV}`,
  },
  {
    id: 'kidneys', title: 'Kidneys: urinary tract infections, kidney stones', system: 'Kidneys',
    regions: ['abdomen'], ruleIds: [], hazardIds: ['gravity'], symptomCodes: ['urinary_discomfort'],
    whatItIs: 'Listed by the team as a spaceflight risk. No measurement covers it directly; report urinary discomfort in the daily check-in.',
    response: 'Test the urine and, if needed, do an ultrasound to check for infection or stones.',
    prevention: null, source: ODT,
  },
  {
    id: 'muscle-bone', title: 'Muscle and bone loss', system: 'Muscles and bones',
    regions: ['arms', 'legs'], ruleIds: ['CH-TRAINING', 'CH-MASS'], hazardIds: ['gravity'],
    whatItIs: 'Altered gravity causes muscle loss, bone thinning and a weakening heart.',
    response: 'Adjust resistance exercise and nutrition.',
    prevention: 'Two hours of exercise every day on special machines (treadmill, exercise bike, ARED resistance system), plus a diet rich in calcium and vitamin D.',
    source: `${ODT}; ${PREV}`,
  },
  {
    id: 'infection', title: 'Infection', system: 'Immune system',
    regions: ['body'], ruleIds: ['CH-TEMP'], hazardIds: ['environment'],
    whatItIs: 'Body temperature is an early warning of infection, inflammation or reactivation of dormant viruses caused by weakened immunity.',
    response: 'Find the source of the infection, limit transmission and start targeted treatment. Antibiotics are only for bacterial infections.',
    prevention: 'The habitat works as a closed ecosystem with constant air filtering and water recycling. The crew regularly disinfects surfaces and takes swab samples so that dangerous bacteria and moulds do not spread on board.',
    source: `${ODT}; ${PREV}`,
  },
  {
    id: 'radiation', title: 'Radiation: increased cancer risk', system: 'Radiation',
    regions: ['body'], ruleIds: ['SH-RAD-CAREER', 'SH-RAD-SPE', 'SH-RAD-RATE'], hazardIds: ['radiation'],
    whatItIs: 'Space radiation raises the long-term risk of cancer. The ship measures the dose for the whole crew.',
    response: 'When radiation rises: the crew moves to the shielded shelter and postpones spacewalks (EVAs).',
    prevention: 'Spacecraft use shielding made of hydrogen-rich materials (for example polyethylene and water tanks) and have special shelters for solar storms. Personal dosimeters track the dose, and shorter transit times reduce it.',
    source: `${ODT}; ${PREV}`,
  },
  {
    id: 'cabin-air', title: 'Cabin air: low oxygen or high CO₂', system: 'Life support',
    regions: [], ruleIds: ['SH-CO2', 'SH-PIO2', 'SH-PRESSURE', 'SH-DILUENT', 'SH-CABIN-T', 'SH-RH'], hazardIds: ['environment'],
    whatItIs: 'The cabin atmosphere is kept within NASA limits for CO₂, oxygen, pressure, temperature and humidity.',
    response: 'When oxygen falls or CO₂ rises: activate emergency procedures and fix the life-support fault.',
    prevention: null, source: `${ODT}; Excel Cabin & radiation`,
  },
];
