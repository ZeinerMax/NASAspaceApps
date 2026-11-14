// Global app state (Zustand). Only user entries and check-in dates are persisted (localStorage key 'astroHealth.v1').
// Seed data is never stored: it is always re-loaded from the generated seed.json.
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { CrewId, DailyEntry, ShipReading, StoredState } from '../types';
import { initialReading, nextReading, SHIP_HISTORY_LENGTH } from '../sim/shipFeed';

export const STORAGE_KEY = 'astroHealth.v1';

export type Tab = 'body' | 'trends' | 'rules' | 'problems' | 'ship';

interface AppState extends Omit<StoredState, 'version'> {
  // navigation (not persisted)
  selectedCrew: CrewId | null;
  tab: Tab;
  viewDay: number | null; // null = latest day
  checkInFor: CrewId | null;
  lastResultsFor: { crewId: CrewId; flightDay: number } | null;
  // ship feed (not persisted)
  ship: ShipReading;
  shipHistory: ShipReading[];

  selectCrew: (id: CrewId | null) => void;
  setTab: (t: Tab) => void;
  setViewDay: (d: number | null) => void;
  openCheckIn: (id: CrewId | null) => void;
  addEntry: (e: DailyEntry, isoDate: string) => void;
  dismissResults: () => void;
  replaceStored: (s: StoredState) => void;
  resetToSeed: () => void;
  tickShip: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      userEntries: [],
      lastCheckInDate: {},
      selectedCrew: null,
      tab: 'body',
      viewDay: null,
      checkInFor: null,
      lastResultsFor: null,
      ship: initialReading(),
      shipHistory: [],

      selectCrew: (id) => set({ selectedCrew: id, viewDay: null, tab: 'body' }),
      setTab: (tab) => set({ tab }),
      setViewDay: (viewDay) => set({ viewDay }),
      openCheckIn: (checkInFor) => set({ checkInFor }),
      addEntry: (e, isoDate) =>
        set((s) => ({
          userEntries: [...s.userEntries, e],
          lastCheckInDate: { ...s.lastCheckInDate, [e.crewId]: isoDate },
          checkInFor: null,
          selectedCrew: e.crewId,
          viewDay: null,
          tab: 'body',
          lastResultsFor: { crewId: e.crewId, flightDay: e.flightDay },
        })),
      dismissResults: () => set({ lastResultsFor: null }),
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
