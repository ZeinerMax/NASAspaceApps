// Status → next step (PLAN.md §6.5, .odt part 5: rest / re-measure / contact the flight surgeon).
import type { RuleResult } from '../types';
import { VERIFY } from '../data/rules';

export type ActionLevel = 'remeasure' | 'rest' | 'treat' | 'surgeon' | 'emergency';

export interface Action {
  level: ActionLevel;
  title: string;
  detail: string;
  showGroundNote: boolean;
}

export function actionFor(r: RuleResult): Action | null {
  if (r.flags.includes('EMERGENCY'))
    return {
      level: 'emergency', title: 'Treat as an emergency',
      detail: 'Follow the onboard medical protocol and alert the Crew Medical Officer. Then contact the flight surgeon / mission control.',
      showGroundNote: true,
    };
  if (r.status === 'red')
    return { level: 'surgeon', title: 'Contact the flight surgeon / mission control now', detail: 'Any single red indicator needs prompt review (Excel Rules!B12).', showGroundNote: true };
  if (r.flags.includes('TREAT_NOW'))
    return {
      level: 'treat', title: 'Low blood sugar: treat now',
      detail: `Treat now, re-measure and inform the Crew Medical Officer. Treatment details are not in our files (${VERIFY}).`,
      showGroundNote: false,
    };
  if (r.flags.includes('EXERCISE_READING'))
    return { level: 'remeasure', title: 'Re-measure at rest', detail: 'Rest at least 5 minutes in the same posture, then measure again.', showGroundNote: false };
  if (r.status === 'grey') return { level: 'remeasure', title: 'Re-measure', detail: 'Missing data is never shown as green. Measure again or check the sensor.', showGroundNote: false };
  if (r.status === 'orange')
    return { level: 'rest', title: 'Rest and re-measure', detail: 'Take it easy and check this value again at the next daily check-in. See the response and prevention below.', showGroundNote: false };
  return null;
}
