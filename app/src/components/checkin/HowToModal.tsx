// "How to measure" help in the 7-heading structure from AI measure.txt. All steps are drafts (needs verification).
import { EXPLANATIONS } from '../../data/explanations';
import { MASCOT_IMAGES } from '../../data/mascot';
import { Modal, VerifyTag } from '../common';

// Tutorial videos live in the repository root (outside Vite's app/public directory).
const TUTORIAL_VIDEO: Record<string, string> = {
  bp: 'https://raw.githubusercontent.com/ZeinerMax/NASAspaceApps/main/BloodPressure.mp4',
  hr: 'https://raw.githubusercontent.com/ZeinerMax/NASAspaceApps/main/HeartRate.mp4',
  glucose: 'https://raw.githubusercontent.com/ZeinerMax/NASAspaceApps/main/BloodSugar.mp4',
  mass: 'https://raw.githubusercontent.com/ZeinerMax/NASAspaceApps/main/BodyMass.mp4',
  temp: 'https://raw.githubusercontent.com/ZeinerMax/NASAspaceApps/main/BodyTemp.mp4',
  food: 'https://raw.githubusercontent.com/ZeinerMax/NASAspaceApps/main/FoodInTake.mp4',
  mood: 'https://raw.githubusercontent.com/ZeinerMax/NASAspaceApps/main/MoodScore.mp4',
  spo2: 'https://raw.githubusercontent.com/ZeinerMax/NASAspaceApps/main/Oxygen.mp4',
  sleep: 'https://raw.githubusercontent.com/ZeinerMax/NASAspaceApps/main/Sleep.mp4',
  symptoms: 'https://raw.githubusercontent.com/ZeinerMax/NASAspaceApps/main/Symptoms.mp4',
  training: 'https://raw.githubusercontent.com/ZeinerMax/NASAspaceApps/main/Training.mp4',
};

export default function HowToModal({ id, onClose }: { id: string; onClose: () => void }) {
  const ex = EXPLANATIONS[id];
  if (!ex) return null;
  const h = ex.howTo;
  const videoUrl = TUTORIAL_VIDEO[id];
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
      wide
      footer={<><VerifyTag /><span className="dim" style={{ fontSize: 15 }}>Draft written for this prototype. Check against the mission's medical procedures.</span></>}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {videoUrl && (
          <section aria-label={`${ex.title} tutorial video`}>
            <div className="section-title" style={{ marginBottom: 8 }}>Video tutorial</div>
            <div style={{ padding: 8, border: '1px solid var(--panel-border)', borderRadius: 16, background: 'rgba(2, 8, 24, 0.72)' }}>
              <video
                controls
                playsInline
                preload="metadata"
                aria-label={`${ex.title} measurement tutorial`}
                style={{ display: 'block', width: '100%', maxHeight: 'min(42vh, 420px)', borderRadius: 10, background: '#020816', objectFit: 'contain' }}
              >
                <source src={videoUrl} type="video/mp4" />
                Your browser does not support embedded video.
              </video>
            </div>
          </section>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: '8px 28px' }}>
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
      </div>
    </Modal>
  );
}
