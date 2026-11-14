// "What it means / why it matters / how to measure" per indicator (.odt part 6).
// Structure follows "AI measure.txt" (7 headings). Equipment names come from AI measure.txt; measurement
// conditions from Excel Rules!B10. ALL step-by-step text is a DRAFT written for the prototype → needsVerification.
// "meaning" and "why" use the translated prevence table and Excel notes where those exist.

export interface HowTo {
  what: string;
  equipment: string;
  before: string[];
  steps: string[];
  enter: string;
  mistakes: string[];
  safety: string;
}

export interface Explanation {
  id: string;
  title: string;
  meaning: string;
  why: string;
  howTo: HowTo;
  needsVerification: true;
  mascot: 'sleep' | 'workout' | 'drink' | 'measure' | 'default';
}

const SAFETY = 'If you feel severe, sudden or unusual symptoms, stop and follow the onboard medical protocol: contact the Crew Medical Officer or the flight surgeon.';

export const EXPLANATIONS: Record<string, Explanation> = {
  sleep: {
    id: 'sleep', title: 'Sleep', mascot: 'sleep', needsVerification: true,
    meaning: 'How many hours you slept last night.',
    why: 'Daily hours of sleep flag a disrupted body clock and chronic fatigue, which raises the risk of mistakes when operating the spacecraft.',
    howTo: {
      what: 'Total sleep time last night, in hours.',
      equipment: 'Actiwatch or an equivalent wrist-worn activity monitor, plus the sleep diary.',
      before: ['Wear the watch through the whole sleep period.'],
      steps: ['Read the total sleep time from the watch summary.', 'Compare it with your sleep diary (time asleep, time awake, interruptions).', 'If they disagree a lot, use the watch value and add a note.'],
      enter: 'Hours, with one decimal (for example 7.5).',
      mistakes: ['Counting time in the sleep station that you were awake.', 'Forgetting to wear the watch.'],
      safety: SAFETY,
    },
  },
  mood: {
    id: 'mood', title: 'Mood', mascot: 'default', needsVerification: true,
    meaning: 'How you feel today on a scale from 1 (worst) to 10 (best).',
    why: 'Mood helps catch early anxiety, depression, burnout or tension in the team caused by isolation.',
    howTo: {
      what: 'Your current emotional state, stress and motivation as one score.',
      equipment: 'Digital self-assessment questionnaire (no medical device).',
      before: ['Take a moment somewhere quiet.'],
      steps: ['Think about how you feel right now, not yesterday.', 'Pick a score from 1 to 10.', 'Pick the word that fits best.'],
      enter: 'A number from 1 to 10 and one word.',
      mistakes: ['Rating the mission instead of yourself.', 'Always picking the same number out of habit.'],
      safety: 'If you feel very low or unsafe, talk to the Crew Medical Officer or ground psychological support today.',
    },
  },
  symptoms: {
    id: 'symptoms', title: 'Symptoms', mascot: 'default', needsVerification: true,
    meaning: 'Any physical discomfort, pain or unusual feeling today.',
    why: 'Serious symptoms (loss of consciousness, chest pain, marked breathlessness, sudden vision loss) override every number. A new headache can be a sign of high cabin CO₂.',
    howTo: {
      what: 'Pain, headache, nausea, fatigue and any other unusual symptom.',
      equipment: 'Digital symptom questionnaire (no medical device).',
      before: ['Think about the last 24 hours.'],
      steps: ['Tick every symptom you have.', 'Add anything else in the free-text field.', 'Tick nothing if you feel fine.'],
      enter: 'Checkboxes plus optional text.',
      mistakes: ['Leaving out "small" symptoms. Mild ones matter too.'],
      safety: SAFETY,
    },
  },
  food: {
    id: 'food', title: 'Food intake', mascot: 'drink', needsVerification: true,
    meaning: 'How much energy you ate yesterday, compared with your plan.',
    why: 'Astronauts in space often lose their appetite and lose weight. EVA days need extra calories and water.',
    howTo: {
      what: 'Total calories eaten in the last day.',
      equipment: 'ISS food inventory, nutritional database and digital food diary.',
      before: ['Keep the food packages or barcodes until you log them.'],
      steps: ['Log every meal and snack in the food diary.', 'Read the daily calorie total.'],
      enter: 'Kilocalories (kcal), whole number.',
      mistakes: ['Logging planned meals instead of what you actually ate.'],
      safety: SAFETY,
    },
  },
  water: {
    id: 'water', title: 'Water', mascot: 'drink', needsVerification: true,
    meaning: 'How much you drank yesterday.',
    why: 'NASA lists 2.5 L per day as the minimum water provision. Low intake can lead to dehydration and low blood pressure.',
    howTo: {
      what: 'Total water and drinks in the last day.',
      equipment: 'Digital food diary / drink bags.',
      before: [],
      steps: ['Add up all drink bags and rehydrated drinks.', 'Do not count water used to rehydrate food.'],
      enter: 'Millilitres (ml), whole number.',
      mistakes: ['Forgetting drinks during exercise.'],
      safety: SAFETY,
    },
  },
  training: {
    id: 'training', title: 'Training', mascot: 'workout', needsVerification: true,
    meaning: 'How much of yesterday\'s planned exercise session you completed.',
    why: 'Altered gravity causes muscle loss, bone thinning and a weakening heart. Daily exercise on the treadmill, exercise bike and ARED prevents it.',
    howTo: {
      what: 'Type of exercise and minutes done.',
      equipment: 'CEVIS exercise bike, T2 treadmill and ARED resistance device, with their exercise monitors.',
      before: [],
      steps: ['Pick the type of exercise.', 'Enter the minutes you actually exercised.', 'On the approved rest day nothing needs to be entered.'],
      enter: 'Type and minutes. The plan is 60 min.',
      mistakes: ['Counting set-up time as exercise.'],
      safety: SAFETY,
    },
  },
  bp: {
    id: 'bp', title: 'Blood pressure', mascot: 'measure', needsVerification: true,
    meaning: 'The pressure of blood in your arteries: systolic (upper) and diastolic (lower) number.',
    why: 'Blood pressure and heart rate show how the heart adapts to weightlessness, and reveal dehydration or a weakened blood-vessel system (risk of fainting on return to gravity).',
    howTo: {
      what: 'Systolic and diastolic pressure.',
      equipment: 'ISS-approved blood pressure monitoring equipment (exact device: check the mission inventory).',
      before: ['Rest at least 5 minutes.', 'Use the same posture as always.', 'No exercise in the last 30 minutes.'],
      steps: ['Secure yourself (foot loops or restraint) so you do not drift.', 'Put the cuff on the bare upper arm at heart level.', 'Keep still and silent while it measures.', 'Read both numbers.'],
      enter: 'Two whole numbers in mmHg (for example 118 / 76).',
      mistakes: ['Measuring right after exercise.', 'Changing posture between days.', 'A loose cuff.'],
      safety: SAFETY,
    },
  },
  hr: {
    id: 'hr', title: 'Resting heart rate', mascot: 'measure', needsVerification: true,
    meaning: 'Heart beats per minute at rest.',
    why: 'Resting heart rate changes with dehydration, illness, stress and adaptation to weightlessness.',
    howTo: {
      what: 'Resting heart rate.',
      equipment: 'Compatible heart rate monitor, ECG or approved medical monitoring equipment.',
      before: ['Rest at least 5 minutes in the same posture.'],
      steps: ['Use the reading from the blood pressure monitor or heart rate monitor.', 'Read the value after it is stable.'],
      enter: 'Beats per minute, whole number.',
      mistakes: ['Measuring after moving around.'],
      safety: SAFETY,
    },
  },
  temp: {
    id: 'temp', title: 'Body temperature', mascot: 'default', needsVerification: true,
    meaning: 'Your body temperature at rest.',
    why: 'Body temperature is an early warning of infection, inflammation or reactivation of dormant viruses caused by weakened immunity. In flight, resting temperature is about 1 °C higher than on Earth.',
    howTo: {
      what: 'Body temperature in °C.',
      equipment: 'Approved medical thermometer or the available medical monitoring system.',
      before: ['At rest, not within 30 minutes of exercise.', 'Always use the same sensor type and location.'],
      steps: ['Measure at the same body location as every day.', 'Wait for the device to finish.', 'Read the value.'],
      enter: '°C with one decimal (for example 36.7).',
      mistakes: ['Mixing sensor types (skin, forehead and core readings differ).', 'Measuring after exercise.'],
      safety: SAFETY,
    },
  },
  glucose: {
    id: 'glucose', title: 'Fasting blood glucose', mascot: 'default', needsVerification: true,
    meaning: 'The sugar level in your blood before breakfast.',
    why: 'Blood sugar checks healthy metabolism and enough energy intake, because astronauts in space often lose their appetite and lose weight.',
    howTo: {
      what: 'Blood glucose after at least 8 hours without food.',
      equipment: 'Approved blood glucose testing equipment or the ISS point-of-care lab (check the mission inventory).',
      before: ['No food for at least 8 hours.', 'Clean hands and the fingertip.'],
      steps: ['Use a new lancet and test strip.', 'Collect a small drop of blood and contain it (it must not float away).', 'Read the value.', 'Dispose of sharps and wipes in the biohazard container.'],
      enter: 'mg/dL, whole number (the app converts to mmol/l).',
      mistakes: ['Measuring after eating.', 'Re-using strips.'],
      safety: 'If the value is low (below 70 mg/dL) treat it now and tell the Crew Medical Officer. ' + SAFETY,
    },
  },
  mass: {
    id: 'mass', title: 'Body mass', mascot: 'default', needsVerification: true,
    meaning: 'Your body mass in kilograms.',
    why: 'Loss of body mass shows too little energy intake or muscle loss. Normal scales do not work in weightlessness because nothing presses down on them.',
    howTo: {
      what: 'Body mass in kg.',
      equipment: 'SLAMMD (Space Linear Acceleration Mass Measurement Device) or another approved ISS mass-measurement system.',
      before: ['Same time of day and similar clothing each time.'],
      steps: ['Strap into the device as trained.', 'Hold still while it measures your acceleration.', 'Read the mass value.'],
      enter: 'kg with one decimal.',
      mistakes: ['Moving during the measurement.', 'Different clothing or items in pockets.'],
      safety: SAFETY,
    },
  },
  spo2: {
    id: 'spo2', title: 'Oxygen saturation and breathing rate', mascot: 'measure', needsVerification: true,
    meaning: 'How much oxygen your blood carries (%) and breaths per minute.',
    why: 'Shown for information only: our files contain no thresholds for these values.',
    howTo: {
      what: 'SpO₂ in % and breaths per minute.',
      equipment: 'Not named in the team files: check the mission inventory.',
      before: ['Rest at least 5 minutes.'],
      steps: ['Put the clip sensor on a warm finger.', 'Wait for a stable reading.', 'Count breaths for one minute.'],
      enter: 'SpO₂ in %, breaths per minute.',
      mistakes: ['Cold fingers or moving hands.'],
      safety: SAFETY,
    },
  },
};
