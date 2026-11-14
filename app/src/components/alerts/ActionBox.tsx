// "What to do now" for one rule result (.odt part 5): a short title, details on demand.
import type { RuleResult } from '../../types';
import { actionFor } from '../../engine/actions';
import { GROUND_CONTACT_NOTE } from '../../data/hazards';
import { VerifyTag } from '../common';

const ICON = { emergency: '🚨', surgeon: '📡', treat: '⚕', rest: '⏸', remeasure: '↻' };
const COLOR = { emergency: 'var(--red)', surgeon: 'var(--red)', treat: 'var(--orange)', rest: 'var(--orange)', remeasure: 'var(--grey)' };

export default function ActionBox({ result, compact }: { result: RuleResult; compact?: boolean }) {
  const a = actionFor(result);
  if (!a) return null;
  return (
    <div style={{ borderLeft: `3px solid ${COLOR[a.level]}`, padding: '6px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
      <div style={{ fontWeight: 600, color: COLOR[a.level] }}>{ICON[a.level]} {a.title}</div>
      {!compact && (
        <details className="more">
          <summary>More</summary>
          <div className="dim" style={{ fontSize: 16 }}>{a.detail}</div>
          {a.showGroundNote && (
            <div className="dim" style={{ fontSize: 15, marginTop: 6 }}>🛰 {GROUND_CONTACT_NOTE} <VerifyTag text="Wording needs verification" /></div>
          )}
        </details>
      )}
    </div>
  );
}
