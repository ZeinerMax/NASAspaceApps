// Symptom catalogue (PLAN.md §5.4). Codes marked `fromData` appear in symptoms.json.
// Red level = Excel red-flag list (Crew health!D5, Rules!B9). Everything else = "new mild symptom" (orange).
import type { RegionId } from '../types';

export interface SymptomDef {
  code: string;
  label: string;
  level: 'orange' | 'red';
  regions: RegionId[];
  fromData: boolean;
  /** Counts as "dizziness or collapse" for the blood-pressure red rule. */
  dizzinessOrCollapse?: boolean;
  headache?: boolean;
  fatigue?: boolean;
  proposal?: boolean;
}

export const SYMPTOMS: SymptomDef[] = [
  // red flags first (shown at the top of the check-in)
  { code: 'loss_of_consciousness', label: 'Loss of consciousness', level: 'red', regions: ['head', 'body'], fromData: false, dizzinessOrCollapse: true },
  { code: 'collapse', label: 'Collapse', level: 'red', regions: ['head', 'body'], fromData: true, dizzinessOrCollapse: true },
  { code: 'unresponsiveness', label: 'Unresponsive', level: 'red', regions: ['head', 'body'], fromData: true, dizzinessOrCollapse: true },
  { code: 'chest_pain', label: 'Chest pain', level: 'red', regions: ['chest'], fromData: false },
  { code: 'marked_breathlessness', label: 'Marked breathlessness', level: 'red', regions: ['chest'], fromData: false },
  { code: 'sudden_vision_loss', label: 'Sudden vision loss', level: 'red', regions: ['head'], fromData: false },
  // mild / new symptoms
  { code: 'space_adaptation_syndrome', label: 'Space adaptation sickness', level: 'orange', regions: ['head'], fromData: true },
  { code: 'mild_headache', label: 'Mild headache', level: 'orange', regions: ['head'], fromData: true, headache: true },
  { code: 'headache', label: 'Headache', level: 'orange', regions: ['head'], fromData: true, headache: true },
  { code: 'dizziness', label: 'Dizziness', level: 'orange', regions: ['head'], fromData: true, dizzinessOrCollapse: true },
  { code: 'severe_dizziness', label: 'Severe dizziness', level: 'orange', regions: ['head'], fromData: true, dizzinessOrCollapse: true },
  { code: 'tooth_pain', label: 'Tooth pain', level: 'orange', regions: ['head'], fromData: false, proposal: true },
  { code: 'severe_hypotension', label: 'Very low blood pressure (reported)', level: 'orange', regions: ['chest'], fromData: true },
  { code: 'nausea', label: 'Nausea', level: 'orange', regions: ['abdomen'], fromData: true },
  { code: 'digestive_upset', label: 'Digestive upset', level: 'orange', regions: ['abdomen'], fromData: false, proposal: true },
  { code: 'urinary_discomfort', label: 'Urinary discomfort (kidneys)', level: 'orange', regions: ['abdomen'], fromData: false, proposal: true },
  { code: 'muscle_soreness', label: 'Muscle soreness', level: 'orange', regions: ['arms', 'legs'], fromData: true },
  { code: 'mild_fatigue', label: 'Mild fatigue', level: 'orange', regions: ['body'], fromData: true, fatigue: true },
  { code: 'fatigue', label: 'Fatigue', level: 'orange', regions: ['body'], fromData: true, fatigue: true },
  { code: 'slight_exhaustion', label: 'Slight exhaustion', level: 'orange', regions: ['body'], fromData: true, fatigue: true },
  { code: 'weakness', label: 'Weakness', level: 'orange', regions: ['body'], fromData: true, fatigue: true },
];

const byCode = new Map(SYMPTOMS.map((s) => [s.code, s]));

/** Unknown codes (e.g. from an import) are treated as orange whole-body symptoms. */
export const symptomDef = (code: string): SymptomDef =>
  byCode.get(code) ?? { code, label: code.replace(/_/g, ' '), level: 'orange', regions: ['body'], fromData: false };
