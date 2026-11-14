// Every warning rule with its trigger text, inputs, current value and OK / watch / firing state.
import { useState } from 'react';
import type { RuleResult } from '../../types';
import type { DayView } from '../../store/useCrewView';
import { RULES } from '../../data/rules';
import { RuleStateChip, StatusChip, TeamTag, VerifyTag } from '../common';

const GROUPS = [
  { id: 'crew', title: 'Crew health', note: 'Excel sheet "Crew health". Evaluated on the selected flight day.' },
  { id: 'ship', title: 'Ship environment & radiation', note: 'Excel sheet "Cabin & radiation". Cabin values are SIMULATED; radiation from radiation.json.' },
  { id: 'cross', title: 'Cross rules', note: 'Links between indicators, taken from notes in the team files.' },
] as const;

export default function RulesTab({ day, ship }: { day: DayView; ship: RuleResult[] }) {
  const [filter, setFilter] = useState<'all' | 'active'>('all');
  const byId = new Map([...day.results, ...ship].map((r) => [r.ruleId, r]));
  const counts = { OK: 0, watch: 0, firing: 0 };
  for (const r of byId.values()) counts[r.ruleState]++;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: 140 }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <p className="dim" style={{ flex: 1, minWidth: 300 }}>
          Simple, explainable rules, no machine learning. Thresholds come from the team's Excel table (cell shown for each rule). Colours mark the priority of a check, not a diagnosis.
        </p>
        <RuleStateChip state="OK" /> <span className="mono">{counts.OK}</span>
        <RuleStateChip state="watch" /> <span className="mono">{counts.watch}</span>
        <RuleStateChip state="firing" /> <span className="mono">{counts.firing}</span>
        <select className="input" style={{ width: 'auto' }} value={filter} onChange={(e) => setFilter(e.target.value as 'all' | 'active')}>
          <option value="all">All rules</option>
          <option value="active">Only watch / firing</option>
        </select>
      </div>
      {GROUPS.map((g) => {
        const rules = RULES.filter((r) => r.group === g.id).filter((r) => filter === 'all' || (byId.get(r.id)?.ruleState ?? 'OK') !== 'OK');
        if (!rules.length) return null;
        return (
          <section key={g.id} className="panel" style={{ padding: 16 }}>
            <h3>{g.title}</h3>
            <p className="faint" style={{ fontSize: 14, marginBottom: 10 }}>{g.note}</p>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 16 }}>
                <thead>
                  <tr className="faint" style={{ textAlign: 'left', fontSize: 14 }}>
                    {['State', 'Rule', 'Orange when', 'Red when', 'Data used', 'Current value', 'Basis / source'].map((h) => (
                      <th key={h} style={{ padding: '8px 10px', borderBottom: '1px solid var(--panel-border)', fontWeight: 600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rules.map((rule) => {
                    const res = byId.get(rule.id);
                    return (
                      <tr key={rule.id} style={{ verticalAlign: 'top', borderBottom: '1px dashed rgba(120,160,255,0.12)' }}>
                        <td style={{ padding: '10px' }}>{res ? <RuleStateChip state={res.ruleState} /> : '—'}</td>
                        <td style={{ padding: '10px', minWidth: 180 }}>
                          <strong>{rule.label}</strong> <span className="faint" style={{ fontSize: 13 }}>{rule.unit}</span>
                          <div className="faint mono" style={{ fontSize: 12 }}>{rule.id}</div>
                          {rule.green !== '—' && <div style={{ fontSize: 14, color: 'var(--green)' }}>Green: {rule.green}</div>}
                        </td>
                        <td style={{ padding: '10px', color: 'var(--orange)', minWidth: 160 }}>{rule.orange}</td>
                        <td style={{ padding: '10px', color: 'var(--red)', minWidth: 160 }}>{rule.red}</td>
                        <td style={{ padding: '10px' }} className="mono dim">{rule.inputs.join(', ')}</td>
                        <td style={{ padding: '10px', minWidth: 180 }}>
                          {res ? <><StatusChip status={res.status} /><div className="mono" style={{ fontSize: 14, marginTop: 4 }}>{res.valueLabel}</div><div className="dim" style={{ fontSize: 14 }}>{res.reason}</div></> : '—'}
                        </td>
                        <td style={{ padding: '10px', minWidth: 200, fontSize: 14 }}>
                          <div>{rule.basis}</div>
                          <div className="faint">{rule.sourceRef}</div>
                          {rule.note && <div className="dim" style={{ marginTop: 4 }}>{rule.note}</div>}
                          {rule.teamDecisions.map((t) => <div key={t} style={{ marginTop: 4 }}><TeamTag /> {t}</div>)}
                          {rule.placeholders.map((t) => <div key={t} style={{ marginTop: 4 }}><VerifyTag text="Placeholder" /> {t}</div>)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        );
      })}
    </div>
  );
}
