// "How to measure" help in the 7-heading structure from AI measure.txt. All steps are drafts (needs verification).
import { EXPLANATIONS } from '../../data/explanations';
import { MASCOT_IMAGES } from '../../data/mascot';
import { Modal, VerifyTag } from '../common';

export default function HowToModal({ id, onClose }: { id: string; onClose: () => void }) {
  const ex = EXPLANATIONS[id];
  if (!ex) return null;
  const h = ex.howTo;
  const Sec = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <section style={{ marginBottom: 16 }}>
      <div className="section-title" style={{ marginBottom: 4 }}>{title}</div>
      {children}
    </section>
  );
  return (
    <Modal
      title={<>How to measure: {ex.title}</>}
      icon={<img src={MASCOT_IMAGES[ex.mascot]} alt="" style={{ width: 52, height: 62, objectFit: 'contain', background: '#f6f8ff', borderRadius: 10, padding: 3 }} />}
      onClose={onClose}
      footer={<><VerifyTag /><span className="dim" style={{ fontSize: 15 }}>Draft written for this prototype. Check against the mission's medical procedures.</span></>}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div>
          <Sec title="What does it mean?"><p>{ex.meaning}</p></Sec>
          <Sec title="Why the risk matters"><p className="dim">{ex.why}</p></Sec>
          <Sec title="What are you measuring?"><p>{h.what}</p></Sec>
          <Sec title="Required equipment"><p>{h.equipment}</p></Sec>
          {h.before.length > 0 && <Sec title="Before you start"><ul style={{ margin: 0, paddingLeft: 20 }}>{h.before.map((b) => <li key={b}>{b}</li>)}</ul></Sec>}
        </div>
        <div>
          <Sec title="Step by step"><ol style={{ margin: 0, paddingLeft: 22 }}>{h.steps.map((s) => <li key={s} style={{ marginBottom: 4 }}>{s}</li>)}</ol></Sec>
          <Sec title="How to enter the result"><p>{h.enter}</p></Sec>
          <Sec title="Common mistakes"><ul style={{ margin: 0, paddingLeft: 20 }}>{h.mistakes.map((m) => <li key={m}>{m}</li>)}</ul></Sec>
          <Sec title="Important safety information"><p style={{ color: 'var(--orange)' }}>{h.safety}</p></Sec>
        </div>
      </div>
    </Modal>
  );
}
