import type { CrewId, CrewMember } from '../types';

// Team decisions (PLAN.md §13): names, ages, plans. Nothing here comes from NASA figures.
export const CREW: CrewMember[] = [
  { id: 'F01', sex: 'female', displayName: 'Crew member F01', ageYears: 32, plannedKcalPerDay: 2300, plannedTrainingMin: 60, priorCareerDoseMSv: null },
  { id: 'F02', sex: 'female', displayName: 'Crew member F02', ageYears: 35, plannedKcalPerDay: 2300, plannedTrainingMin: 60, priorCareerDoseMSv: null },
  { id: 'M01', sex: 'male', displayName: 'Crew member M01', ageYears: 35, plannedKcalPerDay: 2600, plannedTrainingMin: 60, priorCareerDoseMSv: null },
  { id: 'M02', sex: 'male', displayName: 'Crew member M02', ageYears: 38, plannedKcalPerDay: 2600, plannedTrainingMin: 60, priorCareerDoseMSv: null },
];

export const crewById = (id: CrewId): CrewMember => CREW.find((c) => c.id === id)!;

/**
 * Approved rest (team decision 4, adapted to the crew's routine in the data: 2 training days, then 1 rest day):
 * ONE rest day at a time is approved. A second day in a row without training counts as a missed session.
 */
export const MAX_REST_DAYS_IN_A_ROW = 1;

/** Baseline window (team decision 10 + Excel Rules!B6). */
export const BASELINE_WINDOW_DAYS = 20;
export const BASELINE_FIRST_FLIGHT_DAY = 7;
export const BASELINE_MIN_READINGS = 7;
