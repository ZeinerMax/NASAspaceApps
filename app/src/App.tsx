// App shell: header, landing page / crew detail / rules page, check-in wizard, results, disclaimer.
import { useEffect } from 'react';
import { useAppStore, type Tab } from './store/useAppStore';
import { CREW } from './data/crew';
import type { CrewId } from './types';
import { SHIP_TICK_MS } from './sim/shipFeed';
import Header from './components/layout/Header';
import DisclaimerBar from './components/layout/DisclaimerBar';
import Landing from './components/landing/Landing';
import CrewDetail from './components/crew/CrewDetail';
import RulesPage from './components/rules/RulesPage';
import CheckInWizard from './components/checkin/CheckInWizard';
import ScanResults from './components/alerts/ScanResults';

const TAB_IDS: Tab[] = ['details', 'trends', 'problems', 'tutorials'];

export default function App() {
  const selected = useAppStore((s) => s.selectedCrew);
  const showRules = useAppStore((s) => s.showRules);
  const tab = useAppStore((s) => s.tab);
  const checkInFor = useAppStore((s) => s.checkInFor);
  const results = useAppStore((s) => s.lastResultsFor);
  const tickShip = useAppStore((s) => s.tickShip);
  const mascotOpen = useAppStore((s) => s.mascotOpen);
  const landing = !selected && !showRules;
  const detailsView = Boolean(selected && !showRules && tab === 'details');
  const scrollableView = Boolean(selected && !showRules && tab !== 'details');

  useEffect(() => {
    const root = document.getElementById('root');
    root?.classList.toggle('fit', landing || detailsView);
    root?.classList.toggle('scrollable-page', scrollableView);
    return () => root?.classList.remove('fit', 'scrollable-page');
  }, [landing, detailsView, scrollableView]);

  // Deep links (handy for presenting): #/ landing · #/rules · #/F01/details · #/F01/trends · #/F01/problems · #/F01/tutorials
  useEffect(() => {
    const [a, b] = location.hash.replace(/^#\/?/, '').split('/');
    const st = useAppStore.getState();
    if (a === 'rules') st.setRules(true);
    else if (CREW.some((c) => c.id === a)) {
      st.selectCrew(a as CrewId);
      const t = b === 'body' ? 'details' : b;
      if (t && TAB_IDS.includes(t as Tab)) st.setTab(t as Tab);
    }
  }, []);

  useEffect(() => {
    const h = showRules ? '#/rules' : selected ? `#/${selected}/${tab}` : '#/';
    if (location.hash !== h) history.replaceState(null, '', h + location.search);
  }, [selected, tab, showRules]);

  useEffect(() => {
    document.getElementById('root')?.classList.toggle('mascot-open', mascotOpen);
  }, [mascotOpen]);

  useEffect(() => {
    const id = setInterval(tickShip, SHIP_TICK_MS);
    return () => clearInterval(id);
  }, [tickShip]);

  return (
    <>
      <Header />
      <main className={`app-main ${landing ? 'landing-main' : ''} ${detailsView ? 'detail-main' : ''}`}>
        {showRules ? <RulesPage /> : selected ? <CrewDetail crewId={selected} /> : <Landing />}
      </main>
      <DisclaimerBar />
      {checkInFor && <CheckInWizard crewId={checkInFor} />}
      {results && <ScanResults crewId={results.crewId} flightDay={results.flightDay} />}
    </>
  );
}
