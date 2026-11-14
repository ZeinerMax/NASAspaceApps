import { useRef, useState } from 'react';
import { CREW } from '../../data/crew';
import { useAppStore } from '../../store/useAppStore';
import { exportJson, importJson } from '../../store/io';
import { useTimeline } from '../../store/useCrewView';
import type { CrewId } from '../../types';

function CrewPill({ id }: { id: CrewId }) {
  const selected = useAppStore((s) => s.selectedCrew);
  const selectCrew = useAppStore((s) => s.selectCrew);
  const tl = useTimeline(id);
  const st = tl[tl.length - 1].overall;
  return (
    <button className={`btn btn-sm s-${st}`} onClick={() => selectCrew(id)}
      style={selected === id ? { borderColor: 'var(--accent)', background: 'rgba(94,231,255,0.12)' } : undefined}>
      <span className={`dot ${st === 'red' ? 'pulse' : ''}`} /> {id}
    </button>
  );
}

export default function Header() {
  const selected = useAppStore((s) => s.selectedCrew);
  const selectCrew = useAppStore((s) => s.selectCrew);
  const resetToSeed = useAppStore((s) => s.resetToSeed);
  const nUser = useAppStore((s) => s.userEntries.length);
  const [menu, setMenu] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const onImport = async (f: File | undefined) => {
    if (!f) return;
    const err = await importJson(f);
    setMsg(err ?? 'Import complete.');
    setMenu(false);
    setTimeout(() => setMsg(null), 3500);
  };

  return (
    <header className="header">
      <button className="brand btn-ghost" style={{ border: 'none', background: 'none', padding: 0 }} onClick={() => selectCrew(null)}>
        <span className="brand-mark">✦</span>
        <span style={{ textAlign: 'left' }}>
          <h1 style={{ fontSize: 22 }}>Astronaut Health Monitor</h1>
          <span className="faint" style={{ fontSize: 14 }}>NASA Space Apps 2026 · crew health dashboard</span>
        </span>
      </button>

      {selected && (
        <div style={{ display: 'flex', gap: 8, marginLeft: 16 }}>
          <button className="btn btn-sm" onClick={() => selectCrew(null)}>← All crew</button>
          {CREW.map((c) => <CrewPill key={c.id} id={c.id} />)}
        </div>
      )}

      <div className="spacer" />
      {msg && <span className="dim" style={{ fontSize: 15 }}>{msg}</span>}
      <div style={{ position: 'relative' }}>
        <button className="btn btn-sm" onClick={() => setMenu((m) => !m)} aria-expanded={menu}>
          Data {nUser > 0 && <span className="faint">· {nUser} new</span>} ▾
        </button>
        {menu && (
          <div className="panel" style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', padding: 8, width: 260, display: 'grid', gap: 4, zIndex: 30, background: 'var(--panel-solid)' }}>
            <button className="btn btn-ghost btn-sm" onClick={() => { exportJson(); setMenu(false); }}>⬇ Export data as JSON</button>
            <button className="btn btn-ghost btn-sm" onClick={() => fileRef.current?.click()}>⬆ Import JSON…</button>
            <button className="btn btn-ghost btn-sm" style={{ color: 'var(--red)' }}
              onClick={() => {
                if (confirm('Delete all new check-ins in this browser and go back to the seed data?')) resetToSeed();
                setMenu(false);
              }}>
              ↺ Reset to seed data
            </button>
            <p className="faint" style={{ fontSize: 13, padding: '4px 10px' }}>New check-ins are saved in this browser only. Export before switching computers.</p>
          </div>
        )}
        <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={(e) => onImport(e.target.files?.[0])} />
      </div>
    </header>
  );
}
