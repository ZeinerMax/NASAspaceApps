// App shell: header, overview or crew detail, check-in wizard, results, mascot, disclaimer.
import { useEffect } from 'react';
import { useAppStore, type Tab } from './store/useAppStore';
import { CREW } from './data/crew';
import type { CrewId } from './types';

const TAB_IDS: Tab[] = ['body', 'trends', 'rules', 'problems', 'ship'];
import { SHIP_TICK_MS } from './sim/shipFeed';
import Header from './components/layout/Header';
import DisclaimerBar from './components/layout/DisclaimerBar';
import CrewOverview from './components/crew/CrewOverview';
import CrewDetail from './components/crew/CrewDetail';
import CheckInWizard from './components/checkin/CheckInWizard';
import ScanResults from './components/alerts/ScanResults';

export default function App() {
  const selected = useAppStore((s) => s.selectedCrew);
  const checkInFor = useAppStore((s) => s.checkInFor);
  const results = useAppStore((s) => s.lastResultsFor);
  const tickShip = useAppStore((s) => s.tickShip);

  // Deep links: #/F02/trends opens a crew member and tab directly (handy for presenting).
  const tab = useAppStore((s) => s.tab);
  useEffect(() => {
    const [crew, t] = location.hash.replace(/^#\/?/, '').split('/');
    if (CREW.some((c) => c.id === crew)) {
      useAppStore.getState().selectCrew(crew as CrewId);
      if (t && TAB_IDS.includes(t as Tab)) useAppStore.getState().setTab(t as Tab);
    }
  }, []);
  useEffect(() => {
    const h = selected ? `#/${selected}/${tab}` : '#/';
    if (location.hash !== h) history.replaceState(null, '', h);
  }, [selected, tab]);

  // Simulated ship feed: runs for the whole session.
  useEffect(() => {
    const id = setInterval(tickShip, SHIP_TICK_MS);
    return () => clearInterval(id);
  }, [tickShip]);

  return (
    <>
      <Header />
      <main className="app-main">{selected ? <CrewDetail crewId={selected} /> : <CrewOverview />}</main>
      <DisclaimerBar />
      {checkInFor && <CheckInWizard crewId={checkInFor} />}
      {results && <ScanResults crewId={results.crewId} flightDay={results.flightDay} />}
    </>
  );
}
