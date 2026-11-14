// Small shared UI pieces.
import type { ReactNode } from 'react';
import type { RuleState, Status } from '../types';

export const STATUS_LABEL: Record<Status, string> = {
  green: 'Healthy', orange: 'Warning', red: 'Act now', grey: 'No data', info: 'Not rated',
};

export const STATUS_COLOR: Record<Status, string> = {
  green: '#34d399', orange: '#ff9a3c', red: '#ff4d6d', grey: '#7c879f', info: '#6aa8ff',
};

export function StatusChip({ status, label }: { status: Status; label?: string }) {
  return (
    <span className={`chip s-${status}`}>
      <span className={`dot ${status === 'red' ? 'pulse' : ''}`} />
      {label ?? STATUS_LABEL[status]}
    </span>
  );
}

export function RuleStateChip({ state }: { state: RuleState }) {
  const s: Status = state === 'firing' ? 'red' : state === 'watch' ? 'orange' : 'green';
  return <StatusChip status={s} label={state === 'OK' ? 'OK' : state === 'watch' ? 'Watch' : 'Firing'} />;
}

export const SimTag = () => <span className="tag tag-sim">SIMULATED</span>;
export const VerifyTag = ({ text = 'Needs verification' }: { text?: string }) => <span className="tag">{text}</span>;
export const TeamTag = () => <span className="tag tag-team">Team decision</span>;

export function Modal({ title, icon, onClose, children, footer, wide }: {
  title: ReactNode; icon?: ReactNode; onClose: () => void; children: ReactNode; footer?: ReactNode; wide?: boolean;
}) {
  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" style={wide ? { width: 'min(1100px, 100%)' } : undefined}>
        <div className="modal-head">
          {icon}
          <h2 style={{ flex: 1 }}>{title}</h2>
          <button className="btn btn-ghost btn-sm" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  );
}
