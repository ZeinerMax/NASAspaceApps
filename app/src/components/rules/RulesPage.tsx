// Rules page (opened from the header). The rules content is the same as before; it is shown for one crew member
// (pick with the selector) together with the ship rules.
import { useCallback } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { useAllCrew, useDayView, useShipResults } from '../../store/useCrewView';
import CrewSelector from '../crew/CrewSelector';
import RulesTab from './RulesTab';

export default function RulesPage() {
  const crewId = useAppStore((s) => s.selectedCrew ?? s.landingCrew);
  const setLandingCrew = useAppStore((s) => s.setLandingCrew);
  const selectedCrew = useAppStore((s) => s.selectedCrew);
  const selectCrew = useAppStore((s) => s.selectCrew);
  const setRules = useAppStore((s) => s.setRules);
  const { latest } = useAllCrew();
  const { day } = useDayView(crewId);
  const ship = useShipResults(day.entry.flightDay);

  // switch crew: keep the Rules page open
  const change = useCallback((id: typeof crewId) => {
    if (selectedCrew) { selectCrew(id); setRules(true); } else setLandingCrew(id);
  }, [selectedCrew, selectCrew, setRules, setLandingCrew]);

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <h2>Rules</h2>
        <CrewSelector value={crewId} onChange={change} latest={latest} />
        <span className="dim">Day {day.entry.flightDay}</span>
      </div>
      <RulesTab day={day} ship={ship} />
    </>
  );
}
