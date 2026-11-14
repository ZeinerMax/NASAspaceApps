// The five hazards of spaceflight (translated from "prevence 5 problémů.txt").
// The rule mapping is a proposal (PLAN.md §6.4).
import type { HazardId } from '../types';

export interface HazardDef {
  id: HazardId;
  label: string;
  icon: string;
  ruleIds: string[];
  prevention: string;
}

export const GROUND_CONTACT_NOTE =
  'Contact with Earth may be delayed or unavailable. Act on the onboard medical protocol first: the crew is trained for this, and the ship carries diagnostics, telemedicine and a pharmacy.';

export const HAZARDS: HazardDef[] = [
  {
    id: 'radiation', label: 'Space radiation', icon: '☢', ruleIds: ['SH-RAD-CAREER', 'SH-RAD-SPE'],
    prevention: 'Spacecraft use shielding made of hydrogen-rich materials (for example polyethylene and water tanks) and have special shelters for solar storms. Personal dosimeters track the radiation dose, and shorter transit times reduce it.',
  },
  {
    id: 'isolation', label: 'Isolation & confinement', icon: '◎', ruleIds: ['CH-MOOD', 'CH-SLEEP'],
    prevention: 'Careful psychological selection of the crew, regular video calls with family and psychologists, enough free time for hobbies, and growing plants on board. Dynamic LED lighting that simulates Earth\'s day and night helps keep sleep healthy.',
  },
  {
    id: 'distance', label: 'Distance from Earth', icon: '⟷', ruleIds: [],
    prevention: 'On trips to the Moon or Mars, quick help or supplies cannot be sent, so the crew receives advanced medical training. The ship carries autonomous diagnostic devices, telemedicine and an on-board pharmacy so the crew can handle acute conditions on their own.',
  },
  {
    id: 'gravity', label: 'Altered gravity', icon: '⇣', ruleIds: ['CH-SYS', 'CH-DIA', 'CH-HR', 'CH-MASS', 'CH-TRAINING'],
    prevention: 'Two hours of exercise every day on special machines (treadmill, exercise bike, ARED resistance system), plus a diet rich in calcium and vitamin D, prevent muscle loss, bone thinning and a weakening heart. Thigh cuffs and lower-body negative-pressure trousers counter the shift of body fluids toward the head.',
  },
  {
    id: 'environment', label: 'Hostile closed environment', icon: '⬡', ruleIds: ['CH-TEMP', 'SH-CO2', 'SH-PIO2', 'SH-CABIN-T', 'SH-RH', 'SH-PRESSURE', 'SH-DILUENT'],
    prevention: 'The habitat works as a closed ecosystem with constant air filtering and water recycling. The crew regularly disinfects surfaces and takes swab samples so that dangerous bacteria and moulds, which could attack a weakened immune system, do not spread on board.',
  },
];
