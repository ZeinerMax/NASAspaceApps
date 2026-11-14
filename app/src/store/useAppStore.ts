// Global app state (Zustand). Only user entries and check-in dates are persisted (localStorage key 'astroHealth.v1').
// Seed data is never stored: it is always re-loaded from the generated seed.json.
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { CrewId, DailyEntry, ShipReading, StoredState } from '../types';
import { initialReading, nextReading, SHIP_HISTORY_LENGTH } from '../sim/shipFeed';

export const STORAGE_KEY = 'astroHealth.v1';
const MASCOT_KEY = 'astroHealth.mascotOpen';

export type Tab = 'details' | 'trends' | 'problems' | 'tutorials';

const readMascotOpen = () => {
  try { return sessionStorage.getItem(MASCOT_KEY) !== '0'; } catch { return true; }
};

interface AppState extends Omit<StoredState, 'version'> {
  // navigation (not persisted)
  landingCrew: CrewId; // crew member shown on the landing page
  selectedCrew: CrewId | null; // crew member whose detail view is open (null = landing page)
  showRules: boolean;
  tab: Tab;
  viewDay: number | null; // null = latest day
  checkInFor: CrewId | null;
  lastResultsFor: { crewId: CrewId; flightDay: number } | null;
  mascotOpen: boolean; // remembered for the browser session (sessionStorage)
  // ship feed (not persisted)
  ship: ShipReading;
  shipHistory: ShipReading[];

  setLandingCrew: (id: CrewId) => void;
  selectCrew: (id: CrewId | null) => void;
  setRules: (open: boolean) => void;
  setTab: (t: Tab) => void;
  setViewDay: (d: number | null) => void;
  openCheckIn: (id: CrewId | null) => void;
  addEntry: (e: DailyEntry, isoDate: string) => void;
  dismissResults: () => void;
  setMascotOpen: (open: boolean) => void;
  replaceStored: (s: StoredState) => void;
  resetToSeed: () => void;
  tickShip: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      userEntries: [],
      lastCheckInDate: {},
      landingCrew: 'F01',
      selectedCrew: null,
      showRules: false,
      tab: 'details',
      viewDay: null,
      checkInFor: null,
      lastResultsFor: null,
      mascotOpen: readMascotOpen(),
      ship: initialReading(),
      shipHistory: [],

      setLandingCrew: (landingCrew) => set({ landingCrew }),
      selectCrew: (id) => set((s) => ({ selectedCrew: id, showRules: false, viewDay: null, tab: 'details', landingCrew: id ?? s.landingCrew })),
      setRules: (showRules) => set({ showRules }),
      setTab: (tab) => set({ tab }),
      setViewDay: (viewDay) => set({ viewDay }),
      openCheckIn: (checkInFor) => set({ checkInFor }),
      addEntry: (e, isoDate) =>
        set((s) => ({
          userEntries: [...s.userEntries, e],
          lastCheckInDate: { ...s.lastCheckInDate, [e.crewId]: isoDate },
          checkInFor: null,
          selectedCrew: e.crewId,
          landingCrew: e.crewId,
          showRules: false,
          viewDay: null,
          tab: 'details',
          lastResultsFor: { crewId: e.crewId, flightDay: e.flightDay },
        })),
      dismissResults: () => set({ lastResultsFor: null }),
      setMascotOpen: (mascotOpen) => {
        try { sessionStorage.setItem(MASCOT_KEY, mascotOpen ? '1' : '0'); } catch { /* private mode: keep in memory only */ }
        set({ mascotOpen });
      },
      replaceStored: (st) => set({ userEntries: st.userEntries, lastCheckInDate: st.lastCheckInDate, viewDay: null }),
      resetToSeed: () => set({ userEntries: [], lastCheckInDate: {}, viewDay: null, lastResultsFor: null }),
      tickShip: () =>
        set((s) => {
          const next = nextReading(s.ship);
          return { ship: next, shipHistory: [...s.shipHistory, next].slice(-SHIP_HISTORY_LENGTH) };
        }),
    }),
    {
      name: STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ userEntries: s.userEntries, lastCheckInDate: s.lastCheckInDate }),
    },
  ),
);

export const todayIso = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
