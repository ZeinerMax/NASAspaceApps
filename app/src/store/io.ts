// Export / import of the user's stored data as JSON (PLAN.md §4.2). The repo files are never written.
import type { DailyEntry, StoredState } from '../types';
import { useAppStore } from './useAppStore';

export function exportJson() {
  const { userEntries, lastCheckInDate } = useAppStore.getState();
  const payload = { app: 'astro-health-dashboard', exportedAt: new Date().toISOString(), version: 1, userEntries, lastCheckInDate };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `astro-health-export-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

const isEntry = (e: unknown): e is DailyEntry => {
  const x = e as DailyEntry;
  return !!x && typeof x.crewId === 'string' && typeof x.flightDay === 'number' && Array.isArray(x.symptoms) && typeof x.bp === 'object';
};

/** Returns an error message, or null on success. */
export async function importJson(file: File): Promise<string | null> {
  try {
    const data = JSON.parse(await file.text());
    if (data?.version !== 1 || !Array.isArray(data.userEntries)) return 'Not an export from this app (version 1).';
    if (!data.userEntries.every(isEntry)) return 'The file contains entries in an unknown format.';
    const st: StoredState = { version: 1, userEntries: data.userEntries, lastCheckInDate: data.lastCheckInDate ?? {} };
    useAppStore.getState().replaceStored(st);
    return null;
  } catch {
    return 'Could not read the file as JSON.';
  }
}
