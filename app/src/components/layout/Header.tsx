import { useRef, useState } from 'react';
import { CREW } from '../../data/crew';
import { useAppStore } from '../../store/useAppStore';
import { exportJson, importJson } from '../../store/io';
import { useAllCrew } from '../../store/useCrewView';
import { STATUS_COLOR } from '../common';

export default function Header() {
  const selected = useAppStore((s) => s.selectedCrew);
  const showRules = useAppStore((s) => s.showRules);
  const selectCrew = useAppStore((s) => s.selectCrew);
  const setRules = useAppStore((s) => s.setRules);
  const resetToSeed = useAppStore((s) => s.resetToSeed);
  const nUser = useAppStore((s) => s.userEntries.length);
  const { latest } = useAllCrew();
  const [menu, setMenu] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const home = () => { selectCrew(null); setRules(false); };
  const onImport = async (f: File | undefined) => {
    if (!f) return;
    const err = await importJson(f);
    setMsg(err ?? 'Import complete.');
    setMenu(false);
    setTimeout(() => setMsg(null), 3500);
  };

  return (
    <header className="header">
      <button className="brand btn-ghost" style={{ border: 'none', background: 'none', padding: 0 }} onClick={home}>
        <span className="brand-mark">✦</span>
        <h1 style={{ fontSize: 22 }}>Astronaut Health Monitor</h1>
      </button>

      {selected && !showRules && (
        <div style={{ display: 'flex', gap: 8, marginLeft: 12 }}>
          <button className="btn btn-sm" onClick={home}>← Back</button>
          {CREW.map((c) => (
            <button key={c.id} className="btn btn-sm" onClick={() => selectCrew(c.id)} style={selected === c.id ? { borderColor: 'var(--accent)', background: 'rgba(94,231,255,0.12)' } : undefined}>
              <span className="dot" style={{ background: STATUS_COLOR[latest[c.id].overall] }} /> {c.id}
            </button>
          ))}
        </div>
      )}
      {showRules && <button className="btn btn-sm" style={{ marginLeft: 12 }} onClick={() => setRules(false)}>← Back</button>}

      <div className="spacer" />
      {msg && <span className="dim" style={{ fontSize: 15 }}>{msg}</span>}
      <button className="btn btn-sm" aria-pressed={showRules} style={showRules ? { borderColor: 'var(--accent)' } : undefined} onClick={() => setRules(!showRules)}>Rules</button>
      <div style={{ position: 'relative' }}>
        <button className="btn btn-sm" onClick={() => setMenu((m) => !m)} aria-expanded={menu}>
          Data {nUser > 0 && <span className="faint">· {nUser}</span>} ▾
        </button>
        {menu && (
          <div className="panel" style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', padding: 8, width: 230, display: 'grid', gap: 4, zIndex: 30, background: 'var(--panel-solid)' }}>
            <button className="btn btn-ghost btn-sm" onClick={() => { exportJson(); setMenu(false); }}>⬇ Export JSON</button>
            <button className="btn btn-ghost btn-sm" onClick={() => fileRef.current?.click()}>⬆ Import JSON…</button>
            <button className="btn btn-ghost btn-sm" style={{ color: 'var(--red)' }}
              onClick={() => {
                if (confirm('Delete all new check-ins in this browser and go back to the seed data?')) resetToSeed();
                setMenu(false);
              }}>
              ↺ Reset to seed data
            </button>
          </div>
        )}
        <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={(e) => onImport(e.target.files?.[0])} />
      </div>
    </header>
  );
}
